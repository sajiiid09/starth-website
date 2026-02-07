"""Audit logging helpers."""

import logging
import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog

logger = logging.getLogger(__name__)


async def log_audit_event(
    db: AsyncSession,
    *,
    action: str,
    actor_user_id: uuid.UUID | None = None,
    target_user_id: uuid.UUID | None = None,
    resource_type: str | None = None,
    resource_id: uuid.UUID | None = None,
    status: str = "success",
    details: dict[str, Any] | None = None,
) -> None:
    """Persist an audit event without interrupting the primary business flow."""
    try:
        db.add(
            AuditLog(
                actor_user_id=actor_user_id,
                target_user_id=target_user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                status=status,
                details=details,
            )
        )
    except Exception:
        logger.exception("Failed to queue audit event", extra={"action": action})
