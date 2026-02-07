from __future__ import annotations

import re

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_authenticated, require_role
from app.models.moderation_event import ModerationEvent
from app.models.enums import ModerationEventKind, UserRole
from app.models.user import User
from app.schemas.trust import ModerationEventCreateIn

router = APIRouter(tags=["trust"])

EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.IGNORECASE)
PHONE_RE = re.compile(r"\+?\d[\d\-\s().]{6,}\d")


def _sanitize_excerpt(excerpt: str | None) -> str | None:
    if not excerpt:
        return None
    cleaned = EMAIL_RE.sub("[redacted-email]", excerpt)
    cleaned = PHONE_RE.sub("[redacted-phone]", cleaned)
    cleaned = cleaned.strip()
    return cleaned[:200] if cleaned else None


@router.post("/trust/moderation-events")
def create_moderation_event(
    payload: ModerationEventCreateIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_authenticated),
) -> dict[str, bool]:
    event = ModerationEvent(
        user_id=user.id,
        booking_id=payload.booking_id,
        kind=payload.kind,
        reason=payload.reason,
        excerpt=_sanitize_excerpt(payload.excerpt),
    )
    db.add(event)
    db.commit()
    return {"ok": True}


@router.get("/admin/moderation-events")
def list_moderation_events(
    kind: ModerationEventKind | None = None,
    user_id: UUID | None = None,
    booking_id: UUID | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
) -> list[dict]:
    query = select(ModerationEvent)
    if kind:
        query = query.where(ModerationEvent.kind == kind)
    if user_id:
        query = query.where(ModerationEvent.user_id == user_id)
    if booking_id:
        query = query.where(ModerationEvent.booking_id == booking_id)
    events = db.execute(query).scalars().all()
    results: list[dict] = []
    for event in events:
        user = db.execute(select(User).where(User.id == event.user_id)).scalar_one_or_none()
        results.append(
            {
                "id": str(event.id),
                "user_id": str(event.user_id),
                "user_email": user.email if user else None,
                "booking_id": str(event.booking_id) if event.booking_id else None,
                "kind": event.kind.value,
                "reason": event.reason,
                "excerpt": event.excerpt,
                "created_at": event.created_at.isoformat(),
            }
        )
    return results
