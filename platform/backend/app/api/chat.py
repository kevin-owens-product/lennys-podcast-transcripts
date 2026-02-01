import uuid

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.database import get_db
from app.models.agent import Agent
from app.models.chat import ChatMessage, ChatSession
from app.models.user import User
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse, ChatSessionCreate, ChatSessionResponse
from app.services.agents import run_agent

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/sessions", response_model=list[ChatSessionResponse])
async def list_sessions(
    x_tenant_id: str = Header(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(x_tenant_id)
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.tenant_id == tenant_id, ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
    )
    return [ChatSessionResponse.model_validate(s) for s in result.scalars().all()]


@router.post("/sessions", response_model=ChatSessionResponse, status_code=201)
async def create_session(
    data: ChatSessionCreate,
    x_tenant_id: str = Header(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(x_tenant_id)
    session = ChatSession(
        tenant_id=tenant_id,
        user_id=current_user.id,
        agent_id=data.agent_id,
        title=data.title,
    )
    db.add(session)
    await db.flush()
    return ChatSessionResponse.model_validate(session)


@router.get("/sessions/{session_id}/messages", response_model=list[ChatMessageResponse])
async def get_messages(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    return [ChatMessageResponse.model_validate(m) for m in result.scalars().all()]


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    session_id: uuid.UUID,
    data: ChatMessageCreate,
    x_tenant_id: str = Header(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(x_tenant_id)

    # Verify session exists
    session_result = await db.execute(
        select(ChatSession).where(ChatSession.id == session_id)
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    # Save user message
    user_msg = ChatMessage(session_id=session_id, role="user", content=data.content)
    db.add(user_msg)
    await db.flush()

    # Get agent (use default if none set)
    agent = None
    if session.agent_id:
        agent_result = await db.execute(select(Agent).where(Agent.id == session.agent_id))
        agent = agent_result.scalar_one_or_none()

    if not agent:
        # Create a default research agent on the fly
        agent = Agent(
            name="Research Assistant",
            slug="default-research",
            agent_type="research",
            system_prompt="",
            tools={"semantic_search": True, "keyword_search": True},
            max_context_chunks=10,
            temperature=0.7,
            model="gpt-4o",
        )

    # Get chat history
    history_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    history = [{"role": m.role, "content": m.content} for m in history_result.scalars().all()]

    # Run agent
    agent_run = await run_agent(db, agent, data.content, tenant_id, current_user.id, history)

    # Save assistant response
    assistant_msg = ChatMessage(
        session_id=session_id,
        role="assistant",
        content=agent_run.output_text or "No response generated.",
        sources=agent_run.sources or [],
    )
    db.add(assistant_msg)
    await db.flush()

    # Update session title from first message
    if len(history) <= 1:
        session.title = data.content[:100]
        await db.flush()

    return ChatMessageResponse.model_validate(assistant_msg)
