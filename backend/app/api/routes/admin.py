"""Admin routes — all endpoints under /admin/ prefix (NOT /api/admin/).

Requires role="admin" for every endpoint.
Covers: vendors, bookings, payments, payouts, finance, disputes, audit logs, ops.
"""

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import require_role
from app.db.engine import get_db
from app.models.event import Event, EventService
from app.models.extra import Booking
from app.models.payment import Payment
from app.models.service_provider import ServiceProvider
from app.models.user import User
from app.models.venue import Venue
from app.services.completion_service import admin_resolve_dispute

router = APIRouter(prefix="/admin", tags=["admin"])

# All admin endpoints require admin role
admin_user = require_role("admin")


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class VendorActionRequest(BaseModel):
    reason: str = ""


class DisputeStatusRequest(BaseModel):
    status: str


class DisputeResolveRequest(BaseModel):
    resolution: str
    release_funds: bool = False


class PayoutActionRequest(BaseModel):
    reason: str = ""


# ---------------------------------------------------------------------------
# Vendors (venues + service providers)
# ---------------------------------------------------------------------------


@router.get("/vendors")
async def list_vendors(
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
    status: str | None = Query(None),
    _limit: int = Query(50, alias="limit", ge=1, le=200),
    _offset: int = Query(0, alias="offset", ge=0),
) -> dict[str, Any]:
    """List all vendors (venues + service providers) with optional status filter."""
    # Venues
    venue_query = select(Venue).order_by(Venue.created_at.desc()).limit(_limit).offset(_offset)
    if status:
        venue_query = venue_query.where(Venue.status == status)
    venue_result = await db.execute(venue_query)
    venues = venue_result.scalars().all()

    # Service providers
    sp_query = (
        select(ServiceProvider)
        .order_by(ServiceProvider.created_at.desc())
        .limit(_limit)
        .offset(_offset)
    )
    if status:
        sp_query = sp_query.where(ServiceProvider.status == status)
    sp_result = await db.execute(sp_query)
    providers = sp_result.scalars().all()

    return {
        "venues": [_venue_to_dict(v) for v in venues],
        "service_providers": [_provider_to_dict(sp) for sp in providers],
    }


