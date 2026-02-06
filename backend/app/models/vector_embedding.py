"""Vector embedding model for RAG (pgvector)."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin

# Note: The actual vector column uses pgvector's Vector type.
# We import it conditionally so the app can still start without pgvector extension.
try:
    from pgvector.sqlalchemy import Vector

    HAS_PGVECTOR = True
except ImportError:
    HAS_PGVECTOR = False


class VectorEmbedding(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "vector_embeddings"

    content_type: Mapped[str | None] = mapped_column(String(50))  # venue, service, template, provider
    content_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    # embedding column: 1536 dimensions (adjustable per model)
    if HAS_PGVECTOR:
        embedding = mapped_column(Vector(1536))
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
