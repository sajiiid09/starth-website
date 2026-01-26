from __future__ import annotations

from uuid import uuid4

from sqlalchemy import Boolean, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin
from app.models.enums import VendorType, VendorVerificationStatus


class Vendor(TimestampMixin, Base):
    __tablename__ = "vendors"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True, index=True
    )
    vendor_type: Mapped[VendorType] = mapped_column(
        SAEnum(VendorType, name="vendor_type"), nullable=False
    )
    verification_status: Mapped[VendorVerificationStatus] = mapped_column(
        SAEnum(VendorVerificationStatus, name="vendor_verification_status"),
        nullable=False,
        default=VendorVerificationStatus.DRAFT,
    )
    payout_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
