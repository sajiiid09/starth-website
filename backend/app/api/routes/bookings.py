from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role, require_subscription_active
from app.models.booking import Booking
from app.models.booking_vendor import BookingVendor
from app.models.audit_log import AuditLog
from app.models.enums import BookingVendorApprovalStatus, UserRole
from app.models.user import User
from app.schemas.bookings import (
    BookingCreateIn,
    BookingOut,
    BookingVendorOut,
    OrganizerAcceptCounterIn,
    VendorApproveIn,
    VendorCounterIn,
    VendorDeclineIn,
)
from app.services import bookings_service

router = APIRouter(tags=["bookings"])


@router.post("/bookings", response_model=BookingOut)
def create_booking(
    payload: BookingCreateIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.ORGANIZER)),
    _: User = Depends(require_subscription_active),
) -> BookingOut:
    try:
        booking = bookings_service.create_booking_request(db, user, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail={"error": str(exc)}
        ) from exc

    booking_with_vendors = bookings_service.get_booking_with_vendors(db, booking.id)
    if not booking_with_vendors:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    booking, vendors = booking_with_vendors
    return _serialize_booking(booking, vendors)


@router.get("/bookings/{booking_id}", response_model=BookingOut)
def get_booking(
    booking_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.ORGANIZER)),
) -> BookingOut:
    booking_with_vendors = bookings_service.get_booking_with_vendors(db, booking_id)
    if not booking_with_vendors:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    booking, vendors = booking_with_vendors
    if booking.organizer_user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return _serialize_booking(booking, vendors)


@router.get("/vendor/bookings", response_model=list[BookingOut])
def list_vendor_bookings(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.VENDOR)),
) -> list[BookingOut]:
    try:
        vendor = bookings_service.get_vendor_for_user(db, user)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail={"error": str(exc)}
        ) from exc
    booking_pairs = bookings_service.list_bookings_for_vendor(
        db,
        vendor.id,
        [BookingVendorApprovalStatus.PENDING, BookingVendorApprovalStatus.COUNTERED],
    )
    return [_serialize_booking(booking, vendors) for booking, vendors in booking_pairs]


@router.post("/vendor/bookings/{booking_id}/approve", response_model=BookingOut)
def approve_booking(
    booking_id: UUID,
    payload: VendorApproveIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.VENDOR)),
) -> BookingOut:
    try:
        bookings_service.vendor_approve_booking(db, user, booking_id, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail={"error": str(exc)}
        ) from exc
    booking_with_vendors = bookings_service.get_booking_with_vendors(db, booking_id)
    if not booking_with_vendors:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    booking, vendors = booking_with_vendors
    return _serialize_booking(booking, vendors)


@router.post("/vendor/bookings/{booking_id}/decline", response_model=BookingOut)
def decline_booking(
    booking_id: UUID,
    payload: VendorDeclineIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.VENDOR)),
) -> BookingOut:
    try:
        bookings_service.vendor_decline_booking(db, user, booking_id, payload.note)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail={"error": str(exc)}
        ) from exc
    booking_with_vendors = bookings_service.get_booking_with_vendors(db, booking_id)
    if not booking_with_vendors:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    booking, vendors = booking_with_vendors
    return _serialize_booking(booking, vendors)


@router.post("/vendor/bookings/{booking_id}/counter", response_model=BookingOut)
def counter_booking(
    booking_id: UUID,
    payload: VendorCounterIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.VENDOR)),
) -> BookingOut:
    try:
        bookings_service.vendor_counter_booking(
            db, user, booking_id, payload.proposed_amount_cents, payload.note
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail={"error": str(exc)}
        ) from exc
    booking_with_vendors = bookings_service.get_booking_with_vendors(db, booking_id)
    if not booking_with_vendors:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    booking, vendors = booking_with_vendors
    return _serialize_booking(booking, vendors)


