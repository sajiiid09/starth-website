from __future__ import annotations

import math
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role, require_subscription_active
from app.core.config import get_settings
from app.core.errors import APIError, forbidden, not_found
from app.models.booking import Booking
from app.models.booking_vendor import BookingVendor
from app.models.enums import BookingStatus, PaymentProvider, PaymentStatus, UserRole
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payments import BookingPaymentCreateIn, BookingPaymentOut
from app.services.bookings_pricing import compute_booking_total
from app.services.payments.stripe import StripePaymentService

router = APIRouter(tags=["payments"])


@router.post("/bookings/{booking_id}/pay", response_model=BookingPaymentOut)
def create_payment_intent(
    booking_id: UUID,
    payload: BookingPaymentCreateIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.ORGANIZER)),
    _: User = Depends(require_subscription_active),
) -> BookingPaymentOut:
    booking = db.execute(select(Booking).where(Booking.id == booking_id)).scalar_one_or_none()
    if not booking:
        raise not_found("Booking not found")
    if booking.organizer_user_id != user.id:
        raise forbidden("Forbidden")
    if booking.status != BookingStatus.READY_FOR_PAYMENT:
        raise APIError(
            error_code="booking_not_ready_for_payment",
            message="Booking not ready for payment.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    existing_payment = db.execute(
        select(Payment).where(Payment.idempotency_key == payload.idempotency_key)
    ).scalar_one_or_none()
    stripe_service = StripePaymentService()
    if existing_payment:
        if existing_payment.booking_id != booking.id:
            raise APIError(
                error_code="idempotency_key_conflict",
                message="Idempotency key conflict.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        if not existing_payment.provider_intent_id:
            raise APIError(
                error_code="payment_missing_provider_intent",
                message="Payment missing provider intent.",
                status_code=status.HTTP_409_CONFLICT,
            )
        intent = stripe_service.retrieve_payment_intent(existing_payment.provider_intent_id)
        client_secret = intent.get("client_secret")
        if not client_secret:
            raise APIError(
                error_code="payment_missing_client_secret",
                message="Payment missing client secret.",
                status_code=status.HTTP_409_CONFLICT,
            )
        return BookingPaymentOut(
            provider=existing_payment.provider.value,
            client_secret=client_secret,
            payment_id=str(existing_payment.id),
            amount_cents=existing_payment.amount_cents,
            currency=existing_payment.currency,
        )

    booking_payment = db.execute(
        select(Payment).where(Payment.booking_id == booking.id)
    ).scalar_one_or_none()
    if booking_payment:
        raise APIError(
            error_code="payment_already_exists",
            message="Payment already exists.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    booking_vendors = db.execute(
        select(BookingVendor).where(BookingVendor.booking_id == booking.id)
    ).scalars().all()
    try:
        total_cents = compute_booking_total(booking, booking_vendors)
    except ValueError as exc:
        raise APIError(
            error_code=str(exc),
            message="Invalid booking total.",
            status_code=status.HTTP_400_BAD_REQUEST,
        ) from exc

    settings = get_settings()
    if payload.mode == "deposit":
        amount_cents = int(math.ceil(total_cents * settings.booking_deposit_percent))
    else:
        amount_cents = total_cents

    if amount_cents <= 0:
        raise APIError(
            error_code="invalid_payment_amount",
            message="Invalid payment amount.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    metadata = {"organizer_user_id": str(user.id)}
    intent = stripe_service.create_payment_intent(
        booking_id=str(booking.id),
        amount_cents=amount_cents,
        currency=booking.currency,
        idempotency_key=payload.idempotency_key,
        metadata=metadata,
    )

    with db.begin():
        booking.total_gross_amount_cents = total_cents
        payment = Payment(
            booking_id=booking.id,
            payer_user_id=user.id,
            provider=PaymentProvider.STRIPE,
            provider_intent_id=intent.get("id"),
            status=PaymentStatus.PENDING,
            amount_cents=amount_cents,
            currency=booking.currency,
            idempotency_key=payload.idempotency_key,
        )
        db.add(booking)
        db.add(payment)

    client_secret = intent.get("client_secret")
    if not client_secret:
        raise APIError(
            error_code="stripe_client_secret_missing",
            message="Stripe client secret missing.",
            status_code=status.HTTP_502_BAD_GATEWAY,
        )

    return BookingPaymentOut(
        provider=payment.provider.value,
        client_secret=client_secret,
        payment_id=str(payment.id),
        amount_cents=payment.amount_cents,
        currency=payment.currency,
    )
