from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.booking import Booking
from app.models.booking_vendor import BookingVendor
from app.models.enums import BookingStatus, LedgerEntryType, PaymentStatus
from app.models.ledger_entry import LedgerEntry
from app.models.payment import Payment
from app.models.webhook_event import WebhookEvent
from app.services.bookings_pricing import compute_booking_total
from app.services.payments.stripe import StripePaymentService

router = APIRouter(tags=["webhooks"])


@router.post("/webhooks/stripe")
async def handle_stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    if not sig_header:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing signature")

    stripe_service = StripePaymentService()
    if not stripe_service.verify_webhook_signature(payload, sig_header):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

    event = stripe_service.parse_webhook(payload, sig_header)
    event_id = event.get("id")
    event_type = event.get("type")
    if not event_id or not event_type:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid event")

    existing_event = db.execute(
        select(WebhookEvent).where(WebhookEvent.id == event_id)
    ).scalar_one_or_none()
    if existing_event:
        return {"status": "ignored"}

    with db.begin():
        webhook_event = WebhookEvent(id=event_id, provider="stripe")
        db.add(webhook_event)

        intent = event.get("data", {}).get("object", {})
        intent_id = intent.get("id")
        if not intent_id:
            webhook_event.processed_at = datetime.utcnow()
            return {"status": "ignored"}

        payment = db.execute(
            select(Payment).where(Payment.provider_intent_id == intent_id)
        ).scalar_one_or_none()
        if not payment:
            webhook_event.processed_at = datetime.utcnow()
            return {"status": "ignored"}

        if event_type == "payment_intent.succeeded":
            payment.status = PaymentStatus.PAID
            booking = db.execute(
                select(Booking).where(Booking.id == payment.booking_id)
            ).scalar_one_or_none()
            if booking:
                booking.status = BookingStatus.PAID
                if booking.total_gross_amount_cents == 0:
                    booking_vendors = db.execute(
                        select(BookingVendor).where(BookingVendor.booking_id == booking.id)
                    ).scalars().all()
                    try:
                        booking.total_gross_amount_cents = compute_booking_total(
                            booking, booking_vendors
                        )
                    except ValueError:
                        pass
                db.add(booking)

            ledger_entry = LedgerEntry(
                booking_id=payment.booking_id,
                booking_vendor_id=None,
                type=LedgerEntryType.HELD_FUNDS,
                amount_cents=payment.amount_cents,
                currency=payment.currency,
                note="Stripe payment received",
            )
            db.add(ledger_entry)
        elif event_type in {"payment_intent.payment_failed", "payment_intent.canceled"}:
            payment.status = PaymentStatus.FAILED

        db.add(payment)
        webhook_event.processed_at = datetime.utcnow()

    return {"status": "ok"}
