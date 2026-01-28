from __future__ import annotations

from uuid import uuid4

from sqlalchemy import Enum as SAEnum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, CreatedAtMixin
from app.models.enums import ModerationEventKind


class ModerationEvent(CreatedAtMixin, Base):
    __tablename__ = "moderation_events"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    booking_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("bookings.id"), nullable=True
    )
    kind: Mapped[ModerationEventKind] = mapped_column(
        SAEnum(ModerationEventKind, name="moderation_event_kind"), nullable=False
    )
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)
