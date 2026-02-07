"""Document model — legal documents for onboarding."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class Document(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "documents"

    entity_type: Mapped[str | None] = mapped_column(String(50))  # 'venue' or 'service_provider'
    entity_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    document_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_url: Mapped[str] = mapped_column(Text, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
