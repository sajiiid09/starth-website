from __future__ import annotations

from datetime import date
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import BookingStatus, BookingVendorApprovalStatus, BookingVendorRole


class BookingCreateIn(BaseModel):
    template_id: UUID | None = None
    event_date: date | None = None
    guest_count: int | None = Field(default=None, ge=0)
    location_text: str | None = None
    venue_vendor_id: UUID
    service_vendor_ids: list[UUID] | None = None
    notes: str | None = None
    requested_budget_cents: int | None = Field(default=None, ge=0)
    currency: str = Field(default="usd", min_length=1)


class BookingVendorOut(BaseModel):
    id: str
    vendor_id: str
    role_in_booking: BookingVendorRole
    approval_status: BookingVendorApprovalStatus
    agreed_amount_cents: int
    counter_note: str | None = None


class BookingOut(BaseModel):
    id: str
    organizer_user_id: str
    template_id: str | None = None
    event_date: date | None = None
    guest_count: int | None = None
    location_text: str | None = None
    status: BookingStatus
    total_gross_amount_cents: int
    currency: str
    notes: str | None = None
    requested_budget_cents: int | None = None
    vendors: list[BookingVendorOut]


class VendorApproveIn(BaseModel):
    agreed_amount_cents: int | None = Field(default=None, ge=0)
    note: str | None = None


class VendorCounterIn(BaseModel):
    proposed_amount_cents: int = Field(ge=0)
    note: str | None = None


class VendorDeclineIn(BaseModel):
    note: str | None = None


class OrganizerAcceptCounterIn(BaseModel):
    booking_vendor_id: UUID
    accept: bool
