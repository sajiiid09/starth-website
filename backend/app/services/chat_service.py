"""Chat service — content guardrails and anonymous identity management.

Responsibilities:
1. Scan outgoing chat messages for contact info (URLs, phone, email, social handles)
2. Block messages that leak contact information and set blocked_reason
3. Map user roles to anonymous display names per chat group
4. Retrieve chat history for a group
"""

import logging
import re
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat import ChatGroup, ChatMessage
from app.models.event import Event, EventService
from app.models.extra import EventCollaborator
from app.models.service_provider import ServiceProvider
from app.models.venue import Venue
from app.utils.exceptions import ForbiddenError, NotFoundError

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Contact-info detection patterns
# ---------------------------------------------------------------------------

_PHONE_RE = re.compile(
    r"(?<!\d)"  # not preceded by digit
    r"(?:\+?1[-.\s]?)?"  # optional country code
    r"(?:\(?\d{3}\)?[-.\s]?)"  # area code
    r"\d{3}[-.\s]?\d{4}"  # local number
    r"(?!\d)",  # not followed by digit
)

_EMAIL_RE = re.compile(
    r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}",
)

_URL_RE = re.compile(
    r"https?://[^\s<>\"']+|www\.[^\s<>\"']+",
    re.IGNORECASE,
)

_SOCIAL_RE = re.compile(
    r"@[a-zA-Z0-9_.]{3,30}"  # @handle style
    r"|(?:instagram|facebook|fb|twitter|tiktok|snap(?:chat)?|linkedin|telegram|whatsapp)"
    r"(?:[\s:./@]+|\s+(?:is|at|me)\s+)[a-zA-Z0-9_.]{3,30}",
    re.IGNORECASE,
)

_BLOCKED_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (_PHONE_RE, "phone number"),
    (_EMAIL_RE, "email address"),
    (_URL_RE, "URL"),
    (_SOCIAL_RE, "social media handle"),
]


def check_content_guardrails(text: str) -> tuple[bool, str | None]:
    """Check if text contains forbidden contact info.

    Returns:
        (is_blocked, blocked_reason) — (False, None) if clean.
    """
    for pattern, label in _BLOCKED_PATTERNS:
        if pattern.search(text):
            return True, f"Message blocked: contains {label}"
    return False, None


# ---------------------------------------------------------------------------
# Anonymous name resolution
# ---------------------------------------------------------------------------

# Role → anonymous display name mapping
_ROLE_NAMES: dict[str, str] = {
    "organizer": "Event Organizer",
    "venue_host": "Venue Host",
    "service_provider": "Service Provider",
}


async def resolve_anonymous_name(
    db: AsyncSession,
    user_id: uuid.UUID,
    event_id: uuid.UUID,
) -> str:
    """Determine the anonymous display name for a user within an event context.

    Rules:
    - If the user owns the event → "Event Organizer"
    - If the user owns the venue booked for the event → "Venue Host"
    - If the user is a service provider on the event → service category name or "Service Provider"
    - Fallback → "Participant"
    """
    # Check if event organizer
    event_result = await db.execute(
        select(Event).where(Event.id == event_id)
    )
    event = event_result.scalar_one_or_none()
    if event is None:
        return "Participant"

    if event.user_id == user_id:
        return _ROLE_NAMES["organizer"]

    # Check if venue host
    if event.venue_id:
        venue_result = await db.execute(
            select(Venue).where(Venue.id == event.venue_id)
        )
        venue = venue_result.scalar_one_or_none()
        if venue and venue.owner_id == user_id:
            return _ROLE_NAMES["venue_host"]

    # Check if service provider on this event
    provider_result = await db.execute(
        select(ServiceProvider).where(ServiceProvider.user_id == user_id)
    )
    provider = provider_result.scalar_one_or_none()
    if provider:
        es_result = await db.execute(
            select(EventService).where(
                EventService.event_id == event_id,
                EventService.service_provider_id == provider.id,
            )
        )
        event_service = es_result.scalar_one_or_none()
        if event_service:
            return _ROLE_NAMES["service_provider"]

    return "Participant"


# ---------------------------------------------------------------------------
# Chat CRUD operations
# ---------------------------------------------------------------------------


