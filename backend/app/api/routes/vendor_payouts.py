from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role
from app.models.booking_vendor import BookingVendor
from app.models.enums import PayoutMilestone, PayoutStatus, UserRole
from app.models.payout import Payout
from app.models.user import User
from app.schemas.payouts import PayoutOut
from app.services import bookings_service

router = APIRouter(prefix="/vendor", tags=["vendor-payouts"])


@router.get("/payouts", response_model=list[PayoutOut])
def list_vendor_payouts(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.VENDOR)),
) -> list[PayoutOut]:
    try:
        vendor = bookings_service.get_vendor_for_user(db, user)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail={"error": str(exc)}
        ) from exc

    rows = db.execute(
        select(Payout, BookingVendor).where(
            Payout.booking_vendor_id == BookingVendor.id,
            BookingVendor.vendor_id == vendor.id,
        )
    ).all()

    return [
        PayoutOut(
            id=str(payout.id),
            booking_id=str(booking_vendor.booking_id),
            booking_vendor_id=str(payout.booking_vendor_id),
            vendor_id=str(booking_vendor.vendor_id),
            milestone=payout.milestone,
            amount_cents=payout.amount_cents,
            status=payout.status,
            admin_approved_by=str(payout.admin_approved_by)
            if payout.admin_approved_by
            else None,
        )
        for payout, booking_vendor in rows
    ]


@router.post("/payouts/{payout_id}/request", response_model=PayoutOut)
def request_reservation_payout(
    payout_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.VENDOR)),
) -> PayoutOut:
    try:
        vendor = bookings_service.get_vendor_for_user(db, user)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail={"error": str(exc)}
        ) from exc

    payout = db.execute(select(Payout).where(Payout.id == payout_id)).scalar_one_or_none()
    if not payout:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payout not found")
    booking_vendor = db.execute(
        select(BookingVendor).where(BookingVendor.id == payout.booking_vendor_id)
    ).scalar_one_or_none()
    if not booking_vendor or booking_vendor.vendor_id != vendor.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    if payout.milestone != PayoutMilestone.RESERVATION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "payout_not_reservation"},
        )
    if payout.status != PayoutStatus.LOCKED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "payout_not_locked"},
        )

    payout.status = PayoutStatus.ELIGIBLE
    db.add(payout)
    db.commit()
    db.refresh(payout)

    return PayoutOut(
        id=str(payout.id),
        booking_id=str(booking_vendor.booking_id),
        booking_vendor_id=str(payout.booking_vendor_id),
        vendor_id=str(booking_vendor.vendor_id),
        milestone=payout.milestone,
        amount_cents=payout.amount_cents,
        status=payout.status,
        admin_approved_by=str(payout.admin_approved_by) if payout.admin_approved_by else None,
    )
