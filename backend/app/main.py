"""FastAPI application factory — wires all routers, CORS, and health check."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.crud_factory import create_crud_router
from app.api.routes.admin import router as admin_router
from app.api.routes.auth import router as auth_router
from app.api.routes.chat import router as chat_router
from app.api.routes.integrations import router as integrations_router
from app.api.routes.marketplace import router as marketplace_router
from app.api.routes.payments import router as payments_router
from app.api.routes.planner import router as planner_router
from app.api.routes.plans import router as plans_router
from app.api.routes.templates import router as templates_router
from app.api.routes.webhooks import router as webhooks_router
from app.core.config import settings
from app.core.logging_config import setup_logging
from app.core.request_logging import RequestLoggingMiddleware

# Import all models so they are registered with Base.metadata
import app.models  # noqa: F401

# ---------------------------------------------------------------------------
# Core domain model imports (for typed CRUD routers)
# ---------------------------------------------------------------------------
from app.models.availability import Availability
from app.models.chat import ChatGroup, ChatMessage
from app.models.document import Document
from app.models.event import Event, EventService
from app.models.payment import Payment
from app.models.review import Review
from app.models.service import Service
from app.models.service_provider import ServiceProvider, ServiceProviderService
from app.models.subscription import Subscription
from app.models.template import Template
from app.models.user import User
from app.models.venue import Venue

# Extra JSONB-backed models
from app.models.extra import (
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

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    setup_logging()

    app = FastAPI(
        title="Strathwell API",
        version="0.1.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )
    app.add_middleware(RequestLoggingMiddleware)

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------
    allowed_origins = [settings.FRONTEND_URL]
    # In development, also allow common dev ports
    if settings.ENVIRONMENT == "development":
        for port in ["3000", "5173", "5174"]:
            origin = f"http://localhost:{port}"
            if origin not in allowed_origins:
                allowed_origins.append(origin)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    logger.info(
        "Application startup configuration loaded",
        extra={
            "environment": settings.ENVIRONMENT,
            "frontend_url": settings.FRONTEND_URL,
            "rate_limit_enabled": settings.RATE_LIMIT_ENABLED,
        },
    )

    # ------------------------------------------------------------------
    # Health check
    # ------------------------------------------------------------------
    @app.get("/api/health")
    async def health() -> dict:
        return {"status": "ok", "version": "0.1.0"}

    # ------------------------------------------------------------------
    # Hand-written routers
    # ------------------------------------------------------------------
    app.include_router(auth_router)
    app.include_router(planner_router)
    app.include_router(integrations_router)
    app.include_router(plans_router)
    app.include_router(payments_router)
    app.include_router(chat_router)
    app.include_router(admin_router)
    app.include_router(marketplace_router)
    app.include_router(templates_router)
    app.include_router(webhooks_router)

    # ------------------------------------------------------------------
    # Core domain CRUD routers
    # ------------------------------------------------------------------
    core_entities: list[tuple] = [
        # (Model, resource_path, require_auth, owner_field)
        (Venue, "venues", True, "owner_id"),
        (ServiceProvider, "service-providers", True, "user_id"),
        (ServiceProviderService, "service-provider-services", True, None),
        (Service, "services", False, None),
        (Availability, "availability", True, None),
        (Event, "events", True, "user_id"),
        (EventService, "event-services", True, None),
        (Payment, "payments", True, "payer_id"),
        (Template, "templates", False, None),
        (ChatGroup, "chat-groups", True, None),  # TODO: add event-level access control
        (ChatMessage, "chat-messages", True, "sender_id"),
        (Review, "reviews", True, "reviewer_id"),
        (Subscription, "subscriptions", True, "user_id"),
        (Document, "documents", True, None),
        # NOTE: User is intentionally excluded from generic CRUD.
        # The auth router (/api/auth/me) handles user read/update safely
        # without exposing password_hash, otp_code, etc.
    ]

    for model, resource, auth, owner in core_entities:
        app.include_router(
            create_crud_router(
                model=model,
                resource=resource,
                require_auth=auth,
                owner_field=owner,
            )
        )

    # ------------------------------------------------------------------
    # Extra JSONB CRUD routers
    # ------------------------------------------------------------------
    extra_with_user: list[tuple] = [
        # (Model, resource_path)
        (Plan, "plans"),
        (Conversation, "conversations"),
        (ConversationParticipant, "conversation-participants"),
        (Message, "messages"),
        (Booking, "bookings"),
        (Favorite, "favorites"),
        (Reminder, "reminders"),
        (EventChecklist, "event-checklists"),
        (MarketingCampaign, "marketing-campaigns"),
        (EventCollaborator, "event-collaborators"),
        (InsurancePolicy, "insurance-policies"),
        (Organization, "organizations"),
    ]

    for model, resource in extra_with_user:
        app.include_router(
            create_crud_router(
                model=model,
                resource=resource,
                require_auth=True,
                owner_field="user_id",
            )
        )

    extra_optional_user: list[tuple] = [
        (FeaturedPlacement, "featured-placements"),
        (EventbriteSync, "eventbrite-syncs"),
        (Sponsor, "sponsors"),
        (GeneratedCaption, "generated-captions"),
    ]

    for model, resource in extra_optional_user:
        app.include_router(
            create_crud_router(
                model=model,
                resource=resource,
                require_auth=False,
                owner_field="user_id",
            )
        )

    # Public / anonymous entities — no auth, no owner
    extra_public: list[tuple] = [
        (ContactSubmission, "contact-submissions"),
        (DfyLead, "dfy-leads"),
        (WaitlistSubscriber, "waitlist-subscribers"),
        (DemoRequest, "demo-requests"),
        (OtpVerification, "otp-verifications"),
    ]

    for model, resource in extra_public:
        app.include_router(
            create_crud_router(
                model=model,
                resource=resource,
                require_auth=False,
                owner_field=None,
            )
        )

    return app


app = create_app()
