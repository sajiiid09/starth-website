"""Template model — pre-made event templates for the library."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class Template(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "templates"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    template_data: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default="'{}'", default=dict)
    before_layout_url: Mapped[str | None] = mapped_column(Text)
    after_layout_url: Mapped[str | None] = mapped_column(Text)
    budget_min: Mapped[float | None] = mapped_column(Numeric(10, 2))
    budget_max: Mapped[float | None] = mapped_column(Numeric(10, 2))
    guest_count: Mapped[int | None] = mapped_column(Integer)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    times_used: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    average_rating: Mapped[float | None] = mapped_column(Numeric(3, 2))
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
