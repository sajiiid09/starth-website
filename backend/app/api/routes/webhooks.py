from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.errors import APIError
from app.models.booking import Booking
from app.models.booking_vendor import BookingVendor
from app.core.config import get_settings
from app.models.enums import (
    BookingStatus,
    LedgerEntryType,
    PaymentStatus,
    PayoutMilestone,
    PayoutStatus,
    WebhookEventStatus,
    WebhookProvider,
)
from app.models.ledger_entry import LedgerEntry
from app.models.payment import Payment
from app.models.payout import Payout
from app.models.webhook_event import WebhookEvent
from app.services.bookings_pricing import compute_booking_total
from app.services.payments.stripe import StripePaymentService
from app.services.payouts.allocation import allocate_paid_amount_across_vendors

router = APIRouter(tags=["webhooks"])


class WebhookNotReadyError(Exception):
    pass


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
        raise WebhookNotReadyError("missing_intent_id")

    payment = db.execute(
        select(Payment).where(Payment.provider_intent_id == intent_id)
    ).scalar_one_or_none()
    if not payment:
        raise WebhookNotReadyError("payment_not_found")

    booking = db.execute(
        select(Booking).where(Booking.id == payment.booking_id)
    ).scalar_one_or_none()
    booking_vendors = []
    if booking:
        booking_vendors = db.execute(
            select(BookingVendor).where(BookingVendor.booking_id == booking.id)
        ).scalars().all()

    if event_type == "payment_intent.succeeded":
        payment.status = PaymentStatus.PAID
        if booking:
            booking.status = BookingStatus.PAID
            if booking.total_gross_amount_cents == 0:
                try:
                    booking.total_gross_amount_cents = compute_booking_total(
                        booking, booking_vendors
                    )
                except ValueError:
                    pass
            db.add(booking)

        existing_held_funds = db.execute(
            select(LedgerEntry).where(
                LedgerEntry.payment_id == payment.id,
                LedgerEntry.type == LedgerEntryType.HELD_FUNDS,
            )
        ).scalar_one_or_none()
        if not existing_held_funds:
            ledger_entry = LedgerEntry(
                booking_id=payment.booking_id,
                booking_vendor_id=None,
                payment_id=payment.id,
                type=LedgerEntryType.HELD_FUNDS,
                amount_cents=payment.amount_cents,
                currency=payment.currency,
                note="Stripe payment received",
            )
            db.add(ledger_entry)

        if payment.payouts_created_at is None and booking:
            settings = get_settings()
            try:
                booking_total = booking.total_gross_amount_cents or compute_booking_total(
                    booking, booking_vendors
                )
                allocations = allocate_paid_amount_across_vendors(
                    booking_total_cents=booking_total,
                    paid_amount_cents=payment.amount_cents,
                    booking_vendors=booking_vendors,
                    platform_commission_percent=settings.platform_commission_percent,
                )
            except ValueError:
                allocations = []

            for allocation in allocations:
                if allocation.platform_fee_from_paid > 0:
                    db.add(
                        LedgerEntry(
                            booking_id=payment.booking_id,
                            booking_vendor_id=allocation.booking_vendor_id,
                            type=LedgerEntryType.PLATFORM_FEE,
                            amount_cents=allocation.platform_fee_from_paid,
                            currency=payment.currency,
                            note="Platform commission",
                        )
                    )
                reservation_amount = int(
                    allocation.vendor_net_from_paid * settings.reservation_release_percent
                )
                completion_amount = allocation.vendor_net_from_paid - reservation_amount
                db.add(
                    Payout(
                        booking_vendor_id=allocation.booking_vendor_id,
                        milestone=PayoutMilestone.RESERVATION,
                        amount_cents=reservation_amount,
                        status=PayoutStatus.LOCKED,
                    )
                )
                db.add(
                    Payout(
                        booking_vendor_id=allocation.booking_vendor_id,
                        milestone=PayoutMilestone.COMPLETION,
                        amount_cents=completion_amount,
                        status=PayoutStatus.LOCKED,
                    )
                )
            payment.payouts_created_at = datetime.utcnow()
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
    except WebhookNotReadyError as exc:
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
