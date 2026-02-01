import uuid
from datetime import datetime

from pydantic import BaseModel


class AgentCreate(BaseModel):
    name: str
    slug: str
    description: str = ""
    agent_type: str
    system_prompt: str
    tools: dict = {}
    model: str = "gpt-4o"
    max_context_chunks: int = 10
    temperature: float = 0.7
    is_global: bool = False


class AgentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    system_prompt: str | None = None
    tools: dict | None = None
    model: str | None = None
    max_context_chunks: int | None = None
    temperature: float | None = None
    is_active: bool | None = None


class AgentResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: str
    agent_type: str
    tools: dict
    model: str
    max_context_chunks: int
    temperature: float
    is_global: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
