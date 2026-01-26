from __future__ import annotations

import math
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role, require_subscription_active
from app.core.config import get_settings
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if booking.organizer_user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if booking.status != BookingStatus.READY_FOR_PAYMENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "booking_not_ready_for_payment"},
        )

    existing_payment = db.execute(
        select(Payment).where(Payment.idempotency_key == payload.idempotency_key)
    ).scalar_one_or_none()
    stripe_service = StripePaymentService()
    if existing_payment:
        if existing_payment.booking_id != booking.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "idempotency_key_conflict"},
            )
        if not existing_payment.provider_intent_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"error": "payment_missing_provider_intent"},
            )
        intent = stripe_service.retrieve_payment_intent(existing_payment.provider_intent_id)
        client_secret = intent.get("client_secret")
        if not client_secret:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"error": "payment_missing_client_secret"},
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "payment_already_exists"},
        )

    booking_vendors = db.execute(
        select(BookingVendor).where(BookingVendor.booking_id == booking.id)
    ).scalars().all()
    try:
        total_cents = compute_booking_total(booking, booking_vendors)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail={"error": str(exc)}
        ) from exc

    settings = get_settings()
    if payload.mode == "deposit":
        amount_cents = int(math.ceil(total_cents * settings.booking_deposit_percent))
    else:
        amount_cents = total_cents

    if amount_cents <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail={"error": "invalid_payment_amount"}
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
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"error": "stripe_client_secret_missing"},
        )

    return BookingPaymentOut(
        provider=payment.provider.value,
        client_secret=client_secret,
        payment_id=str(payment.id),
        amount_cents=payment.amount_cents,
        currency=payment.currency,
    )
