from __future__ import annotations

from uuid import uuid4

from sqlalchemy import Enum as SAEnum, ForeignKey, Index, Integer, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin
from app.models.enums import BookingVendorApprovalStatus, BookingVendorRole


class BookingVendor(TimestampMixin, Base):
    __tablename__ = "booking_vendors"
    __table_args__ = (
        UniqueConstraint("booking_id", "vendor_id", name="uq_booking_vendor"),
        Index("ix_booking_vendors_booking_id", "booking_id"),
    )

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    booking_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("bookings.id"), nullable=False
    )
    vendor_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vendors.id"), nullable=False
    )
    role_in_booking: Mapped[BookingVendorRole] = mapped_column(
        SAEnum(BookingVendorRole, name="booking_vendor_role"), nullable=False
    )
    approval_status: Mapped[BookingVendorApprovalStatus] = mapped_column(
        SAEnum(BookingVendorApprovalStatus, name="booking_vendor_approval_status"),
        nullable=False,
        default=BookingVendorApprovalStatus.PENDING,
    )
    agreed_amount_cents: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    counter_note: Mapped[str | None] = mapped_column(Text, nullable=True)
