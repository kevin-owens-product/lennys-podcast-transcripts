import uuid
from datetime import datetime, timezone

import openai
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.agent import Agent, AgentRun
from app.services.rag import build_context, keyword_search, semantic_search

client = openai.AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

DEFAULT_SYSTEM_PROMPT = """You are an expert product advisor powered by insights from 269 episodes of Lenny's Podcast.
You have access to transcripts from interviews with world-class operators including Brian Chesky (Airbnb),
Shreyas Doshi (Stripe/Google), Tobi Lutke (Shopify), Teresa Torres, April Dunford, Sarah Tavel (Benchmark),
and 260+ other guests.

When answering questions:
1. Search the transcript database for relevant insights
2. Cite specific guests and episodes when sharing advice
3. Note areas where guests agree or disagree
4. Provide actionable takeaways, not just summaries
5. Use direct quotes with attribution where possible

Always ground your advice in what the podcast guests actually said."""


async def run_agent(
    db: AsyncSession,
    agent: Agent,
    user_input: str,
    tenant_id: uuid.UUID,
    user_id: uuid.UUID,
    chat_history: list[dict] | None = None,
) -> AgentRun:
    agent_run = AgentRun(
        agent_id=agent.id,
        tenant_id=tenant_id,
        user_id=user_id,
        input_text=user_input,
        status="running",
    )
    db.add(agent_run)
    await db.flush()

    try:
        # Gather context from transcripts using RAG
        tools = agent.tools or {}
        search_results = []

        if tools.get("semantic_search", True):
            try:
                semantic_results = await semantic_search(
                    db, user_input, tenant_id, limit=agent.max_context_chunks
                )
                search_results.extend(semantic_results)
            except ValueError:
                pass  # No OpenAI key, skip semantic search

        if tools.get("keyword_search", True):
            kw_results = await keyword_search(db, user_input, tenant_id, limit=5)
            # Deduplicate
            seen_texts = {r["chunk_text"][:100] for r in search_results}
            for r in kw_results:
                if r["chunk_text"][:100] not in seen_texts:
                    search_results.append(r)
                    seen_texts.add(r["chunk_text"][:100])

        context = await build_context(search_results, agent.max_context_chunks)

        system_prompt = agent.system_prompt or DEFAULT_SYSTEM_PROMPT
        if context:
            system_prompt += f"\n\n## Relevant Transcript Context\n\n{context}"

        messages = [{"role": "system", "content": system_prompt}]
        if chat_history:
            messages.extend(chat_history[-10:])  # Last 10 messages for context
        messages.append({"role": "user", "content": user_input})

        if not client:
            agent_run.output_text = (
                "OpenAI API key not configured. Please set OPENAI_API_KEY to enable AI responses.\n\n"
                f"Context found: {len(search_results)} relevant transcript chunks."
            )
            agent_run.status = "completed"
            agent_run.sources = [
                {"guest": r["guest"], "title": r["title"], "similarity": r["similarity"]}
                for r in search_results[:5]
            ]
            agent_run.completed_at = datetime.now(timezone.utc)
            return agent_run

        response = await client.chat.completions.create(
            model=agent.model or settings.openai_model,
            messages=messages,
            temperature=agent.temperature,
        )

        agent_run.output_text = response.choices[0].message.content
        agent_run.token_count = response.usage.total_tokens if response.usage else None
        agent_run.status = "completed"
        agent_run.sources = [
            {"guest": r["guest"], "title": r["title"], "similarity": r["similarity"]}
            for r in search_results[:10]
        ]
        agent_run.completed_at = datetime.now(timezone.utc)

    except Exception as e:
        agent_run.output_text = f"Error: {str(e)}"
        agent_run.status = "failed"
        agent_run.completed_at = datetime.now(timezone.utc)

    return agent_run
