import uuid

from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.tenant import Tenant, TenantMember
from app.models.user import User


async def get_tenant_from_header(
    x_tenant_id: str | None = Header(None),
    db: AsyncSession = Depends(get_db),
) -> Tenant | None:
    if not x_tenant_id:
        return None
    try:
        tenant_id = uuid.UUID(x_tenant_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid tenant ID format")

    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


async def require_tenant_access(
    tenant: Tenant = Depends(get_tenant_from_header),
    current_user: User = None,
    db: AsyncSession = Depends(get_db),
) -> Tenant:
    if not tenant:
        raise HTTPException(status_code=400, detail="X-Tenant-Id header required")
    if current_user and current_user.is_superadmin:
        return tenant
    if current_user:
        result = await db.execute(
            select(TenantMember).where(
                TenantMember.tenant_id == tenant.id,
                TenantMember.user_id == current_user.id,
            )
        )
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Not a member of this tenant")
    return tenant
