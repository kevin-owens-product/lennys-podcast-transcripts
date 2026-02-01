import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.database import get_db
from app.models.transcript import Transcript, TranscriptChunk
from app.models.user import User
from app.schemas.transcript import TranscriptDetail, TranscriptResponse

router = APIRouter(prefix="/transcripts", tags=["transcripts"])


@router.get("/", response_model=list[TranscriptResponse])
async def list_transcripts(
    x_tenant_id: str = Header(...),
    search: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(x_tenant_id)
    stmt = select(Transcript).where(Transcript.tenant_id == tenant_id)
    if search:
        stmt = stmt.where(
            Transcript.guest.ilike(f"%{search}%") | Transcript.title.ilike(f"%{search}%")
        )
    stmt = stmt.order_by(Transcript.guest).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return [TranscriptResponse.model_validate(t) for t in result.scalars().all()]


@router.get("/stats")
async def transcript_stats(
    x_tenant_id: str = Header(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(x_tenant_id)
    transcript_count = await db.execute(
        select(func.count(Transcript.id)).where(Transcript.tenant_id == tenant_id)
    )
    chunk_count = await db.execute(
        select(func.count(TranscriptChunk.id)).where(TranscriptChunk.tenant_id == tenant_id)
    )
    embedded_count = await db.execute(
        select(func.count(TranscriptChunk.id)).where(
            TranscriptChunk.tenant_id == tenant_id,
            TranscriptChunk.embedding.isnot(None),
        )
    )
    return {
        "transcripts": transcript_count.scalar(),
        "chunks": chunk_count.scalar(),
        "embedded_chunks": embedded_count.scalar(),
    }


@router.get("/guests")
async def list_guests(
    x_tenant_id: str = Header(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(x_tenant_id)
    result = await db.execute(
        select(Transcript.guest, Transcript.guest_slug, Transcript.title)
        .where(Transcript.tenant_id == tenant_id)
        .order_by(Transcript.guest)
    )
    return [{"guest": r.guest, "slug": r.guest_slug, "title": r.title} for r in result.all()]


@router.get("/{transcript_id}", response_model=TranscriptDetail)
async def get_transcript(
    transcript_id: uuid.UUID,
    x_tenant_id: str = Header(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(x_tenant_id)
    result = await db.execute(
        select(Transcript).where(Transcript.id == transcript_id, Transcript.tenant_id == tenant_id)
    )
    transcript = result.scalar_one_or_none()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return TranscriptDetail.model_validate(transcript)
