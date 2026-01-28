from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.errors import APIError
from app.models.enums import PaymentStatus, WebhookEventStatus, WebhookProvider
from app.models.payment import Payment
from app.models.webhook_event import WebhookEvent
from app.services.payments.stripe import StripePaymentService
from app.services.payments.stripe_sync import (
    PaymentSyncNotReadyError,
    apply_payment_success_side_effects,
)

router = APIRouter(tags=["webhooks"])


def _store_webhook_event(
    db: Session,
    event_id: str,
    event_type: str,
    payload: dict[str, Any],
) -> WebhookEvent:
    webhook_event = db.execute(
        select(WebhookEvent).where(WebhookEvent.id == event_id)
    ).scalar_one_or_none()
    if webhook_event is None:
        webhook_event = WebhookEvent(
            id=event_id,
            provider=WebhookProvider.STRIPE,
            event_type=event_type,
            payload_json=payload,
            status=WebhookEventStatus.RECEIVED,
        )
        db.add(webhook_event)
    else:
        if webhook_event.status != WebhookEventStatus.PROCESSED:
            webhook_event.event_type = event_type
            webhook_event.payload_json = payload
            webhook_event.status = WebhookEventStatus.RECEIVED
            webhook_event.error = None
            webhook_event.processed_at = None
            db.add(webhook_event)
    return webhook_event


def _process_stripe_event(db: Session, event: dict[str, Any]) -> None:
    event_type = event.get("type")
    intent = event.get("data", {}).get("object", {})
    intent_id = intent.get("id")
    if not intent_id:
        raise PaymentSyncNotReadyError("missing_intent_id")

    payment = db.execute(
        select(Payment).where(Payment.provider_intent_id == intent_id)
    ).scalar_one_or_none()
    if not payment:
        raise PaymentSyncNotReadyError("payment_not_found")

    if event_type == "payment_intent.succeeded":
        apply_payment_success_side_effects(db, payment)
    elif event_type in {"payment_intent.payment_failed", "payment_intent.canceled"}:
        payment.status = PaymentStatus.FAILED

    db.add(payment)


@router.post("/webhooks/stripe")
async def handle_stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    if not sig_header:
        raise APIError(
            error_code="missing_signature",
            message="Missing signature",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    stripe_service = StripePaymentService()
    if not stripe_service.verify_webhook_signature(payload, sig_header):
        raise APIError(
            error_code="invalid_signature",
            message="Invalid signature",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    event = stripe_service.parse_webhook(payload, sig_header)
    event_id = event.get("id")
    event_type = event.get("type")
    if not event_id or not event_type:
        raise APIError(
            error_code="invalid_event",
            message="Invalid event",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    webhook_event = db.execute(
        select(WebhookEvent).where(WebhookEvent.id == event_id)
    ).scalar_one_or_none()
    if webhook_event and webhook_event.status == WebhookEventStatus.PROCESSED:
        return {"status": "ignored"}

    try:
        with db.begin():
            webhook_event = _store_webhook_event(db, event_id, event_type, event)
            _process_stripe_event(db, event)
            webhook_event.status = WebhookEventStatus.PROCESSED
            webhook_event.processed_at = datetime.utcnow()
            db.add(webhook_event)
    except PaymentSyncNotReadyError as exc:
        with db.begin():
            webhook_event = _store_webhook_event(db, event_id, event_type, event)
            webhook_event.status = WebhookEventStatus.FAILED
            webhook_event.error = str(exc)
            db.add(webhook_event)
        return {"status": "ignored"}
    except Exception as exc:
        with db.begin():
            webhook_event = _store_webhook_event(db, event_id, event_type, event)
            webhook_event.status = WebhookEventStatus.FAILED
            webhook_event.error = "processing_failed"
            db.add(webhook_event)
        raise APIError(
            error_code="webhook_processing_failed",
            message="Webhook processing failed.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from exc

    return {"status": "ok"}
