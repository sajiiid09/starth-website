from __future__ import annotations

from uuid import uuid4

from sqlalchemy import ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class ServiceProfile(TimestampMixin, Base):
    __tablename__ = "service_profiles"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    vendor_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vendors.id"), nullable=False, unique=True
    )
    categories_json: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    service_areas_json: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    pricing_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    assets_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
