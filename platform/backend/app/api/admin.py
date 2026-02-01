import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user, require_superadmin
from app.database import get_db
from app.models.agent import Agent, AgentRun
from app.models.chat import ChatMessage, ChatSession
from app.models.tenant import Tenant, TenantMember
from app.models.transcript import Transcript, TranscriptChunk
from app.models.user import User
from app.schemas.tenant import TenantResponse
from app.schemas.user import UserResponse
from app.services.ingestion import ingest_transcripts

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
async def admin_dashboard(
    admin: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db),
):
    users = (await db.execute(select(func.count(User.id)))).scalar()
    tenants = (await db.execute(select(func.count(Tenant.id)))).scalar()
    transcripts = (await db.execute(select(func.count(Transcript.id)))).scalar()
    chunks = (await db.execute(select(func.count(TranscriptChunk.id)))).scalar()
    agents = (await db.execute(select(func.count(Agent.id)))).scalar()
    sessions = (await db.execute(select(func.count(ChatSession.id)))).scalar()
    messages = (await db.execute(select(func.count(ChatMessage.id)))).scalar()
    runs = (await db.execute(select(func.count(AgentRun.id)))).scalar()

    return {
        "users": users,
        "tenants": tenants,
        "transcripts": transcripts,
        "chunks": chunks,
        "agents": agents,
        "chat_sessions": sessions,
        "chat_messages": messages,
        "agent_runs": runs,
    }


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    skip: int = Query(0),
    limit: int = Query(50),
    admin: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()).offset(skip).limit(limit))
    return [UserResponse.model_validate(u) for u in result.scalars().all()]


@router.put("/users/{user_id}/toggle-admin")
async def toggle_admin(
    user_id: uuid.UUID,
    admin: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_superadmin = not user.is_superadmin
    await db.flush()
    return {"is_superadmin": user.is_superadmin}


@router.get("/tenants", response_model=list[TenantResponse])
async def list_all_tenants(
    admin: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Tenant).order_by(Tenant.created_at.desc()))
    return [TenantResponse.model_validate(t) for t in result.scalars().all()]


@router.post("/ingest")
async def trigger_ingestion(
    x_tenant_id: str = Header(...),
    with_embeddings: bool = Query(True),
    admin: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(x_tenant_id)
    stats = await ingest_transcripts(db, tenant_id, with_embeddings=with_embeddings)
    return stats
