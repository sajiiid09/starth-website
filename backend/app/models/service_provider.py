"""Service provider models."""

import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ServiceProvider(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "service_providers"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    location_city: Mapped[str] = mapped_column(String(100), nullable=False, default="", index=True)
    service_area: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list, server_default="'{}'")
    pricing_structure: Mapped[dict | None] = mapped_column(JSONB)
    photos: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False, server_default="'{}'", default=list)
    status: Mapped[str] = mapped_column(
        String(50), default="pending", server_default="pending", index=True
    )

    # Relationships
    user = relationship("User", back_populates="service_provider_profile")
    offered_services = relationship("ServiceProviderService", back_populates="provider", lazy="selectin")


class ServiceProviderService(Base, UUIDPrimaryKeyMixin):
    """Junction table: which services a provider offers, with pricing."""

    __tablename__ = "service_provider_services"

    service_provider_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("service_providers.id", ondelete="CASCADE"), nullable=False
    )
    service_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), nullable=False
    )
    price_range: Mapped[dict | None] = mapped_column(JSONB)

    # Relationships
    provider = relationship("ServiceProvider", back_populates="offered_services")
    service = relationship("Service", lazy="selectin")