async def send_message(
    db: AsyncSession,
    chat_group_id: uuid.UUID,
    sender_id: uuid.UUID,
    content: str,
    attachment_url: str | None = None,
) -> dict:
    """Send a message to a chat group with content guardrails.

    Returns:
        Dict with message data. If blocked, includes blocked_reason.
    """
    # Look up the chat group to get event_id for anonymous name resolution
    group_result = await db.execute(
        select(ChatGroup).where(ChatGroup.id == chat_group_id)
    )
    group = group_result.scalar_one_or_none()
    if group is None:
        raise NotFoundError("Chat group not found")

    await assert_chat_access(db, user_id=sender_id, event_id=group.event_id)

    # Resolve anonymous name
    anonymous_name = await resolve_anonymous_name(db, sender_id, group.event_id)

    # Check content guardrails
    is_blocked, blocked_reason = check_content_guardrails(content)

    message = ChatMessage(
        chat_group_id=chat_group_id,
        sender_id=sender_id,
        sender_anonymous_name=anonymous_name,
        message_content=content,
        is_blocked=is_blocked,
        blocked_reason=blocked_reason,
        attachment_url=attachment_url,
    )
    db.add(message)
    await db.flush()

    return {
        "success": True,
        "message": _message_to_dict(message),
    }


async def get_messages(
    db: AsyncSession,
    chat_group_id: uuid.UUID,
    user_id: uuid.UUID,
    limit: int = 50,
    before_id: uuid.UUID | None = None,
) -> list[dict]:
    """Retrieve messages for a chat group, newest first.

    Blocked messages are included but their content is replaced with the
    blocked_reason string so senders see feedback.
    """
    group_result = await db.execute(select(ChatGroup).where(ChatGroup.id == chat_group_id))
    group = group_result.scalar_one_or_none()
    if group is None:
        raise NotFoundError("Chat group not found")

    await assert_chat_access(db, user_id=user_id, event_id=group.event_id)

    query = (
        select(ChatMessage)
        .where(ChatMessage.chat_group_id == chat_group_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
    )

    if before_id is not None:
        # Cursor-based pagination
        cursor_result = await db.execute(
            select(ChatMessage.created_at).where(ChatMessage.id == before_id)
        )
        cursor_ts = cursor_result.scalar_one_or_none()
        if cursor_ts:
            query = query.where(ChatMessage.created_at < cursor_ts)

    result = await db.execute(query)
    messages = result.scalars().all()

    return [_message_to_dict(m) for m in reversed(messages)]


async def get_chat_group_for_event(
    db: AsyncSession,
    event_id: uuid.UUID,
    user_id: uuid.UUID,
) -> dict | None:
    """Get the chat group for an event, if one exists."""
    await assert_chat_access(db, user_id=user_id, event_id=event_id)

    result = await db.execute(
        select(ChatGroup).where(ChatGroup.event_id == event_id)
    )
    group = result.scalar_one_or_none()
    if group is None:
        return None

    return {
        "id": str(group.id),
        "event_id": str(group.event_id),
        "created_at": group.created_at.isoformat() if group.created_at else None,
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _message_to_dict(m: ChatMessage) -> dict:
    """Serialize a ChatMessage to dict. Redacts blocked message content."""
    content = m.blocked_reason if m.is_blocked else m.message_content
    return {
        "id": str(m.id),
        "chat_group_id": str(m.chat_group_id),
        "sender_anonymous_name": m.sender_anonymous_name,
        "content": content,
        "is_blocked": m.is_blocked,
        "attachment_url": m.attachment_url,
        "created_at": m.created_at.isoformat() if m.created_at else None,
    }


async def assert_chat_access(db: AsyncSession, user_id: uuid.UUID, event_id: uuid.UUID) -> None:
    """Authorize chat access for event participants and collaborators."""
    event_result = await db.execute(select(Event).where(Event.id == event_id))
    event = event_result.scalar_one_or_none()
    if event is None:
        raise NotFoundError("Event not found")

    if event.user_id == user_id:
        return

    if event.venue_id:
        venue_result = await db.execute(
            select(Venue.id).where(Venue.id == event.venue_id, Venue.owner_id == user_id)
        )
        if venue_result.scalar_one_or_none() is not None:
            return

    provider_result = await db.execute(
        select(ServiceProvider.id).where(ServiceProvider.user_id == user_id)
    )
    provider_id = provider_result.scalar_one_or_none()
    if provider_id is not None:
        event_service_result = await db.execute(
            select(EventService.id).where(
                EventService.event_id == event_id,
                EventService.service_provider_id == provider_id,
            )
        )
        if event_service_result.scalar_one_or_none() is not None:
            return

    collaborator_result = await db.execute(
        select(EventCollaborator.id).where(
            EventCollaborator.user_id == user_id,
            (
                (EventCollaborator.data["event_id"].astext == str(event_id))
                | (EventCollaborator.data["eventId"].astext == str(event_id))
            ),
        )
    )
    if collaborator_result.scalar_one_or_none() is not None:
        return

    raise ForbiddenError("Not authorized to access this event chat")
