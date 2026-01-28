from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.booking import Booking
from app.models.booking_vendor import BookingVendor
from app.models.enums import (
    BookingStatus,
    LedgerEntryType,
    PaymentProvider,
    PaymentStatus,
    PayoutMilestone,
    PayoutStatus,
)
from app.models.ledger_entry import LedgerEntry
from app.models.payment import Payment
from app.models.payout import Payout
from app.services.bookings_pricing import compute_booking_total
from app.services.payments.stripe import StripePaymentService
from app.services.payouts.allocation import allocate_paid_amount_across_vendors

logger = logging.getLogger("app.payments.sync")


class PaymentSyncNotReadyError(Exception):
    pass


def apply_payment_success_side_effects(db: Session, payment: Payment) -> None:
    payment.status = PaymentStatus.PAID

    booking = db.execute(
        select(Booking).where(Booking.id == payment.booking_id)
    ).scalar_one_or_none()
    if not booking:
        raise PaymentSyncNotReadyError("booking_not_found")

    booking.status = BookingStatus.PAID
    booking_vendors = db.execute(
        select(BookingVendor).where(BookingVendor.booking_id == booking.id)
    ).scalars().all()

    if booking.total_gross_amount_cents == 0:
        try:
            booking.total_gross_amount_cents = compute_booking_total(booking, booking_vendors)
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
        db.add(
            LedgerEntry(
                booking_id=payment.booking_id,
                booking_vendor_id=None,
                payment_id=payment.id,
                type=LedgerEntryType.HELD_FUNDS,
                amount_cents=payment.amount_cents,
                currency=payment.currency,
                note="Stripe payment received",
            )
        )

    if payment.payouts_created_at is None:
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


def _map_stripe_intent_status(intent_status: str | None) -> PaymentStatus:
    if intent_status == "succeeded":
        return PaymentStatus.PAID
    if intent_status in {"requires_payment_method", "canceled"}:
        return PaymentStatus.FAILED
    return PaymentStatus.PENDING


def reconcile_stripe_payments(
    db: Session,
    hours: int = 24,
    limit: int = 100,
) -> dict[str, int]:
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    stripe_service = StripePaymentService()

    payments = db.execute(
        select(Payment).where(
            Payment.provider == PaymentProvider.STRIPE,
            Payment.provider_intent_id.is_not(None),
            Payment.created_at >= since,
            or_(
                Payment.status.in_([PaymentStatus.PENDING, PaymentStatus.FAILED]),
                Payment.updated_at >= since,
            ),
        )
    ).scalars().all()
    payments = payments[:limit]

    scanned = 0
    updated = 0
    errors = 0

    for payment in payments:
        scanned += 1
        try:
            intent: dict[str, Any] = stripe_service.retrieve_payment_intent(
                payment.provider_intent_id
            )
            intent_status = intent.get("status")
            mapped_status = _map_stripe_intent_status(intent_status)
            if mapped_status != payment.status:
                payment.status = mapped_status
                db.add(payment)
                updated += 1
                logger.info(
                    "payment_status_updated",
                    extra={
                        "payment_id": str(payment.id),
                        "booking_id": str(payment.booking_id),
                        "status": payment.status.value,
                        "provider_status": intent_status,
                    },
                )
            if mapped_status == PaymentStatus.PAID:
                apply_payment_success_side_effects(db, payment)
                db.add(payment)
            db.commit()
        except PaymentSyncNotReadyError as exc:
            errors += 1
            logger.warning(
                "payment_sync_not_ready",
                extra={"payment_id": str(payment.id), "reason": str(exc)},
            )
            db.rollback()
        except Exception:
            errors += 1
            logger.exception(
                "payment_sync_failed",
                extra={"payment_id": str(payment.id)},
            )
            db.rollback()

    return {"scanned": scanned, "updated": updated, "errors": errors}
