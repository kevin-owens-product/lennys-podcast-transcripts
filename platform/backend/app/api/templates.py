import uuid

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.database import get_db
from app.models.template import Template
from app.models.user import User
from app.schemas.template import TemplateCreate, TemplateExecute, TemplateResponse, TemplateUpdate
from app.services.rag import build_context, semantic_search

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("/", response_model=list[TemplateResponse])
async def list_templates(
    x_tenant_id: str = Header(...),
    category: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(x_tenant_id)
    stmt = (
        select(Template)
        .where(or_(Template.tenant_id == tenant_id, Template.is_global.is_(True)))
        .where(Template.is_active.is_(True))
    )
    if category:
        stmt = stmt.where(Template.category == category)
    stmt = stmt.order_by(Template.category, Template.name)
    result = await db.execute(stmt)
    return [TemplateResponse.model_validate(t) for t in result.scalars().all()]


@router.post("/", response_model=TemplateResponse, status_code=201)
async def create_template(
    data: TemplateCreate,
    x_tenant_id: str = Header(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(x_tenant_id)
    template = Template(
        tenant_id=tenant_id if not data.is_global else None,
        created_by=current_user.id,
        **data.model_dump(),
    )
    db.add(template)
    await db.flush()
    return TemplateResponse.model_validate(template)


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: uuid.UUID,
    data: TemplateUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(template, key, value)
    await db.flush()
    return TemplateResponse.model_validate(template)


@router.post("/{template_id}/execute")
async def execute_template(
    template_id: uuid.UUID,
    data: TemplateExecute,
    x_tenant_id: str = Header(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(x_tenant_id)
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Build the prompt from template + variables
    user_prompt = template.user_prompt_template
    for key, value in data.variables.items():
        user_prompt = user_prompt.replace(f"{{{{{key}}}}}", str(value))

    # If there's a query, do RAG search
    search_query = data.query or user_prompt[:200]
    try:
        search_results = await semantic_search(db, search_query, tenant_id, limit=10)
    except ValueError:
        search_results = []

    context = await build_context(search_results)

    return {
        "system_prompt": template.system_prompt,
        "user_prompt": user_prompt,
        "context": context,
        "sources": [
            {"guest": r["guest"], "title": r["title"], "similarity": r["similarity"]}
            for r in search_results[:5]
        ],
    }
