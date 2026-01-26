from __future__ import annotations

from typing import Iterable
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.booking_vendor import BookingVendor
from app.models.enums import (
    BookingStatus,
    BookingVendorApprovalStatus,
    BookingVendorRole,
    PayoutMilestone,
    PayoutStatus,
    VendorType,
    VendorVerificationStatus,
)
from app.models.user import User
from app.models.vendor import Vendor
from app.models.payout import Payout
from app.schemas.bookings import BookingCreateIn, OrganizerAcceptCounterIn, VendorApproveIn


def create_booking_request(
    db: Session, organizer_user: User, payload: BookingCreateIn
) -> Booking:
    service_vendor_ids = list(dict.fromkeys(payload.service_vendor_ids or []))
    if payload.venue_vendor_id in service_vendor_ids:
        raise ValueError("venue_vendor_in_services")

    venue_vendor = db.execute(
        select(Vendor).where(Vendor.id == payload.venue_vendor_id)
    ).scalar_one_or_none()
    if not venue_vendor:
        raise ValueError("venue_vendor_not_found")
    if venue_vendor.vendor_type != VendorType.VENUE_OWNER:
        raise ValueError("venue_vendor_type_invalid")
    if venue_vendor.verification_status != VendorVerificationStatus.APPROVED:
        raise ValueError("venue_vendor_not_approved")

    service_vendors = _load_service_vendors(db, service_vendor_ids)

    with db.begin():
        booking = Booking(
            organizer_user_id=organizer_user.id,
            template_id=payload.template_id,
            event_date=payload.event_date,
            guest_count=payload.guest_count,
            location_text=payload.location_text,
            notes=payload.notes,
            requested_budget_cents=payload.requested_budget_cents,
            currency=payload.currency,
            status=BookingStatus.AWAITING_VENDOR_APPROVAL,
        )
        db.add(booking)
        db.flush()

        booking_vendors = [
            BookingVendor(
                booking_id=booking.id,
                vendor_id=venue_vendor.id,
                role_in_booking=BookingVendorRole.VENUE,
                approval_status=BookingVendorApprovalStatus.PENDING,
            )
        ]

        booking_vendors.extend(
            BookingVendor(
                booking_id=booking.id,
                vendor_id=vendor.id,
                role_in_booking=BookingVendorRole.SERVICE,
                approval_status=BookingVendorApprovalStatus.PENDING,
            )
            for vendor in service_vendors
        )

        db.add_all(booking_vendors)

    db.refresh(booking)
    return booking


def vendor_approve_booking(
    db: Session, vendor_user: User, booking_id: UUID, payload: VendorApproveIn
) -> None:
    vendor = _get_vendor_for_user(db, vendor_user)
    with db.begin():
        booking = _lock_booking(db, booking_id)
        booking_vendor = _lock_booking_vendor(db, booking_id, vendor.id)
        booking_vendor.approval_status = BookingVendorApprovalStatus.APPROVED
        if payload.agreed_amount_cents is not None:
            booking_vendor.agreed_amount_cents = payload.agreed_amount_cents
        if payload.note is not None:
            booking_vendor.counter_note = payload.note
        db.add(booking_vendor)
        db.add(booking)
        recompute_booking_status(db, booking.id)


def vendor_decline_booking(
    db: Session, vendor_user: User, booking_id: UUID, note: str | None
) -> None:
    vendor = _get_vendor_for_user(db, vendor_user)
    with db.begin():
        booking = _lock_booking(db, booking_id)
        booking_vendor = _lock_booking_vendor(db, booking_id, vendor.id)
        booking_vendor.approval_status = BookingVendorApprovalStatus.DECLINED
        if note is not None:
            booking_vendor.counter_note = note
        db.add(booking_vendor)
        db.add(booking)
        recompute_booking_status(db, booking.id)


