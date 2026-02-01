import uuid

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.transcript import SearchQuery, SearchResult
from app.services.rag import keyword_search, semantic_search

router = APIRouter(prefix="/search", tags=["search"])


@router.post("/semantic", response_model=list[SearchResult])
async def search_semantic(
    query: SearchQuery,
    x_tenant_id: str = Header(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(x_tenant_id)
    try:
        results = await semantic_search(
            db,
            query.query,
            tenant_id,
            limit=query.limit,
            guest_filter=query.guest_filter,
            min_similarity=query.min_similarity,
        )
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return [SearchResult(**r) for r in results]


@router.post("/keyword", response_model=list[SearchResult])
async def search_keyword(
    query: SearchQuery,
    x_tenant_id: str = Header(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(x_tenant_id)
    results = await keyword_search(
        db,
        query.query,
        tenant_id,
        limit=query.limit,
        guest_filter=query.guest_filter,
    )
    return [SearchResult(**r) for r in results]
