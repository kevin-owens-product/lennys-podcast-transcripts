import uuid
from datetime import datetime

from pydantic import BaseModel


class ChatSessionCreate(BaseModel):
    agent_id: uuid.UUID | None = None
    title: str = "New Chat"


class ChatSessionResponse(BaseModel):
    id: uuid.UUID
    agent_id: uuid.UUID | None
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ChatMessageCreate(BaseModel):
    content: str


class ChatMessageResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    role: str
    content: str
    sources: list | dict
    created_at: datetime

    model_config = {"from_attributes": True}