def vendor_counter_booking(
    db: Session,
    vendor_user: User,
    booking_id: UUID,
    proposed_amount_cents: int,
    note: str | None,
) -> None:
    vendor = _get_vendor_for_user(db, vendor_user)
    with db.begin():
        booking = _lock_booking(db, booking_id)
        booking_vendor = _lock_booking_vendor(db, booking_id, vendor.id)
        booking_vendor.approval_status = BookingVendorApprovalStatus.COUNTERED
        booking_vendor.agreed_amount_cents = proposed_amount_cents
        booking_vendor.counter_note = note
        db.add(booking_vendor)
        db.add(booking)
        recompute_booking_status(db, booking.id)


def organizer_accept_counter(
    db: Session,
    organizer_user: User,
    booking_id: UUID,
    payload: OrganizerAcceptCounterIn,
) -> None:
    with db.begin():
        booking = _lock_booking(db, booking_id)
        if booking.organizer_user_id != organizer_user.id:
            raise ValueError("booking_forbidden")
        booking_vendor = db.execute(
            select(BookingVendor)
            .where(BookingVendor.id == payload.booking_vendor_id)
            .where(BookingVendor.booking_id == booking_id)
            .with_for_update()
        ).scalar_one_or_none()
        if not booking_vendor:
            raise ValueError("booking_vendor_not_found")
        if payload.accept:
            booking_vendor.approval_status = BookingVendorApprovalStatus.APPROVED
        else:
            booking_vendor.approval_status = BookingVendorApprovalStatus.DECLINED
        db.add(booking_vendor)
        recompute_booking_status(db, booking.id)


def recompute_booking_status(db: Session, booking_id: UUID) -> Booking:
    booking = _lock_booking(db, booking_id)
    vendors = db.execute(
        select(BookingVendor).where(BookingVendor.booking_id == booking_id)
    ).scalars().all()
    if vendors and all(
        vendor.approval_status == BookingVendorApprovalStatus.APPROVED for vendor in vendors
    ):
        booking.status = BookingStatus.READY_FOR_PAYMENT
    else:
        booking.status = BookingStatus.AWAITING_VENDOR_APPROVAL
    db.add(booking)
    return booking


def get_booking_with_vendors(
    db: Session, booking_id: UUID
) -> tuple[Booking, list[BookingVendor]] | None:
    booking = db.execute(select(Booking).where(Booking.id == booking_id)).scalar_one_or_none()
    if not booking:
        return None
    vendors = db.execute(
        select(BookingVendor).where(BookingVendor.booking_id == booking_id)
    ).scalars().all()
    return booking, vendors


def list_bookings_for_vendor(
    db: Session,
    vendor_id: UUID,
    approval_statuses: Iterable[BookingVendorApprovalStatus],
) -> list[tuple[Booking, list[BookingVendor]]]:
    vendor_rows = db.execute(
        select(BookingVendor).where(
            BookingVendor.vendor_id == vendor_id,
            BookingVendor.approval_status.in_(list(approval_statuses)),
        )
    ).scalars().all()
    booking_ids = {row.booking_id for row in vendor_rows}
    if not booking_ids:
        return []

    bookings = db.execute(select(Booking).where(Booking.id.in_(booking_ids))).scalars().all()
    all_vendors = db.execute(
        select(BookingVendor).where(BookingVendor.booking_id.in_(booking_ids))
    ).scalars().all()
    vendors_by_booking = _group_vendors_by_booking(all_vendors)
    return [(booking, vendors_by_booking.get(booking.id, [])) for booking in bookings]


def list_bookings_for_organizer(
    db: Session, organizer_user_id: UUID
) -> list[tuple[Booking, list[BookingVendor]]]:
    bookings = db.execute(
        select(Booking).where(Booking.organizer_user_id == organizer_user_id)
    ).scalars().all()
    if not bookings:
        return []
    booking_ids = [booking.id for booking in bookings]
    vendors = db.execute(
        select(BookingVendor).where(BookingVendor.booking_id.in_(booking_ids))
    ).scalars().all()
    vendors_by_booking = _group_vendors_by_booking(vendors)
    return [(booking, vendors_by_booking.get(booking.id, [])) for booking in bookings]


