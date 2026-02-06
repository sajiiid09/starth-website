"""Planner routes — AI chat, session management, plan generation."""

from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.engine import get_db
from app.models.user import User
from app.services import planner_service

router = APIRouter(prefix="/api/planner", tags=["planner"])


# ---------------------------------------------------------------------------
# Request schemas (match frontend SendMessageRequest)
# ---------------------------------------------------------------------------


class ChatMessagePayload(BaseModel):
    id: str | None = None
    role: str = "user"
    text: str = ""
    createdAt: int | None = None
    status: str | None = None


class DraftBriefPayload(BaseModel):
    eventType: str | None = None
    guestCount: int | None = None
    budget: int | None = None
    city: str | None = None
    dateRange: str | None = None


class PlannerMessageRequest(BaseModel):
    sessionId: str
    userText: str
    messages: list[ChatMessagePayload] = []
    draftBrief: DraftBriefPayload | None = None
    mode: str | None = None
    briefStatus: str | None = None
    plannerState: dict[str, Any] | None = None


class GenerateRequest(BaseModel):
    draftBrief: DraftBriefPayload | None = None
    sessionId: str | None = None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post("/message")
async def planner_message(
    body: PlannerMessageRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Process a message in the planner conversation."""
    messages_dicts = [m.model_dump() for m in body.messages]
    draft_brief_dict = body.draftBrief.model_dump() if body.draftBrief else None

    result = await planner_service.handle_message(
        db=db,
        user_id=user.id,
        session_id=body.sessionId,
        user_text=body.userText,
        messages=messages_dicts,
        draft_brief=draft_brief_dict,
        mode=body.mode,
        brief_status=body.briefStatus,
        planner_state=body.plannerState,
    )

    return result


@router.post("/generate")
async def planner_generate(
    body: GenerateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Generate a complete event plan from collected requirements."""
    draft_brief = body.draftBrief.model_dump() if body.draftBrief else {}

    result = await planner_service.generate_plan(
        db=db,
        user_id=user.id,
        draft_brief=draft_brief,
    )

    return result


@router.get("/sessions")
async def planner_sessions(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """List all planner sessions for the current user."""
    sessions = await planner_service.get_sessions(db=db, user_id=user.id)
    return {"sessions": sessions}


@router.post("/sessions/{session_id}/approve-layout")
async def planner_approve_layout(
    session_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Approve the current plan layout and begin booking flow."""
    result = await planner_service.approve_layout(
        db=db,
        user_id=user.id,
        session_id=session_id,
    )
    return result
