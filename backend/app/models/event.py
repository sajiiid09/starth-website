"""Event and EventService models."""

import uuid
from datetime import date, datetime, time

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, Time
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Event(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "events"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    venue_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("venues.id"), index=True
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    event_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    event_time: Mapped[time | None] = mapped_column(Time)
    guest_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    budget: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    total_cost: Mapped[float | None] = mapped_column(Numeric(10, 2))
    status: Mapped[str] = mapped_column(
        String(50), default="planning", server_default="planning", index=True
    )
    template_data: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default="'{}'", default=dict)
    iterations_used: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    chat_group_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cancellation_reason: Mapped[str | None] = mapped_column(Text)

    # Relationships
    event_services = relationship("EventService", back_populates="event", lazy="selectin")


class EventService(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Junction: which service providers are assigned to an event."""

    __tablename__ = "event_services"

    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    service_provider_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("service_providers.id")
    )
    service_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("services.id")
    )
    agreed_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(50), default="pending", server_default="pending")
    completion_photos: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    completion_notes: Mapped[str | None] = mapped_column(Text)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Relationships
    event = relationship("Event", back_populates="event_services")
