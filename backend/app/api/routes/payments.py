"""Payment and booking routes."""

import uuid
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.engine import get_db
from app.models.user import User
from app.services import booking_service, payment_service

router = APIRouter(prefix="/api", tags=["payments", "bookings"])


# ---------------------------------------------------------------------------
# Payment schemas
# ---------------------------------------------------------------------------


class CreatePaymentIntentRequest(BaseModel):
    event_id: str
    amount: float


class ConfirmPaymentRequest(BaseModel):
    payment_intent_id: str


class ReleasePaymentRequest(BaseModel):
    event_service_id: str


class CancelEventRequest(BaseModel):
    reason: str = ""


# ---------------------------------------------------------------------------
# Booking schemas
# ---------------------------------------------------------------------------


class BookVenueRequest(BaseModel):
    event_id: str
    venue_id: str


class BookServiceProviderRequest(BaseModel):
    event_id: str
    provider_id: str
    service_id: str | None = None
    agreed_price: float


class CreateEventFromPlanRequest(BaseModel):
    plan_data: dict[str, Any]
    draft_brief: dict[str, Any]


# ---------------------------------------------------------------------------
# Payment endpoints
# ---------------------------------------------------------------------------


@router.post("/payments/create-intent")
async def create_payment_intent(
    body: CreatePaymentIntentRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Create a Stripe PaymentIntent for an event."""
    result = await payment_service.create_payment_intent(
        db=db,
        event_id=uuid.UUID(body.event_id),
        payer_id=user.id,
        amount=body.amount,
    )
    return result


@router.post("/payments/confirm")
async def confirm_payment(
    body: ConfirmPaymentRequest,
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Confirm a payment was completed."""
    result = await payment_service.confirm_payment(
        db=db,
        payment_intent_id=body.payment_intent_id,
    )
    return result


@router.get("/payments/{event_id}")
async def get_event_payments(
    event_id: uuid.UUID,
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Get all payments for an event."""
    payments = await payment_service.get_event_payments(db=db, event_id=event_id)
    return {"success": True, "data": payments}


@router.post("/payments/release/{event_service_id}")
async def release_payment(
    event_service_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Release payment to a service provider after task completion."""
    result = await payment_service.release_payment(
        db=db,
        event_service_id=event_service_id,
        approver_id=user.id,
    )
    return result


@router.post("/events/{event_id}/cancel")
async def cancel_event(
    event_id: uuid.UUID,
    body: CancelEventRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Cancel an event and process refund."""
    result = await payment_service.process_cancellation(
        db=db,
        event_id=event_id,
        user_id=user.id,
        reason=body.reason,
    )
    return result


# ---------------------------------------------------------------------------
# Booking endpoints
# ---------------------------------------------------------------------------


@router.post("/bookings/create-from-plan")
async def create_event_from_plan(
    body: CreateEventFromPlanRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Create an event from an approved plan."""
    result = await booking_service.create_event_from_plan(
        db=db,
        user_id=user.id,
        plan_data=body.plan_data,
        draft_brief=body.draft_brief,
    )
    return result


@router.post("/bookings/book-venue")
async def book_venue(
    body: BookVenueRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Send a booking request to a venue."""
    result = await booking_service.book_venue(
        db=db,
        event_id=uuid.UUID(body.event_id),
        venue_id=uuid.UUID(body.venue_id),
        user_id=user.id,
    )
    return result


@router.post("/bookings/book-service")
async def book_service_provider(
    body: BookServiceProviderRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Add a service provider to an event."""
    result = await booking_service.book_service_provider(
        db=db,
        event_id=uuid.UUID(body.event_id),
        provider_id=uuid.UUID(body.provider_id),
        service_id=uuid.UUID(body.service_id) if body.service_id else None,
        agreed_price=body.agreed_price,
        user_id=user.id,
    )
    return result


@router.post("/events/{event_id}/confirm")
async def confirm_event(
    event_id: uuid.UUID,
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Confirm an event (venue accepted booking)."""
    result = await booking_service.confirm_event(db=db, event_id=event_id)
    return result
