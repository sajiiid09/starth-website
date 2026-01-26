from __future__ import annotations

from uuid import uuid4

from sqlalchemy import Enum as SAEnum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin
from app.models.enums import PayoutMilestone, PayoutStatus


class Payout(TimestampMixin, Base):
    __tablename__ = "payouts"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    booking_vendor_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("booking_vendors.id"), nullable=False
    )
    milestone: Mapped[PayoutMilestone] = mapped_column(
        SAEnum(PayoutMilestone, name="payout_milestone"), nullable=False
    )
    amount_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[PayoutStatus] = mapped_column(
        SAEnum(PayoutStatus, name="payout_status"),
        nullable=False,
        default=PayoutStatus.LOCKED,
    )
    admin_approved_by: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    provider_payout_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
