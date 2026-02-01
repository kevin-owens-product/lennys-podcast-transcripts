import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.database import get_db
from app.models.agent import Agent
from app.models.user import User
from app.schemas.agent import AgentCreate, AgentResponse, AgentUpdate
from app.services.agents import run_agent

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("/", response_model=list[AgentResponse])
async def list_agents(
    x_tenant_id: str = Header(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(x_tenant_id)
    result = await db.execute(
        select(Agent)
        .where(or_(Agent.tenant_id == tenant_id, Agent.is_global.is_(True)))
        .where(Agent.is_active.is_(True))
        .order_by(Agent.name)
    )
    return [AgentResponse.model_validate(a) for a in result.scalars().all()]


@router.post("/", response_model=AgentResponse, status_code=201)
async def create_agent(
    data: AgentCreate,
    x_tenant_id: str = Header(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(x_tenant_id)
    agent = Agent(
        tenant_id=tenant_id if not data.is_global else None,
        created_by=current_user.id,
        **data.model_dump(),
    )
    db.add(agent)
    await db.flush()
    return AgentResponse.model_validate(agent)


@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: uuid.UUID,
    data: AgentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(agent, key, value)
    await db.flush()
    return AgentResponse.model_validate(agent)


@router.post("/{agent_id}/run")
async def run_agent_endpoint(
    agent_id: uuid.UUID,
    input_text: str = Query(...),
    x_tenant_id: str = Header(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(x_tenant_id)
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent_run = await run_agent(db, agent, input_text, tenant_id, current_user.id)
    await db.commit()

    return {
        "id": agent_run.id,
        "output": agent_run.output_text,
        "sources": agent_run.sources,
        "status": agent_run.status,
        "token_count": agent_run.token_count,
    }
