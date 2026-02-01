import uuid
from datetime import datetime

from pydantic import BaseModel


class TemplateCreate(BaseModel):
    name: str
    slug: str
    description: str = ""
    category: str
    system_prompt: str
    user_prompt_template: str
    variables: dict = {}
    is_global: bool = False
    locale: str = "en"


class TemplateUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    system_prompt: str | None = None
    user_prompt_template: str | None = None
    variables: dict | None = None
    is_active: bool | None = None


class TemplateResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: str
    category: str
    system_prompt: str
    user_prompt_template: str
    variables: dict
    is_global: bool
    is_active: bool
    locale: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TemplateExecute(BaseModel):
    variables: dict = {}
    query: str | None = None
