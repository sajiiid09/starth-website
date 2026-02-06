"""Completion service — handles event service task completion and approval flow.

Flow:
1. Provider uploads completion photos + notes → EventService.status = "completed"
2. Event organizer reviews and approves → triggers payment release
3. If disputed → EventService.status = "disputed", admin resolves
"""

import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event, EventService
from app.models.service_provider import ServiceProvider
from app.services.email_service import send_email
from app.services.payment_service import release_payment

logger = logging.getLogger(__name__)


async def submit_completion(
    db: AsyncSession,
    event_service_id: uuid.UUID,
    user_id: uuid.UUID,
    photos: list[str],
    notes: str = "",
) -> dict:
    """Provider submits completion evidence for an event service.

    Sets status to "completed" and stores photos/notes.
    """
    # Look up the event service
    result = await db.execute(
        select(EventService).where(EventService.id == event_service_id)
    )
    es = result.scalar_one_or_none()
    if es is None:
        return {"success": False, "error": "Event service not found"}

    # Verify the caller is the assigned provider
    if es.service_provider_id:
        provider_result = await db.execute(
            select(ServiceProvider).where(
                ServiceProvider.id == es.service_provider_id,
                ServiceProvider.user_id == user_id,
            )
        )
        provider = provider_result.scalar_one_or_none()
        if provider is None:
            return {"success": False, "error": "Not authorized — you are not the assigned provider"}

    if es.status not in ("pending", "confirmed"):
        return {"success": False, "error": f"Cannot submit completion for service in '{es.status}' status"}

    es.completion_photos = photos
    es.completion_notes = notes
    es.completed_at = datetime.now(timezone.utc)
    es.status = "completed"

    # Notify the event organizer
    event_result = await db.execute(
        select(Event).where(Event.id == es.event_id)
    )
    event = event_result.scalar_one_or_none()
    if event:
        from app.models.user import User

        organizer_result = await db.execute(
            select(User).where(User.id == event.user_id)
        )
        organizer = organizer_result.scalar_one_or_none()
        if organizer:
            await send_email(
                to=organizer.email,
                subject=f"Service completed for your {event.event_type} event",
                html_body=f"""
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2>Service Completed</h2>
                    <p>A service provider has marked their task as complete for your
                    <strong>{event.event_type}</strong> event.</p>
                    <p>Please review the completion evidence and approve to release payment.</p>
                </div>
                """,
            )

    return {
        "success": True,
        "event_service_id": str(event_service_id),
        "status": "completed",
    }


async def approve_completion(
    db: AsyncSession,
    event_service_id: uuid.UUID,
    user_id: uuid.UUID,
) -> dict:
    """Event organizer approves completion → triggers payment release.

    Verifies the caller is the event organizer.
    """
    result = await db.execute(
        select(EventService).where(EventService.id == event_service_id)
    )
    es = result.scalar_one_or_none()
    if es is None:
        return {"success": False, "error": "Event service not found"}

    if es.status != "completed":
        return {"success": False, "error": "Service must be in 'completed' status to approve"}

    # Verify the caller is the event organizer
    event_result = await db.execute(
        select(Event).where(Event.id == es.event_id, Event.user_id == user_id)
    )
    event = event_result.scalar_one_or_none()
    if event is None:
        return {"success": False, "error": "Not authorized — only the event organizer can approve"}

    # Release payment
    payment_result = await release_payment(
        db=db,
        event_service_id=event_service_id,
        approver_id=user_id,
    )

    if not payment_result.get("success"):
        return payment_result

    return {
        "success": True,
        "event_service_id": str(event_service_id),
        "status": "paid",
        "payout_amount": payment_result.get("payout_amount"),
        "commission": payment_result.get("commission"),
    }


async def dispute_completion(
    db: AsyncSession,
    event_service_id: uuid.UUID,
    user_id: uuid.UUID,
    reason: str,
) -> dict:
    """Event organizer disputes a completed service. Escalates to admin.

    Sets EventService.status to "disputed".
    """
    result = await db.execute(
        select(EventService).where(EventService.id == event_service_id)
    )
    es = result.scalar_one_or_none()
    if es is None:
        return {"success": False, "error": "Event service not found"}

    if es.status != "completed":
        return {"success": False, "error": "Can only dispute services in 'completed' status"}

    # Verify the caller is the event organizer
    event_result = await db.execute(
        select(Event).where(Event.id == es.event_id, Event.user_id == user_id)
    )
    event = event_result.scalar_one_or_none()
    if event is None:
        return {"success": False, "error": "Not authorized — only the event organizer can dispute"}

    es.status = "disputed"
    es.completion_notes = f"DISPUTE: {reason}\n---\nOriginal notes: {es.completion_notes or ''}"

    return {
        "success": True,
        "event_service_id": str(event_service_id),
        "status": "disputed",
        "message": "Dispute escalated to admin for review",
    }


async def admin_resolve_dispute(
    db: AsyncSession,
    event_service_id: uuid.UUID,
    resolution: str,
    release_funds: bool,
) -> dict:
    """Admin resolves a disputed service. Optionally releases funds to the provider.

    Args:
        resolution: Description of the admin's resolution decision.
        release_funds: If True, payment is released to the provider.
    """
    result = await db.execute(
        select(EventService).where(EventService.id == event_service_id)
    )
    es = result.scalar_one_or_none()
    if es is None:
        return {"success": False, "error": "Event service not found"}

    if es.status != "disputed":
        return {"success": False, "error": "Can only resolve services in 'disputed' status"}

    if release_funds:
        payment_result = await release_payment(
            db=db,
            event_service_id=event_service_id,
            approver_id=uuid.UUID("00000000-0000-0000-0000-000000000000"),  # admin sentinel
        )
        es.status = "paid"
    else:
        es.status = "cancelled"

    es.completion_notes = (
        f"{es.completion_notes or ''}\n---\nADMIN RESOLUTION: {resolution}"
    )

    return {
        "success": True,
        "event_service_id": str(event_service_id),
        "status": es.status,
        "resolution": resolution,
        "funds_released": release_funds,
    }
