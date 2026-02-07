"""User model — authentication and profile."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str | None] = mapped_column(String(100))
    last_name: Mapped[str | None] = mapped_column(String(100))
    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="user",
        server_default="user",
    )
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    otp_code: Mapped[str | None] = mapped_column(String(6))
    otp_expiry: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Relationships (lazy loaded by default)
    venues = relationship("Venue", back_populates="owner", lazy="selectin")
    service_provider_profile = relationship("ServiceProvider", back_populates="user", uselist=False, lazy="selectin")
    subscriptions = relationship("Subscription", back_populates="user", lazy="selectin")
