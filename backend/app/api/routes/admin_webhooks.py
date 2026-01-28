from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role
from app.core.config import get_settings
from app.core.errors import APIError, forbidden, not_found
from app.models.enums import UserRole, WebhookEventStatus
from app.models.user import User
from app.models.webhook_event import WebhookEvent
from app.api.routes.webhooks import _process_stripe_event
from app.services.audit import log_admin_action
from app.services.payments.stripe_sync import PaymentSyncNotReadyError

router = APIRouter(prefix="/admin", tags=["admin-webhooks"])


@router.post("/webhooks/stripe/retry/{event_id}")
def retry_stripe_webhook(
    event_id: str,
    db: Session = Depends(get_db),
    request: Request,
    admin_user: User = Depends(require_role(UserRole.ADMIN)),
) -> dict[str, str]:
    settings = get_settings()
    if not settings.enable_demo_ops and not settings.enable_admin_retry:
        raise forbidden("Admin retry disabled")

    webhook_event = db.execute(
        select(WebhookEvent).where(WebhookEvent.id == event_id)
    ).scalar_one_or_none()
    if not webhook_event:
        raise not_found("Webhook event not found")
    if webhook_event.status != WebhookEventStatus.FAILED:
        raise APIError(
            error_code="invalid_webhook_status",
            message="Webhook event is not in failed status.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
    if not isinstance(webhook_event.payload_json, dict):
        raise APIError(
            error_code="missing_webhook_payload",
            message="Webhook payload unavailable for retry.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    try:
        with db.begin():
            _process_stripe_event(db, webhook_event.payload_json)
            webhook_event.status = WebhookEventStatus.PROCESSED
            webhook_event.processed_at = datetime.utcnow()
            webhook_event.error = None
            db.add(webhook_event)
    except PaymentSyncNotReadyError as exc:
        with db.begin():
            webhook_event.status = WebhookEventStatus.FAILED
            webhook_event.error = str(exc)
            db.add(webhook_event)
        raise APIError(
            error_code="webhook_retry_failed",
            message="Webhook retry failed.",
            status_code=status.HTTP_400_BAD_REQUEST,
        ) from exc

    log_admin_action(
        db,
        actor_user_id=admin_user.id,
        action="admin_webhook_retry",
        entity_type="webhook_event",
        entity_id=webhook_event.id,
        before_obj={"status": "failed"},
        after_obj={"status": "processed"},
        actor_ip=request.client.host if request.client else None,
        actor_user_agent=request.headers.get("user-agent"),
    )
    db.commit()

    return {"status": "processed"}