def list_all_bookings(db: Session) -> list[tuple[Booking, list[BookingVendor]]]:
    bookings = db.execute(select(Booking)).scalars().all()
    if not bookings:
        return []
    booking_ids = [booking.id for booking in bookings]
    vendors = db.execute(
        select(BookingVendor).where(BookingVendor.booking_id.in_(booking_ids))
    ).scalars().all()
    vendors_by_booking = _group_vendors_by_booking(vendors)
    return [(booking, vendors_by_booking.get(booking.id, [])) for booking in bookings]


def get_vendor_for_user(db: Session, user: User) -> Vendor:
    return _get_vendor_for_user(db, user)


def complete_booking_for_organizer(
    db: Session, organizer_user: User, booking_id: UUID
) -> Booking:
    with db.begin():
        booking = _lock_booking(db, booking_id)
        if booking.organizer_user_id != organizer_user.id:
            raise ValueError("booking_forbidden")
        if booking.status not in {BookingStatus.PAID, BookingStatus.IN_PROGRESS}:
            raise ValueError("booking_not_completable")
        booking.status = BookingStatus.COMPLETED
        _unlock_completion_payouts(db, booking.id)
        db.add(booking)
    return booking


def force_complete_booking(db: Session, booking_id: UUID) -> Booking:
    with db.begin():
        booking = _lock_booking(db, booking_id)
        booking.status = BookingStatus.COMPLETED
        _unlock_completion_payouts(db, booking.id)
        db.add(booking)
    return booking


def _load_service_vendors(db: Session, vendor_ids: list[UUID]) -> list[Vendor]:
    if not vendor_ids:
        return []
    vendors = db.execute(select(Vendor).where(Vendor.id.in_(vendor_ids))).scalars().all()
    if len(vendors) != len(vendor_ids):
        raise ValueError("service_vendor_not_found")
    for vendor in vendors:
        if vendor.vendor_type != VendorType.SERVICE_PROVIDER:
            raise ValueError("service_vendor_type_invalid")
        if vendor.verification_status != VendorVerificationStatus.APPROVED:
            raise ValueError("service_vendor_not_approved")
    return vendors


def _get_vendor_for_user(db: Session, user: User) -> Vendor:
    vendor = db.execute(select(Vendor).where(Vendor.user_id == user.id)).scalar_one_or_none()
    if not vendor:
        raise ValueError("vendor_not_found")
    if vendor.verification_status != VendorVerificationStatus.APPROVED:
        raise ValueError("vendor_not_approved")
    return vendor


def _lock_booking(db: Session, booking_id: UUID) -> Booking:
    booking = db.execute(
        select(Booking).where(Booking.id == booking_id).with_for_update()
    ).scalar_one_or_none()
    if not booking:
        raise ValueError("booking_not_found")
    return booking


def _lock_booking_vendor(db: Session, booking_id: UUID, vendor_id: UUID) -> BookingVendor:
    booking_vendor = db.execute(
        select(BookingVendor)
        .where(
            BookingVendor.booking_id == booking_id,
            BookingVendor.vendor_id == vendor_id,
        )
        .with_for_update()
    ).scalar_one_or_none()
    if not booking_vendor:
        raise ValueError("booking_vendor_not_found")
    return booking_vendor


def _group_vendors_by_booking(
    booking_vendors: Iterable[BookingVendor],
) -> dict[UUID, list[BookingVendor]]:
    grouped: dict[UUID, list[BookingVendor]] = {}
    for booking_vendor in booking_vendors:
        grouped.setdefault(booking_vendor.booking_id, []).append(booking_vendor)
    return grouped


def _unlock_completion_payouts(db: Session, booking_id: UUID) -> None:
    booking_vendor_ids = select(BookingVendor.id).where(
        BookingVendor.booking_id == booking_id
    )
    payouts = db.execute(
        select(Payout)
        .where(Payout.booking_vendor_id.in_(booking_vendor_ids))
        .where(Payout.milestone == PayoutMilestone.COMPLETION)
        .where(Payout.status == PayoutStatus.LOCKED)
    ).scalars().all()
    for payout in payouts:
        payout.status = PayoutStatus.ELIGIBLE
        db.add(payout)