@router.post(
    "/bookings/{booking_id}/vendors/{booking_vendor_id}/accept-counter",
    response_model=BookingOut,
)
def accept_counter(
    booking_id: UUID,
    booking_vendor_id: UUID,
    payload: OrganizerAcceptCounterIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.ORGANIZER)),
) -> BookingOut:
    if payload.booking_vendor_id != booking_vendor_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "booking_vendor_id_mismatch"},
        )
    try:
        bookings_service.organizer_accept_counter(db, user, booking_id, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail={"error": str(exc)}
        ) from exc
    booking_with_vendors = bookings_service.get_booking_with_vendors(db, booking_id)
    if not booking_with_vendors:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    booking, vendors = booking_with_vendors
    return _serialize_booking(booking, vendors)


@router.post("/bookings/{booking_id}/complete", response_model=BookingOut)
def complete_booking(
    booking_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.ORGANIZER)),
) -> BookingOut:
    try:
        booking = bookings_service.complete_booking_for_organizer(db, user, booking_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail={"error": str(exc)}
        ) from exc
    audit_log = AuditLog(
        actor_user_id=user.id,
        action="booking_complete",
        entity_type="booking",
        entity_id=str(booking.id),
        before_json=None,
        after_json={"status": booking.status.value},
    )
    db.add(audit_log)
    db.commit()
    booking_with_vendors = bookings_service.get_booking_with_vendors(db, booking_id)
    if not booking_with_vendors:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    booking, vendors = booking_with_vendors
    return _serialize_booking(booking, vendors)


@router.get("/admin/bookings", response_model=list[BookingOut])
def list_admin_bookings(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
) -> list[BookingOut]:
    booking_pairs = bookings_service.list_all_bookings(db)
    return [_serialize_booking(booking, vendors) for booking, vendors in booking_pairs]


@router.get("/admin/bookings/{booking_id}", response_model=BookingOut)
def get_admin_booking(
    booking_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
) -> BookingOut:
    booking_with_vendors = bookings_service.get_booking_with_vendors(db, booking_id)
    if not booking_with_vendors:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    booking, vendors = booking_with_vendors
    return _serialize_booking(booking, vendors)


@router.post("/admin/bookings/{booking_id}/force-complete", response_model=BookingOut)
def force_complete_booking(
    booking_id: UUID,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(UserRole.ADMIN)),
) -> BookingOut:
    booking = bookings_service.force_complete_booking(db, booking_id)
    audit_log = AuditLog(
        actor_user_id=admin_user.id,
        action="admin_booking_force_complete",
        entity_type="booking",
        entity_id=str(booking.id),
        before_json=None,
        after_json={"status": booking.status.value},
    )
    db.add(audit_log)
    db.commit()
    booking_with_vendors = bookings_service.get_booking_with_vendors(db, booking_id)
    if not booking_with_vendors:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    booking, vendors = booking_with_vendors
    return _serialize_booking(booking, vendors)


def _serialize_booking(booking: Booking, vendors: list[BookingVendor]) -> BookingOut:
    vendor_outputs = [
        BookingVendorOut(
            id=str(vendor.id),
            vendor_id=str(vendor.vendor_id),
            role_in_booking=vendor.role_in_booking,
            approval_status=vendor.approval_status,
            agreed_amount_cents=vendor.agreed_amount_cents,
            counter_note=vendor.counter_note,
        )
        for vendor in vendors
    ]
    return BookingOut(
        id=str(booking.id),
        organizer_user_id=str(booking.organizer_user_id),
        template_id=str(booking.template_id) if booking.template_id else None,
        event_date=booking.event_date,
        guest_count=booking.guest_count,
        location_text=booking.location_text,
        status=booking.status,
        total_gross_amount_cents=booking.total_gross_amount_cents,
        currency=booking.currency,
        notes=booking.notes,
        requested_budget_cents=booking.requested_budget_cents,
        vendors=vendor_outputs,
    )
