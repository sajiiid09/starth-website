"""Extra entity models — thin JSONB tables for frontend-only entities.

Each model stores arbitrary frontend payloads in a `data` JSONB column.
Some entities have a `user_id` FK for ownership; others are public/anonymous.
"""

import uuid
from typing import Any

from sqlalchemy import ForeignKey, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


# ---------------------------------------------------------------------------
# Helper base classes
# ---------------------------------------------------------------------------


class _ExtraBase(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Abstract base for extra JSONB-backed entities."""

    __abstract__ = True

    data: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))


class _ExtraWithUser(_ExtraBase):
    """Abstract base for extra entities that have an owner."""

    __abstract__ = True

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )


class _ExtraOptionalUser(_ExtraBase):
    """Abstract base for extra entities that may optionally have a user."""

    __abstract__ = True

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )


# ---------------------------------------------------------------------------
# Entities WITH required user_id
# ---------------------------------------------------------------------------


class Plan(_ExtraWithUser):
    __tablename__ = "plans"


class Conversation(_ExtraWithUser):
    __tablename__ = "conversations"


class ConversationParticipant(_ExtraWithUser):
    __tablename__ = "conversation_participants"


class Message(_ExtraWithUser):
    __tablename__ = "messages"


class Booking(_ExtraWithUser):
    __tablename__ = "bookings"


class Favorite(_ExtraWithUser):
    __tablename__ = "favorites"


class Reminder(_ExtraWithUser):
    __tablename__ = "reminders"


class EventChecklist(_ExtraWithUser):
    __tablename__ = "event_checklists"


class MarketingCampaign(_ExtraWithUser):
    __tablename__ = "marketing_campaigns"


class EventCollaborator(_ExtraWithUser):
    __tablename__ = "event_collaborators"


class InsurancePolicy(_ExtraWithUser):
    __tablename__ = "insurance_policies"


class Organization(_ExtraWithUser):
    __tablename__ = "organizations"


# ---------------------------------------------------------------------------
# Entities with OPTIONAL user_id
# ---------------------------------------------------------------------------


class FeaturedPlacement(_ExtraOptionalUser):
    __tablename__ = "featured_placements"


class EventbriteSync(_ExtraOptionalUser):
    __tablename__ = "eventbrite_syncs"


class Sponsor(_ExtraOptionalUser):
    __tablename__ = "sponsors"


class GeneratedCaption(_ExtraOptionalUser):
    __tablename__ = "generated_captions"


class OtpVerification(_ExtraBase):
    """OTP records — linked by email string, not user FK."""

    __tablename__ = "otp_verifications"

    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)


# ---------------------------------------------------------------------------
# Public / anonymous entities (no user_id)
# ---------------------------------------------------------------------------


class ContactSubmission(_ExtraBase):
    __tablename__ = "contact_submissions"


class DfyLead(_ExtraBase):
    __tablename__ = "dfy_leads"


class WaitlistSubscriber(_ExtraBase):
    __tablename__ = "waitlist_subscribers"


class DemoRequest(_ExtraBase):
    __tablename__ = "demo_requests"
