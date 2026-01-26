from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_authenticated, require_role
from app.models.booking import Booking
from app.models.booking_vendor import BookingVendor
from app.models.dispute import Dispute
from app.models.enums import DisputeStatus, PayoutStatus, UserRole
from app.models.payout import Payout
from app.models.user import User
from app.schemas.disputes import DisputeAdminSetStatusIn, DisputeCreateIn, DisputeOut
from app.services.audit import log_admin_action
from app.services import bookings_service

router = APIRouter(tags=["disputes"])


@router.post("/bookings/{booking_id}/disputes", response_model=DisputeOut)
def create_dispute(
    booking_id: UUID,
    payload: DisputeCreateIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_authenticated),
) -> DisputeOut:
    booking = db.execute(select(Booking).where(Booking.id == booking_id)).scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    if booking.organizer_user_id != user.id:
        try:
            vendor = bookings_service.get_vendor_for_user(db, user)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        booking_vendor = db.execute(
            select(BookingVendor).where(
                BookingVendor.booking_id == booking.id,
                BookingVendor.vendor_id == vendor.id,
            )
        ).scalar_one_or_none()
        if not booking_vendor:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    dispute = Dispute(
        booking_id=booking.id,
        opened_by_user_id=user.id,
        reason=payload.reason,
        details=payload.details,
        status=DisputeStatus.OPEN,
    )
    db.add(dispute)

    booking_vendor_ids = select(BookingVendor.id).where(
        BookingVendor.booking_id == booking.id
    )
    payouts = db.execute(
        select(Payout)
        .where(Payout.booking_vendor_id.in_(booking_vendor_ids))
        .where(Payout.status == PayoutStatus.ELIGIBLE)
    ).scalars().all()
    for payout in payouts:
        payout.status = PayoutStatus.HELD
        db.add(payout)

    db.commit()
    db.refresh(dispute)

    return DisputeOut(
        id=str(dispute.id),
        booking_id=str(dispute.booking_id),
        opened_by_user_id=str(dispute.opened_by_user_id),
        status=dispute.status,
        reason=dispute.reason,
        details=dispute.details,
        resolution_note=dispute.resolution_note,
    )


@router.get("/admin/disputes")
def list_disputes(
    status: DisputeStatus | None = None,
    booking_id: UUID | None = None,
    opened_by_user_id: UUID | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
) -> list[dict]:
    query = select(Dispute)
    if status:
        query = query.where(Dispute.status == status)
    if booking_id:
        query = query.where(Dispute.booking_id == booking_id)
    if opened_by_user_id:
        query = query.where(Dispute.opened_by_user_id == opened_by_user_id)
    disputes = db.execute(query).scalars().all()
    results: list[dict] = []
    for dispute in disputes:
        user = db.execute(
            select(User).where(User.id == dispute.opened_by_user_id)
        ).scalar_one_or_none()
        results.append(
            {
                "id": str(dispute.id),
                "booking_id": str(dispute.booking_id),
                "opened_by_user_id": str(dispute.opened_by_user_id),
                "opened_by_email": user.email if user else None,
                "status": dispute.status.value,
                "reason": dispute.reason,
                "details": dispute.details,
                "resolution_note": dispute.resolution_note,
                "created_at": dispute.created_at.isoformat(),
                "updated_at": dispute.updated_at.isoformat(),
            }
        )
    return results


@router.post("/admin/disputes/{dispute_id}/set-status", response_model=DisputeOut)
def set_dispute_status(
    dispute_id: UUID,
    payload: DisputeAdminSetStatusIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(UserRole.ADMIN)),
) -> DisputeOut:
    dispute = db.execute(select(Dispute).where(Dispute.id == dispute_id)).scalar_one_or_none()
    if not dispute:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispute not found")
    before = {
        "status": dispute.status.value,
        "resolution_note": dispute.resolution_note,
    }
    dispute.status = payload.status
    dispute.resolution_note = payload.resolution_note
    db.add(dispute)
    log_admin_action(
        db,
        actor_user_id=admin_user.id,
        action="admin_dispute_set_status",
        entity_type="dispute",
        entity_id=str(dispute.id),
        before_obj=before,
        after_obj={
            "status": dispute.status.value,
            "resolution_note": dispute.resolution_note,
        },
    )
    db.commit()
    db.refresh(dispute)
    return DisputeOut(
        id=str(dispute.id),
        booking_id=str(dispute.booking_id),
        opened_by_user_id=str(dispute.opened_by_user_id),
        status=dispute.status,
        reason=dispute.reason,
        details=dispute.details,
        resolution_note=dispute.resolution_note,
    )
