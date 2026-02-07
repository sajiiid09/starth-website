from __future__ import annotations

from uuid import uuid4

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class VenueProfile(TimestampMixin, Base):
    __tablename__ = "venue_profiles"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    vendor_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vendors.id"), nullable=False, unique=True
    )
    venue_name: Mapped[str] = mapped_column(String(255), nullable=False)
    location_text: Mapped[str] = mapped_column(String(255), nullable=False)
    square_feet: Mapped[int | None] = mapped_column(Integer, nullable=True)
    capacity_comfortable: Mapped[int | None] = mapped_column(Integer, nullable=True)
    capacity_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    pricing_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    assets_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
