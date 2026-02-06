"""Availability model for venues and service providers."""

import uuid
from datetime import date

from sqlalchemy import Boolean, Date, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class Availability(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "availability"
    __table_args__ = (
        UniqueConstraint("entity_type", "entity_id", "date", name="uq_availability_entity_date"),
    )

    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'venue' or 'service_provider'
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    time_slots: Mapped[dict | None] = mapped_column(JSONB)
