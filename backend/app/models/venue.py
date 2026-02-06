"""Venue model."""

import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Venue(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "venues"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    location_address: Mapped[str] = mapped_column(Text, nullable=False, default="")
    location_city: Mapped[str] = mapped_column(String(100), nullable=False, default="", index=True)
    location_lat: Mapped[float | None] = mapped_column(Numeric(10, 8))
    location_lng: Mapped[float | None] = mapped_column(Numeric(11, 8))
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    amenities: Mapped[dict] = mapped_column(JSONB, server_default="'[]'", default=list)
    pricing_structure: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default="'{}'", default=dict)
    floor_plan_url: Mapped[str | None] = mapped_column(Text)
    floor_plan_generated: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    status: Mapped[str] = mapped_column(
        String(50), default="pending", server_default="pending", index=True
    )
    photos: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False, server_default="'{}'", default=list)

    # Relationships
    owner = relationship("User", back_populates="venues")
