"""Chat and task-completion routes."""

import uuid
from typing import Any

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.engine import get_db
from app.models.user import User
from app.services import chat_service, completion_service

router = APIRouter(prefix="/api", tags=["chat", "completion"])


# ---------------------------------------------------------------------------
# Chat schemas
# ---------------------------------------------------------------------------


class SendMessageRequest(BaseModel):
    chat_group_id: str
    content: str
    attachment_url: str | None = None


# ---------------------------------------------------------------------------
# Completion schemas
# ---------------------------------------------------------------------------


class SubmitCompletionRequest(BaseModel):
    photos: list[str] = []
    notes: str = ""


class DisputeRequest(BaseModel):
    reason: str


# ---------------------------------------------------------------------------
# Chat endpoints
# ---------------------------------------------------------------------------


@router.post("/chat/send")
async def send_chat_message(
    body: SendMessageRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Send a message to an event chat group with content guardrails."""
    result = await chat_service.send_message(
        db=db,
        chat_group_id=uuid.UUID(body.chat_group_id),
        sender_id=user.id,
        content=body.content,
        attachment_url=body.attachment_url,
    )
    return result


@router.get("/chat/{chat_group_id}/messages")
async def get_chat_messages(
    chat_group_id: uuid.UUID,
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
    before: str | None = Query(None),
) -> dict[str, Any]:
    """Retrieve messages for a chat group. Supports cursor-based pagination."""
    before_id = uuid.UUID(before) if before else None
    messages = await chat_service.get_messages(
        db=db,
        chat_group_id=chat_group_id,
        limit=limit,
        before_id=before_id,
    )
    return {"success": True, "data": messages}


@router.get("/chat/event/{event_id}")
async def get_event_chat_group(
    event_id: uuid.UUID,
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Get the chat group for an event."""
    group = await chat_service.get_chat_group_for_event(db=db, event_id=event_id)
    if group is None:
        return {"success": False, "error": "No chat group for this event"}
    return {"success": True, "data": group}


# ---------------------------------------------------------------------------
# Task completion endpoints
# ---------------------------------------------------------------------------


@router.post("/events/{event_id}/complete-service/{event_service_id}")
async def submit_service_completion(
    event_id: uuid.UUID,
    event_service_id: uuid.UUID,
    body: SubmitCompletionRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Provider uploads completion photos and notes for an event service."""
    result = await completion_service.submit_completion(
        db=db,
        event_service_id=event_service_id,
        user_id=user.id,
        photos=body.photos,
        notes=body.notes,
    )
    return result


@router.post("/events/{event_id}/approve-completion/{event_service_id}")
async def approve_service_completion(
    event_id: uuid.UUID,
    event_service_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Event organizer approves a completed service, triggering payment release."""
    result = await completion_service.approve_completion(
        db=db,
        event_service_id=event_service_id,
        user_id=user.id,
    )
    return result


@router.post("/events/{event_id}/dispute/{event_service_id}")
async def dispute_service_completion(
    event_id: uuid.UUID,
    event_service_id: uuid.UUID,
    body: DisputeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Event organizer disputes a service completion. Escalated to admin."""
    result = await completion_service.dispute_completion(
        db=db,
        event_service_id=event_service_id,
        user_id=user.id,
        reason=body.reason,
    )
    return result
