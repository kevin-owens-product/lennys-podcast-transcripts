import os
import re
import uuid

import yaml
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.transcript import Transcript, TranscriptChunk
from app.services.rag import get_embedding


def parse_transcript_file(filepath: str) -> dict | None:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    parts = content.split("---")
    if len(parts) < 3:
        return None

    try:
        metadata = yaml.safe_load(parts[1])
    except yaml.YAMLError:
        return None

    body = "---".join(parts[2:]).strip()
    return {**metadata, "full_text": body}


def chunk_transcript(text: str, chunk_size: int = 800, overlap: int = 200) -> list[dict]:
    """Split transcript into overlapping chunks, preserving speaker context."""
    # Split by speaker turns
    speaker_pattern = re.compile(r"^(.+?)\s*\((\d{2}:\d{2}:\d{2})\):\s*$", re.MULTILINE)
    segments = []
    last_end = 0
    current_speaker = None
    current_timestamp = None

    for match in speaker_pattern.finditer(text):
        if last_end > 0:
            segment_text = text[last_end : match.start()].strip()
            if segment_text:
                segments.append(
                    {"text": segment_text, "speaker": current_speaker, "timestamp": current_timestamp}
                )
        current_speaker = match.group(1).strip()
        current_timestamp = match.group(2)
        last_end = match.end()

    # Last segment
    if last_end < len(text):
        remaining = text[last_end:].strip()
        if remaining:
            segments.append({"text": remaining, "speaker": current_speaker, "timestamp": current_timestamp})

    # Combine small segments and split large ones
    chunks = []
    current_chunk = ""
    current_chunk_speaker = None
    current_chunk_ts = None

    for seg in segments:
        if len(current_chunk) + len(seg["text"]) <= chunk_size:
            if not current_chunk:
                current_chunk_speaker = seg["speaker"]
                current_chunk_ts = seg["timestamp"]
            current_chunk += f"\n\n{seg['speaker']} ({seg['timestamp']}):\n{seg['text']}" if seg[
                "speaker"
            ] else f"\n{seg['text']}"
        else:
            if current_chunk:
                chunks.append(
                    {
                        "text": current_chunk.strip(),
                        "speaker": current_chunk_speaker,
                        "timestamp": current_chunk_ts,
                    }
                )
            current_chunk = f"{seg['speaker']} ({seg['timestamp']}):\n{seg['text']}" if seg[
                "speaker"
            ] else seg["text"]
            current_chunk_speaker = seg["speaker"]
            current_chunk_ts = seg["timestamp"]

            # Split extra-long segments
            while len(current_chunk) > chunk_size:
                split_point = current_chunk[:chunk_size].rfind(". ")
                if split_point == -1:
                    split_point = chunk_size
                else:
                    split_point += 1
                chunks.append(
                    {
                        "text": current_chunk[:split_point].strip(),
                        "speaker": current_chunk_speaker,
                        "timestamp": current_chunk_ts,
                    }
                )
                current_chunk = current_chunk[split_point - overlap :].strip()

    if current_chunk.strip():
        chunks.append(
            {"text": current_chunk.strip(), "speaker": current_chunk_speaker, "timestamp": current_chunk_ts}
        )

    return chunks


async def ingest_transcripts(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    transcript_dir: str | None = None,
    with_embeddings: bool = True,
) -> dict:
    source_dir = transcript_dir or settings.transcript_dir
    stats = {"total": 0, "ingested": 0, "skipped": 0, "errors": 0}

    if not os.path.exists(source_dir):
        return {"error": f"Directory not found: {source_dir}", **stats}

    for guest_dir in sorted(os.listdir(source_dir)):
        filepath = os.path.join(source_dir, guest_dir, "transcript.md")
        if not os.path.isfile(filepath):
            continue

        stats["total"] += 1

        # Skip if already ingested for this tenant
        existing = await db.execute(
            select(Transcript).where(
                Transcript.tenant_id == tenant_id,
                Transcript.guest_slug == guest_dir,
            )
        )
        if existing.scalar_one_or_none():
            stats["skipped"] += 1
            continue

        try:
            data = parse_transcript_file(filepath)
            if not data:
                stats["errors"] += 1
                continue

            transcript = Transcript(
                tenant_id=tenant_id,
                guest=data.get("guest", guest_dir),
                guest_slug=guest_dir,
                title=data.get("title", ""),
                youtube_url=data.get("youtube_url"),
                video_id=data.get("video_id"),
                description=data.get("description"),
                duration_seconds=data.get("duration_seconds"),
                duration=data.get("duration"),
                view_count=data.get("view_count"),
                full_text=data["full_text"],
            )
            db.add(transcript)
            await db.flush()

            # Chunk and embed
            chunks = chunk_transcript(data["full_text"], settings.chunk_size, settings.chunk_overlap)
            for i, chunk_data in enumerate(chunks):
                embedding = None
                if with_embeddings:
                    try:
                        embedding = await get_embedding(chunk_data["text"])
                    except Exception:
                        pass  # Continue without embedding

                chunk = TranscriptChunk(
                    transcript_id=transcript.id,
                    tenant_id=tenant_id,
                    chunk_index=i,
                    text=chunk_data["text"],
                    speaker=chunk_data.get("speaker"),
                    timestamp=chunk_data.get("timestamp"),
                    embedding=embedding,
                    token_count=len(chunk_data["text"].split()),
                )
                db.add(chunk)

            await db.flush()
            stats["ingested"] += 1

        except Exception as e:
            stats["errors"] += 1
            continue

    await db.commit()
    return stats