@router.get("/vendors/{vendor_id}")
async def get_vendor(
    vendor_id: uuid.UUID,
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Get a single vendor by ID (checks venues first, then service providers)."""
    venue_result = await db.execute(select(Venue).where(Venue.id == vendor_id))
    venue = venue_result.scalar_one_or_none()
    if venue:
        return {"type": "venue", "data": _venue_to_dict(venue)}

    sp_result = await db.execute(
        select(ServiceProvider).where(ServiceProvider.id == vendor_id)
    )
    sp = sp_result.scalar_one_or_none()
    if sp:
        return {"type": "service_provider", "data": _provider_to_dict(sp)}

    return {"error": "Vendor not found"}


@router.post("/vendors/{vendor_id}/approve")
async def approve_vendor(
    vendor_id: uuid.UUID,
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Approve a pending vendor."""
    return await _set_vendor_status(db, vendor_id, "approved")


@router.post("/vendors/{vendor_id}/needs-changes")
async def vendor_needs_changes(
    vendor_id: uuid.UUID,
    body: VendorActionRequest,
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Request changes from a vendor."""
    return await _set_vendor_status(db, vendor_id, "needs_changes")


@router.post("/vendors/{vendor_id}/disable-payout")
async def disable_vendor_payout(
    vendor_id: uuid.UUID,
    body: VendorActionRequest,
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Disable payouts for a vendor (sets status to suspended)."""
    return await _set_vendor_status(db, vendor_id, "suspended")


# ---------------------------------------------------------------------------
# Bookings
# ---------------------------------------------------------------------------


@router.get("/bookings")
async def list_bookings(
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
    status: str | None = Query(None),
    _limit: int = Query(50, alias="limit", ge=1, le=200),
    _offset: int = Query(0, alias="offset", ge=0),
) -> dict[str, Any]:
    """List all events (bookings) with optional status filter."""
    query = select(Event).order_by(Event.created_at.desc()).limit(_limit).offset(_offset)
    if status:
        query = query.where(Event.status == status)
    result = await db.execute(query)
    events = result.scalars().all()
    return {"data": [_event_to_dict(e) for e in events]}


@router.get("/bookings/{booking_id}")
async def get_booking(
    booking_id: uuid.UUID,
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Get a single booking/event by ID."""
    result = await db.execute(select(Event).where(Event.id == booking_id))
    event = result.scalar_one_or_none()
    if event is None:
        return {"error": "Booking not found"}
    return {"data": _event_to_dict(event)}


@router.get("/bookings/{booking_id}/finance-summary")
async def get_booking_finance_summary(
    booking_id: uuid.UUID,
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Get the financial summary for a booking."""
    result = await db.execute(
        select(Payment).where(Payment.event_id == booking_id).order_by(Payment.created_at)
    )
    payments = result.scalars().all()

    total_paid = sum(float(p.amount) for p in payments if p.status == "completed")
    total_commission = sum(
        float(p.platform_commission) for p in payments if p.platform_commission and p.status in ("completed", "released")
    )
    total_refunded = sum(float(p.amount) for p in payments if p.payment_type == "refund")
    total_released = sum(float(p.net_amount) for p in payments if p.net_amount and p.status == "released")

    return {
        "booking_id": str(booking_id),
        "total_paid": total_paid,
        "total_commission": total_commission,
        "total_refunded": total_refunded,
        "total_released": total_released,
        "payments": [
            {
                "id": str(p.id),
                "amount": float(p.amount),
                "type": p.payment_type,
                "status": p.status,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in payments
        ],
    }


@router.post("/bookings/{booking_id}/hold-payouts")
async def hold_booking_payouts(
    booking_id: uuid.UUID,
    body: VendorActionRequest,
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Hold all pending payouts for a booking. Sets pending event services to 'on_hold'."""
    result = await db.execute(
        select(Event)
        .options(selectinload(Event.event_services))
        .where(Event.id == booking_id)
    )
    event = result.scalar_one_or_none()
    if event is None:
        return {"error": "Booking not found"}

    held_count = 0
    for es in event.event_services:
        if es.status in ("completed", "pending"):
            es.status = "on_hold"
            held_count += 1

    return {"success": True, "held_services": held_count}


# ---------------------------------------------------------------------------
# Payments
# ---------------------------------------------------------------------------


@router.get("/payments")
async def list_payments(
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
    status: str | None = Query(None),
    payment_type: str | None = Query(None),
    _limit: int = Query(50, alias="limit", ge=1, le=200),
    _offset: int = Query(0, alias="offset", ge=0),
) -> dict[str, Any]:
    """List all payments with optional filters."""
    query = select(Payment).order_by(Payment.created_at.desc()).limit(_limit).offset(_offset)
    if status:
        query = query.where(Payment.status == status)
    if payment_type:
        query = query.where(Payment.payment_type == payment_type)
    result = await db.execute(query)
    payments = result.scalars().all()

    return {
        "data": [
            {
                "id": str(p.id),
                "event_id": str(p.event_id),
                "payer_id": str(p.payer_id) if p.payer_id else None,
                "payee_id": str(p.payee_id) if p.payee_id else None,
                "amount": float(p.amount),
                "commission": float(p.platform_commission) if p.platform_commission else None,
                "net_amount": float(p.net_amount) if p.net_amount else None,
                "type": p.payment_type,
                "status": p.status,
                "created_at": p.created_at.isoformat() if p.created_at else None,
                "released_at": p.released_at.isoformat() if p.released_at else None,
            }
            for p in payments
        ]
    }


# ---------------------------------------------------------------------------
# Payouts (service_payment type payments that were released to providers)
# ---------------------------------------------------------------------------


@router.get("/payouts")
async def list_payouts(
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
    _limit: int = Query(50, alias="limit", ge=1, le=200),
    _offset: int = Query(0, alias="offset", ge=0),
) -> dict[str, Any]:
    """List all payouts (released service payments)."""
    query = (
        select(Payment)
        .where(Payment.payment_type == "service_payment")
        .order_by(Payment.created_at.desc())
        .limit(_limit)
        .offset(_offset)
    )
    result = await db.execute(query)
    payouts = result.scalars().all()

    return {
        "data": [
            {
                "id": str(p.id),
                "event_id": str(p.event_id),
                "payee_id": str(p.payee_id) if p.payee_id else None,
                "amount": float(p.amount),
                "net_amount": float(p.net_amount) if p.net_amount else None,
                "status": p.status,
                "stripe_transfer_id": p.stripe_transfer_id,
                "released_at": p.released_at.isoformat() if p.released_at else None,
            }
            for p in payouts
        ]
    }


@router.post("/payouts/{payout_id}/approve")
async def approve_payout(
    payout_id: uuid.UUID,
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Approve a payout (set to released)."""
    return await _set_payment_status(db, payout_id, "released")


@router.post("/payouts/{payout_id}/hold")
async def hold_payout(
    payout_id: uuid.UUID,
    body: PayoutActionRequest,
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Hold a payout."""
    return await _set_payment_status(db, payout_id, "on_hold")


@router.post("/payouts/{payout_id}/reverse")
async def reverse_payout(
    payout_id: uuid.UUID,
    body: PayoutActionRequest,
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Reverse a payout."""
    return await _set_payment_status(db, payout_id, "reversed")


# ---------------------------------------------------------------------------
# Finance overview
# ---------------------------------------------------------------------------


@router.get("/finance/overview")
async def finance_overview(
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Platform-wide financial overview: total revenue, commissions, payouts, refunds."""
    # Total completed payments
    revenue_result = await db.execute(
        select(func.coalesce(func.sum(Payment.amount), 0)).where(
            Payment.payment_type == "event_total",
            Payment.status == "completed",
        )
    )
    total_revenue = float(revenue_result.scalar_one())

    # Total commissions
    commission_result = await db.execute(
        select(func.coalesce(func.sum(Payment.platform_commission), 0)).where(
            Payment.status.in_(["completed", "released"]),
            Payment.platform_commission.isnot(None),
        )
    )
    total_commissions = float(commission_result.scalar_one())

    # Total payouts
    payout_result = await db.execute(
        select(func.coalesce(func.sum(Payment.net_amount), 0)).where(
            Payment.payment_type == "service_payment",
            Payment.status == "released",
        )
    )
    total_payouts = float(payout_result.scalar_one())

    # Total refunds
    refund_result = await db.execute(
        select(func.coalesce(func.sum(Payment.amount), 0)).where(
            Payment.payment_type == "refund",
        )
    )
    total_refunds = float(refund_result.scalar_one())

    # Counts
    event_count_result = await db.execute(select(func.count(Event.id)))
    user_count_result = await db.execute(select(func.count(User.id)))
    venue_count_result = await db.execute(select(func.count(Venue.id)))
    provider_count_result = await db.execute(select(func.count(ServiceProvider.id)))

    return {
        "total_revenue": total_revenue,
        "total_commissions": total_commissions,
        "total_payouts": total_payouts,
        "total_refunds": total_refunds,
        "net_platform_revenue": total_commissions - total_refunds,
        "counts": {
            "events": event_count_result.scalar_one(),
            "users": user_count_result.scalar_one(),
            "venues": venue_count_result.scalar_one(),
            "service_providers": provider_count_result.scalar_one(),
        },
    }


# ---------------------------------------------------------------------------
# Disputes
# ---------------------------------------------------------------------------


@router.get("/disputes")
async def list_disputes(
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
    _limit: int = Query(50, alias="limit", ge=1, le=200),
    _offset: int = Query(0, alias="offset", ge=0),
) -> dict[str, Any]:
    """List all disputed event services."""
    query = (
        select(EventService)
        .where(EventService.status == "disputed")
        .order_by(EventService.completed_at.desc())
        .limit(_limit)
        .offset(_offset)
    )
    result = await db.execute(query)
    disputes = result.scalars().all()

    return {
        "data": [
            {
                "id": str(d.id),
                "event_id": str(d.event_id),
                "provider_id": str(d.service_provider_id) if d.service_provider_id else None,
                "agreed_price": float(d.agreed_price),
                "status": d.status,
                "completion_notes": d.completion_notes,
                "completion_photos": d.completion_photos,
                "completed_at": d.completed_at.isoformat() if d.completed_at else None,
            }
            for d in disputes
        ]
    }


@router.get("/disputes/{dispute_id}")
async def get_dispute(
    dispute_id: uuid.UUID,
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Get a single disputed event service."""
    result = await db.execute(
        select(EventService).where(EventService.id == dispute_id)
    )
    es = result.scalar_one_or_none()
    if es is None:
        return {"error": "Dispute not found"}

    return {
        "data": {
            "id": str(es.id),
            "event_id": str(es.event_id),
            "provider_id": str(es.service_provider_id) if es.service_provider_id else None,
            "agreed_price": float(es.agreed_price),
            "status": es.status,
            "completion_notes": es.completion_notes,
            "completion_photos": es.completion_photos,
            "completed_at": es.completed_at.isoformat() if es.completed_at else None,
            "approved_at": es.approved_at.isoformat() if es.approved_at else None,
        }
    }


@router.post("/disputes/{dispute_id}/status")
async def update_dispute_status(
    dispute_id: uuid.UUID,
    body: DisputeStatusRequest,
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Update dispute status (e.g., under_review, escalated)."""
    result = await db.execute(
        select(EventService).where(EventService.id == dispute_id)
    )
    es = result.scalar_one_or_none()
    if es is None:
        return {"error": "Dispute not found"}

    es.status = body.status
    return {"success": True, "id": str(dispute_id), "status": body.status}


@router.post("/disputes/{dispute_id}/resolve")
async def resolve_dispute(
    dispute_id: uuid.UUID,
    body: DisputeResolveRequest,
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Resolve a dispute. Optionally releases funds to provider."""
    result = await admin_resolve_dispute(
        db=db,
        event_service_id=dispute_id,
        resolution=body.resolution,
        release_funds=body.release_funds,
    )
    return result


# ---------------------------------------------------------------------------
# Audit logs (placeholder — returns recent admin-visible events)
# ---------------------------------------------------------------------------


@router.get("/audit-logs")
async def list_audit_logs(
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
    _limit: int = Query(50, alias="limit", ge=1, le=200),
    _offset: int = Query(0, alias="offset", ge=0),
) -> dict[str, Any]:
    """Return recent events/payments as a pseudo-audit log.

    A full audit log table can be added later; for now this combines
    recent events and payment status changes.
    """
    events_result = await db.execute(
        select(Event)
        .order_by(Event.updated_at.desc())
        .limit(_limit)
        .offset(_offset)
    )
    events = events_result.scalars().all()

    logs = [
        {
            "type": "event",
            "id": str(e.id),
            "action": e.status,
            "user_id": str(e.user_id),
            "timestamp": e.updated_at.isoformat() if e.updated_at else None,
        }
        for e in events
    ]

    return {"data": logs}


# ---------------------------------------------------------------------------
# Operations
# ---------------------------------------------------------------------------


@router.post("/ops/reset-dummy-data")
async def reset_dummy_data(
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Reset dummy/test data. Only available in development.

    Deletes all events, payments, bookings in test status.
    """
    from app.core.config import settings

    if not settings.is_dev:
        return {"success": False, "error": "Only available in development"}

    # Delete test payments
    await db.execute(
        select(Payment).where(Payment.stripe_payment_intent_id.like("mock_%"))
    )
    # Use raw SQL for bulk delete
    await db.execute(
        Payment.__table__.delete().where(
            Payment.stripe_payment_intent_id.like("mock_%")
        )
    )

    return {"success": True, "message": "Dummy data reset"}


@router.post("/ops/reconcile-dummy-payments")
async def reconcile_dummy_payments(
    _admin: User = Depends(admin_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Reconcile mock payments — set all pending mock payments to completed."""
    from app.core.config import settings

    if not settings.is_dev:
        return {"success": False, "error": "Only available in development"}

    result = await db.execute(
        select(Payment).where(
            Payment.stripe_payment_intent_id.like("mock_%"),
            Payment.status == "pending",
        )
    )
    payments = result.scalars().all()

    count = 0
    for p in payments:
        p.status = "completed"
        count += 1

    return {"success": True, "reconciled": count}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _venue_to_dict(v: Venue) -> dict:
    return {
        "id": str(v.id),
        "owner_id": str(v.owner_id),
        "name": v.name,
        "description": v.description,
        "city": v.location_city,
        "address": v.location_address,
        "capacity": v.capacity,
        "status": v.status,
        "photos": v.photos or [],
        "created_at": v.created_at.isoformat() if v.created_at else None,
    }


def _provider_to_dict(sp: ServiceProvider) -> dict:
    return {
        "id": str(sp.id),
        "user_id": str(sp.user_id),
        "business_name": sp.business_name,
        "description": sp.description,
        "city": sp.location_city,
        "service_area": sp.service_area or [],
        "status": sp.status,
        "photos": sp.photos or [],
        "created_at": sp.created_at.isoformat() if sp.created_at else None,
    }


def _event_to_dict(e: Event) -> dict:
    return {
        "id": str(e.id),
        "user_id": str(e.user_id),
        "venue_id": str(e.venue_id) if e.venue_id else None,
        "event_type": e.event_type,
        "event_date": e.event_date.isoformat() if e.event_date else None,
        "guest_count": e.guest_count,
        "budget": float(e.budget),
        "total_cost": float(e.total_cost) if e.total_cost else None,
        "status": e.status,
        "created_at": e.created_at.isoformat() if e.created_at else None,
    }


async def _set_vendor_status(
    db: AsyncSession, vendor_id: uuid.UUID, status: str
) -> dict[str, Any]:
    """Set status on a venue or service provider."""
    venue_result = await db.execute(select(Venue).where(Venue.id == vendor_id))
    venue = venue_result.scalar_one_or_none()
    if venue:
        venue.status = status
        return {"success": True, "type": "venue", "id": str(vendor_id), "status": status}

    sp_result = await db.execute(
        select(ServiceProvider).where(ServiceProvider.id == vendor_id)
    )
    sp = sp_result.scalar_one_or_none()
    if sp:
        sp.status = status
        return {"success": True, "type": "service_provider", "id": str(vendor_id), "status": status}

    return {"success": False, "error": "Vendor not found"}


async def _set_payment_status(
    db: AsyncSession, payment_id: uuid.UUID, status: str
) -> dict[str, Any]:
    """Set status on a payment record."""
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if payment is None:
        return {"success": False, "error": "Payment not found"}

    payment.status = status
    if status == "released":
        payment.released_at = datetime.now(timezone.utc)

    return {"success": True, "id": str(payment_id), "status": status}
