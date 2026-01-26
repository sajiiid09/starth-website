from __future__ import annotations

from uuid import uuid4

from sqlalchemy import Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class Template(TimestampMixin, Base):
    __tablename__ = "templates"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    blueprint_json: Mapped[dict] = mapped_column(JSONB, nullable=False)
    est_cost_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    est_cost_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
