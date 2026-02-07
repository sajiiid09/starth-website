from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role
from app.core.config import get_settings
from app.core.errors import forbidden
from app.models.booking import Booking
from app.models.booking_vendor import BookingVendor
from app.models.enums import (
    BookingStatus,
    PaymentStatus,
    PayoutMilestone,
    PayoutStatus,
    UserRole,
    VendorType,
    VendorVerificationStatus,
)
from app.models.payment import Payment
from app.models.payout import Payout
from app.models.service_profile import ServiceProfile
from app.models.user import User
from app.models.vendor import Vendor
from app.models.venue_profile import VenueProfile
from app.schemas.payments import PaymentReconcileRequest, PaymentReconcileResponse
from app.services.audit import log_admin_action
from app.services.payments.stripe_sync import reconcile_stripe_payments

router = APIRouter(prefix="/admin", tags=["admin-overview"])


@router.get("/vendors")
def list_admin_vendors(
    status: VendorVerificationStatus | None = None,
    vendor_type: VendorType | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
) -> list[dict]:
    query = select(Vendor)
    if status:
        query = query.where(Vendor.verification_status == status)
    if vendor_type:
        query = query.where(Vendor.vendor_type == vendor_type)
    vendors = db.execute(query).scalars().all()

    results: list[dict] = []
    for vendor in vendors:
        user = db.execute(select(User).where(User.id == vendor.user_id)).scalar_one_or_none()
        profile_summary: dict | None = None
        if vendor.vendor_type == VendorType.VENUE_OWNER:
            venue = db.execute(
                select(VenueProfile).where(VenueProfile.vendor_id == vendor.id)
            ).scalar_one_or_none()
            if venue:
                profile_summary = {
                    "venue_name": venue.venue_name,
                    "location_text": venue.location_text,
                }
        else:
            service = db.execute(
                select(ServiceProfile).where(ServiceProfile.vendor_id == vendor.id)
            ).scalar_one_or_none()
            if service:
                profile_summary = {
                    "categories": service.categories_json,
                    "service_areas": service.service_areas_json,
                }
        results.append(
            {
                "vendor_id": str(vendor.id),
                "vendor_type": vendor.vendor_type.value,
                "verification_status": vendor.verification_status.value,
                "payout_enabled": vendor.payout_enabled,
                "user_email": user.email if user else None,
                "profile_summary": profile_summary,
            }
        )
    return results


@router.get("/bookings")
def list_admin_bookings_overview(
    status: BookingStatus | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
) -> list[dict]:
    query = select(Booking)
    if status:
        query = query.where(Booking.status == status)
    bookings = db.execute(query).scalars().all()

    results: list[dict] = []
    for booking in bookings:
        user = db.execute(
            select(User).where(User.id == booking.organizer_user_id)
        ).scalar_one_or_none()
        vendors = db.execute(
            select(BookingVendor).where(BookingVendor.booking_id == booking.id)
        ).scalars().all()
        vendor_statuses = [
            {
                "vendor_id": str(vendor.vendor_id),
                "role": vendor.role_in_booking.value,
                "approval_status": vendor.approval_status.value,
                "agreed_amount_cents": vendor.agreed_amount_cents,
            }
            for vendor in vendors
        ]
        results.append(
            {
                "booking_id": str(booking.id),
                "status": booking.status.value,
                "organizer_email": user.email if user else None,
                "total_gross_amount_cents": booking.total_gross_amount_cents,
                "currency": booking.currency,
                "vendor_statuses": vendor_statuses,
            }
        )
    return results


@router.get("/payments")
def list_admin_payments(
    status: PaymentStatus | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
) -> list[dict]:
    query = select(Payment)
    if status:
        query = query.where(Payment.status == status)
    payments = db.execute(query).scalars().all()
    results: list[dict] = []
    for payment in payments:
        user = db.execute(select(User).where(User.id == payment.payer_user_id)).scalar_one_or_none()
        results.append(
            {
                "payment_id": str(payment.id),
                "booking_id": str(payment.booking_id),
                "status": payment.status.value,
                "amount_cents": payment.amount_cents,
                "currency": payment.currency,
                "provider": payment.provider.value,
                "provider_intent_id": payment.provider_intent_id,
                "payer_email": user.email if user else None,
            }
        )
    return results


@router.post("/payments/reconcile", response_model=PaymentReconcileResponse)
def reconcile_payments(
    payload: PaymentReconcileRequest,
    db: Session = Depends(get_db),
    request: Request,
    admin_user: User = Depends(require_role(UserRole.ADMIN)),
) -> PaymentReconcileResponse:
    settings = get_settings()
    if not settings.enable_demo_ops:
        raise forbidden("Demo ops disabled")
    summary = reconcile_stripe_payments(db, hours=payload.hours, limit=payload.limit)
    log_admin_action(
        db,
        actor_user_id=admin_user.id,
        action="admin_payments_reconcile",
        entity_type="payments",
        entity_id="reconcile",
        before_obj={"hours": payload.hours, "limit": payload.limit},
        after_obj=summary,
        actor_ip=request.client.host if request.client else None,
        actor_user_agent=request.headers.get("user-agent"),
    )
    db.commit()
    return PaymentReconcileResponse(**summary)


@router.get("/payouts")
def list_admin_payouts_overview(
    status: PayoutStatus | None = None,
    milestone: PayoutMilestone | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
) -> list[dict]:
    query = select(Payout)
    if status:
        query = query.where(Payout.status == status)
    if milestone:
        query = query.where(Payout.milestone == milestone)
    payouts = db.execute(query).scalars().all()
    results: list[dict] = []
    for payout in payouts:
        booking_vendor = db.execute(
            select(BookingVendor).where(BookingVendor.id == payout.booking_vendor_id)
        ).scalar_one_or_none()
        vendor_email = None
        booking_id = None
        if booking_vendor:
            booking_id = str(booking_vendor.booking_id)
            vendor = db.execute(
                select(Vendor).where(Vendor.id == booking_vendor.vendor_id)
            ).scalar_one_or_none()
            if vendor:
                user = db.execute(select(User).where(User.id == vendor.user_id)).scalar_one_or_none()
                vendor_email = user.email if user else None
        results.append(
            {
                "payout_id": str(payout.id),
                "booking_id": booking_id,
                "vendor_id": str(booking_vendor.vendor_id) if booking_vendor else None,
                "vendor_email": vendor_email,
                "milestone": payout.milestone.value,
                "amount_cents": payout.amount_cents,
                "status": payout.status.value,
                "admin_approved_by": str(payout.admin_approved_by)
                if payout.admin_approved_by
                else None,
            }
        )
    return results
