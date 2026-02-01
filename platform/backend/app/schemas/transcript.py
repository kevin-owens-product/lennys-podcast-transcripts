import uuid
from datetime import datetime

from pydantic import BaseModel


class TranscriptResponse(BaseModel):
    id: uuid.UUID
    guest: str
    guest_slug: str
    title: str
    youtube_url: str | None
    duration: str | None
    view_count: int | None
    description: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TranscriptDetail(TranscriptResponse):
    full_text: str


class SearchQuery(BaseModel):
    query: str
    limit: int = 10
    guest_filter: str | None = None
    min_similarity: float = 0.3


class SearchResult(BaseModel):
    chunk_text: str
    guest: str
    title: str
    guest_slug: str
    timestamp: str | None
    speaker: str | None
    similarity: float
    transcript_id: uuid.UUID
