from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role
from app.core.errors import APIError, not_found
from app.models.booking_vendor import BookingVendor
from app.models.enums import LedgerEntryType, PayoutStatus, UserRole
from app.models.ledger_entry import LedgerEntry
from app.models.booking import Booking
from app.models.payout import Payout
from app.models.user import User
from app.schemas.payouts import PayoutOut
from app.services.audit import log_admin_action
from app.utils.serialization import model_to_dict

router = APIRouter(prefix="/admin", tags=["admin-payouts"])


@router.get("/payouts/pending", response_model=list[PayoutOut])
def list_pending_payouts(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
) -> list[PayoutOut]:
    rows = db.execute(
        select(Payout, BookingVendor).where(
            Payout.booking_vendor_id == BookingVendor.id,
            Payout.status == PayoutStatus.ELIGIBLE,
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


@router.post("/payouts/{payout_id}/approve", response_model=PayoutOut)
def approve_payout(
    payout_id: UUID,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(UserRole.ADMIN)),
) -> PayoutOut:
    payout = db.execute(select(Payout).where(Payout.id == payout_id)).scalar_one_or_none()
    if not payout:
        raise not_found("Payout not found")
    if payout.status != PayoutStatus.ELIGIBLE:
        raise APIError(
            error_code="payout_not_eligible",
            message="Payout not eligible.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    booking_vendor = db.execute(
        select(BookingVendor).where(BookingVendor.id == payout.booking_vendor_id)
    ).scalar_one_or_none()
    if not booking_vendor:
        raise not_found("Booking vendor not found")
    booking = db.execute(
        select(Booking).where(Booking.id == booking_vendor.booking_id)
    ).scalar_one_or_none()
    if not booking:
        raise not_found("Booking not found")

    before = model_to_dict(payout)
    payout.status = PayoutStatus.PAID
    payout.admin_approved_by = admin_user.id

    ledger_entry = LedgerEntry(
        booking_id=booking_vendor.booking_id,
        booking_vendor_id=booking_vendor.id,
        type=LedgerEntryType.PAYOUT,
        amount_cents=payout.amount_cents,
        currency=booking.currency,
        note="Payout approved (manual)",
    )

    db.add(payout)
    db.add(ledger_entry)
    log_admin_action(
        db,
        actor_user_id=admin_user.id,
        action="admin_payout_approve",
        entity_type="payout",
        entity_id=str(payout.id),
        before_obj=before,
        after_obj=model_to_dict(payout),
    )
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


@router.post("/payouts/{payout_id}/hold", response_model=PayoutOut)
def hold_payout(
    payout_id: UUID,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(UserRole.ADMIN)),
) -> PayoutOut:
    payout = db.execute(select(Payout).where(Payout.id == payout_id)).scalar_one_or_none()
    if not payout:
        raise not_found("Payout not found")

    before = model_to_dict(payout)
    payout.status = PayoutStatus.HELD
    payout.admin_approved_by = admin_user.id

    db.add(payout)
    log_admin_action(
        db,
        actor_user_id=admin_user.id,
        action="admin_payout_hold",
        entity_type="payout",
        entity_id=str(payout.id),
        before_obj=before,
        after_obj=model_to_dict(payout),
    )
    db.commit()
    db.refresh(payout)

    booking_vendor = db.execute(
        select(BookingVendor).where(BookingVendor.id == payout.booking_vendor_id)
    ).scalar_one_or_none()
    if not booking_vendor:
        raise not_found("Booking vendor not found")
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


@router.post("/payouts/{payout_id}/reverse", response_model=PayoutOut)
def reverse_payout(
    payout_id: UUID,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(UserRole.ADMIN)),
) -> PayoutOut:
    payout = db.execute(select(Payout).where(Payout.id == payout_id)).scalar_one_or_none()
    if not payout:
        raise not_found("Payout not found")

    before = model_to_dict(payout)
    payout.status = PayoutStatus.REVERSED
    payout.admin_approved_by = admin_user.id

    db.add(payout)
    log_admin_action(
        db,
        actor_user_id=admin_user.id,
        action="admin_payout_reverse",
        entity_type="payout",
        entity_id=str(payout.id),
        before_obj=before,
        after_obj=model_to_dict(payout),
    )
    db.commit()
    db.refresh(payout)

    booking_vendor = db.execute(
        select(BookingVendor).where(BookingVendor.id == payout.booking_vendor_id)
    ).scalar_one_or_none()
    if not booking_vendor:
        raise not_found("Booking vendor not found")
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
