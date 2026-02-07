"""Re-export all models so Alembic and the app can discover them via Base.metadata."""

# Core domain models
from app.models.availability import Availability  # noqa: F401
from app.models.chat import ChatGroup, ChatMessage  # noqa: F401
from app.models.document import Document  # noqa: F401
from app.models.event import Event, EventService  # noqa: F401
from app.models.payment import Payment  # noqa: F401
from app.models.review import Review  # noqa: F401
from app.models.service import Service  # noqa: F401
from app.models.service_provider import ServiceProvider, ServiceProviderService  # noqa: F401
from app.models.subscription import Subscription  # noqa: F401
from app.models.template import Template  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.vector_embedding import VectorEmbedding  # noqa: F401
from app.models.venue import Venue  # noqa: F401

# Extra JSONB-backed entities
from app.models.extra import (  # noqa: F401
    Booking,
    ContactSubmission,
    Conversation,
    ConversationParticipant,
    DemoRequest,
    DfyLead,
    EventbriteSync,
    EventChecklist,
    EventCollaborator,
    Favorite,
    FeaturedPlacement,
    GeneratedCaption,
    InsurancePolicy,
    MarketingCampaign,
    Message,
    Organization,
    OtpVerification,
    Plan,
    Reminder,
    Sponsor,
    WaitlistSubscriber,
)
