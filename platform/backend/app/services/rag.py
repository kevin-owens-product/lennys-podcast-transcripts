import uuid

import openai
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.transcript import Transcript, TranscriptChunk

client = openai.AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None


async def get_embedding(text: str) -> list[float]:
    if not client:
        raise ValueError("OPENAI_API_KEY not configured")
    response = await client.embeddings.create(input=text, model=settings.embedding_model)
    return response.data[0].embedding


async def semantic_search(
    db: AsyncSession,
    query: str,
    tenant_id: uuid.UUID,
    limit: int = 10,
    guest_filter: str | None = None,
    min_similarity: float = 0.3,
) -> list[dict]:
    query_embedding = await get_embedding(query)
    embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

    sql = text("""
        SELECT
            c.id,
            c.text,
            c.speaker,
            c.timestamp,
            c.chunk_index,
            t.guest,
            t.title,
            t.guest_slug,
            t.id as transcript_id,
            1 - (c.embedding <=> :embedding::vector) as similarity
        FROM transcript_chunks c
        JOIN transcripts t ON c.transcript_id = t.id
        WHERE c.tenant_id = :tenant_id
            AND c.embedding IS NOT NULL
            AND 1 - (c.embedding <=> :embedding::vector) >= :min_similarity
            {guest_filter}
        ORDER BY c.embedding <=> :embedding::vector
        LIMIT :limit
    """.format(
        guest_filter="AND t.guest_slug = :guest_slug" if guest_filter else ""
    ))

    params = {
        "embedding": embedding_str,
        "tenant_id": tenant_id,
        "min_similarity": min_similarity,
        "limit": limit,
    }
    if guest_filter:
        params["guest_slug"] = guest_filter

    result = await db.execute(sql, params)
    rows = result.fetchall()

    return [
        {
            "chunk_text": row.text,
            "speaker": row.speaker,
            "timestamp": row.timestamp,
            "guest": row.guest,
            "title": row.title,
            "guest_slug": row.guest_slug,
            "transcript_id": row.transcript_id,
            "similarity": round(row.similarity, 4),
        }
        for row in rows
    ]


async def keyword_search(
    db: AsyncSession,
    query: str,
    tenant_id: uuid.UUID,
    limit: int = 20,
    guest_filter: str | None = None,
) -> list[dict]:
    stmt = (
        select(TranscriptChunk, Transcript)
        .join(Transcript, TranscriptChunk.transcript_id == Transcript.id)
        .where(
            TranscriptChunk.tenant_id == tenant_id,
            TranscriptChunk.text.ilike(f"%{query}%"),
        )
    )
    if guest_filter:
        stmt = stmt.where(Transcript.guest_slug == guest_filter)
    stmt = stmt.limit(limit)

    result = await db.execute(stmt)
    rows = result.all()

    return [
        {
            "chunk_text": chunk.text,
            "speaker": chunk.speaker,
            "timestamp": chunk.timestamp,
            "guest": transcript.guest,
            "title": transcript.title,
            "guest_slug": transcript.guest_slug,
            "transcript_id": transcript.id,
            "similarity": 1.0,
        }
        for chunk, transcript in rows
    ]


async def build_context(search_results: list[dict], max_chunks: int = 10) -> str:
    chunks = search_results[:max_chunks]
    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        speaker = f" ({chunk['speaker']})" if chunk.get("speaker") else ""
        ts = f" [{chunk['timestamp']}]" if chunk.get("timestamp") else ""
        context_parts.append(
            f"[Source {i}: {chunk['guest']} - \"{chunk['title']}\"{speaker}{ts}]\n{chunk['chunk_text']}"
        )
    return "\n\n---\n\n".join(context_parts)
