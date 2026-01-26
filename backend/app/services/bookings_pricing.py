from __future__ import annotations

from app.models.booking import Booking
from app.models.booking_vendor import BookingVendor
from app.models.enums import BookingVendorApprovalStatus


def compute_booking_total(booking: Booking, booking_vendors: list[BookingVendor]) -> int:
    if not booking_vendors:
        return 0
    total = 0
    for vendor in booking_vendors:
        if vendor.approval_status != BookingVendorApprovalStatus.APPROVED:
            raise ValueError("vendors_not_approved")
        if vendor.agreed_amount_cents <= 0:
            raise ValueError("missing_pricing")
        total += vendor.agreed_amount_cents
    return total
