from __future__ import annotations

from collections import defaultdict
from typing import Any
from uuid import UUID

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models.booking_vendor import BookingVendor
from app.models.enums import LedgerEntryType, PayoutStatus
from app.models.ledger_entry import LedgerEntry
from app.models.payout import Payout


def get_booking_ledger_summary(db: Session, booking_id: UUID) -> dict[str, Any]:
    ledger_rows = db.execute(
        select(LedgerEntry).where(LedgerEntry.booking_id == booking_id)
    ).scalars().all()

    held_funds_cents = 0
    platform_fee_cents = 0
    payouts_paid_cents = 0
    refunds_cents = 0
    currency = None
    for entry in ledger_rows:
        currency = currency or entry.currency
        if entry.type == LedgerEntryType.HELD_FUNDS:
            held_funds_cents += entry.amount_cents
        elif entry.type == LedgerEntryType.PLATFORM_FEE:
            platform_fee_cents += entry.amount_cents
        elif entry.type == LedgerEntryType.PAYOUT:
            payouts_paid_cents += entry.amount_cents
        elif entry.type == LedgerEntryType.REFUND:
            refunds_cents += entry.amount_cents

    available_to_payout_cents = (
        held_funds_cents - platform_fee_cents - payouts_paid_cents - refunds_cents
    )

    payouts = db.execute(
        select(Payout, BookingVendor).where(
            Payout.booking_vendor_id == BookingVendor.id,
            BookingVendor.booking_id == booking_id,
        )
    ).all()

    per_vendor: dict[str, dict[str, int]] = defaultdict(
        lambda: {"net_allocated_cents": 0, "paid_out_cents": 0, "remaining_locked_cents": 0}
    )
    for payout, booking_vendor in payouts:
        vendor_summary = per_vendor[str(booking_vendor.id)]
        vendor_summary["net_allocated_cents"] += payout.amount_cents
        if payout.status == PayoutStatus.PAID:
            vendor_summary["paid_out_cents"] += payout.amount_cents
        elif payout.status in {PayoutStatus.LOCKED, PayoutStatus.ELIGIBLE, PayoutStatus.HELD}:
            vendor_summary["remaining_locked_cents"] += payout.amount_cents

    return {
        "booking_id": str(booking_id),
        "currency": currency,
        "held_funds_cents": held_funds_cents,
        "platform_fee_cents": platform_fee_cents,
        "payouts_paid_cents": payouts_paid_cents,
        "refunds_cents": refunds_cents,
        "available_to_payout_cents": available_to_payout_cents,
        "per_vendor": dict(per_vendor),
    }


def get_finance_overview(db: Session) -> dict[str, int]:
    totals = db.execute(
        select(
            func.coalesce(
                func.sum(
                    case(
                        (LedgerEntry.type == LedgerEntryType.HELD_FUNDS, LedgerEntry.amount_cents),
                        else_=0,
                    )
                ),
                0,
            ),
            func.coalesce(
                func.sum(
                    case(
                        (LedgerEntry.type == LedgerEntryType.PLATFORM_FEE, LedgerEntry.amount_cents),
                        else_=0,
                    )
                ),
                0,
            ),
            func.coalesce(
                func.sum(
                    case(
                        (LedgerEntry.type == LedgerEntryType.PAYOUT, LedgerEntry.amount_cents),
                        else_=0,
                    )
                ),
                0,
            ),
        )
    ).one()
    total_held, total_fees, total_payouts_paid = totals
    total_payouts_eligible = db.execute(
        select(func.coalesce(func.sum(Payout.amount_cents), 0)).where(
            Payout.status == PayoutStatus.ELIGIBLE
        )
    ).scalar_one()

    return {
        "total_held_funds_cents": int(total_held),
        "total_platform_fees_cents": int(total_fees),
        "total_payouts_paid_cents": int(total_payouts_paid),
        "total_payouts_eligible_cents": int(total_payouts_eligible),
    }
