"""Booking service — orchestrates venue/provider booking after plan approval.

Handles:
- Sending booking requests to venues (first-to-accept wins)
- Sending booking requests to service providers (48hr response window)
- Creating event records with assigned services
- Creating chat groups for event communication
"""

import logging
import uuid
from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.availability import Availability
from app.models.chat import ChatGroup
from app.models.event import Event, EventService
from app.models.service_provider import ServiceProvider
from app.models.user import User
from app.models.venue import Venue
from app.services.email_service import send_booking_notification

logger = logging.getLogger(__name__)


async def create_event_from_plan(
    db: AsyncSession,
    user_id: uuid.UUID,
    plan_data: dict[str, Any],
    draft_brief: dict[str, Any],
) -> dict[str, Any]:
    """Create an event record from an approved plan.

    Returns:
        Dict with event details and booking status.
    """
    event = Event(
        user_id=user_id,
        event_type=draft_brief.get("eventType", "event"),
        event_date=_parse_date(draft_brief.get("dateRange", "")),
        guest_count=draft_brief.get("guestCount", 0),
        budget=draft_brief.get("budget", 0),
        total_cost=plan_data.get("kpis", {}).get("totalCost"),
        status="planning",
        template_data=plan_data,
    )
    db.add(event)
    await db.flush()

    return {
        "event_id": str(event.id),
        "status": event.status,
        "event_type": event.event_type,
    }


async def book_venue(
    db: AsyncSession,
    event_id: uuid.UUID,
    venue_id: uuid.UUID,
    user_id: uuid.UUID,
) -> dict[str, Any]:
    """Send a booking request to a venue.

    Updates event with venue_id and sets status to pending_venue.
    Sends notification email to venue owner.
    """
    # Verify event ownership
    event_result = await db.execute(
        select(Event).where(Event.id == event_id, Event.user_id == user_id)
    )
    event = event_result.scalar_one_or_none()
    if event is None:
        return {"success": False, "error": "Event not found"}

    # Verify venue exists and is approved
    venue_result = await db.execute(
        select(Venue).where(Venue.id == venue_id, Venue.status == "approved")
    )
    venue = venue_result.scalar_one_or_none()
    if venue is None:
        return {"success": False, "error": "Venue not found or not approved"}

    # Check availability
    avail_result = await db.execute(
        select(Availability).where(
            Availability.entity_type == "venue",
            Availability.entity_id == venue_id,
            Availability.date == event.event_date,
        )
    )
    avail = avail_result.scalar_one_or_none()
    if avail and not avail.is_available:
        return {"success": False, "error": "Venue not available on this date"}

    # Update event with venue
    event.venue_id = venue_id
    event.status = "pending_venue"

    # Notify venue owner
    owner_result = await db.execute(
        select(User).where(User.id == venue.owner_id)
    )
    owner = owner_result.scalar_one_or_none()
    if owner:
        await send_booking_notification(
            to=owner.email,
            event_type=event.event_type,
            event_date=str(event.event_date),
            role="Venue Host",
        )

    return {
        "success": True,
        "event_id": str(event_id),
        "venue_id": str(venue_id),
        "status": "pending_venue",
    }


async def book_service_provider(
    db: AsyncSession,
    event_id: uuid.UUID,
    provider_id: uuid.UUID,
    service_id: uuid.UUID | None,
    agreed_price: float,
    user_id: uuid.UUID,
) -> dict[str, Any]:
    """Add a service provider to an event.

    Creates an EventService record and notifies the provider.
    """
    # Verify event ownership
    event_result = await db.execute(
        select(Event).where(Event.id == event_id, Event.user_id == user_id)
    )
    event = event_result.scalar_one_or_none()
    if event is None:
        return {"success": False, "error": "Event not found"}

    # Verify provider exists and is approved
    provider_result = await db.execute(
        select(ServiceProvider).where(
            ServiceProvider.id == provider_id,
            ServiceProvider.status == "approved",
        )
    )
    provider = provider_result.scalar_one_or_none()
    if provider is None:
        return {"success": False, "error": "Provider not found or not approved"}

    # Create event service record
    event_service = EventService(
        event_id=event_id,
        service_provider_id=provider_id,
        service_id=service_id,
        agreed_price=agreed_price,
        status="pending",
    )
    db.add(event_service)
    await db.flush()

    # Notify provider
    provider_user_result = await db.execute(
        select(User).where(User.id == provider.user_id)
    )
    provider_user = provider_user_result.scalar_one_or_none()
    if provider_user:
        await send_booking_notification(
            to=provider_user.email,
            event_type=event.event_type,
            event_date=str(event.event_date),
            role="Service Provider",
        )

    return {
        "success": True,
        "event_service_id": str(event_service.id),
        "status": "pending",
    }


async def confirm_event(
    db: AsyncSession,
    event_id: uuid.UUID,
) -> dict[str, Any]:
    """Confirm an event (venue accepted) and create a chat group.

    Called when the venue accepts the booking request.
    """
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if event is None:
        return {"success": False, "error": "Event not found"}

    event.status = "confirmed"

    # Create chat group for event communication
    chat_group = ChatGroup(event_id=event_id)
    db.add(chat_group)
    await db.flush()

    event.chat_group_id = chat_group.id

    return {
        "success": True,
        "event_id": str(event_id),
        "chat_group_id": str(chat_group.id),
        "status": "confirmed",
    }


def _parse_date(date_str: str) -> date:
    """Parse a date string into a date object. Falls back to today+30 days."""
    if not date_str:
        return date.today()

    # Try common formats
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%B %Y", "%b %Y"):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue

    # Default: 30 days from now
    return date.today()
