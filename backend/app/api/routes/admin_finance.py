from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role
from app.models.enums import UserRole
from app.models.user import User
from app.models.payout import Payout
from app.services.finance.ledger import get_booking_ledger_summary, get_finance_overview
from app.models.booking_vendor import BookingVendor

router = APIRouter(prefix="/admin/finance", tags=["admin-finance"])


@router.get("/bookings/{booking_id}/summary")
def booking_finance_summary(
    booking_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
) -> dict:
    summary = get_booking_ledger_summary(db, booking_id)
    payouts = db.execute(
        select(Payout, BookingVendor).where(
            Payout.booking_vendor_id == BookingVendor.id,
            BookingVendor.booking_id == booking_id,
        )
    ).all()
    payout_rows = [
        {
            "payout_id": str(payout.id),
            "booking_vendor_id": str(booking_vendor.id),
            "vendor_id": str(booking_vendor.vendor_id),
            "milestone": payout.milestone.value,
            "amount_cents": payout.amount_cents,
            "status": payout.status.value,
        }
        for payout, booking_vendor in payouts
    ]
    return {"summary": summary, "payouts": payout_rows}


@router.get("/overview")
def finance_overview(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
) -> dict:
    return get_finance_overview(db)
