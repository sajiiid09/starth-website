"""Template library routes — popular, by-type, and customize endpoints."""

from typing import Any

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.engine import get_db
from app.models.template import Template
from app.models.user import User
from app.services import llm_service

router = APIRouter(prefix="/api/templates", tags=["templates"])


# ---------------------------------------------------------------------------
# GET /api/templates/popular
# ---------------------------------------------------------------------------


@router.get("/popular")
async def get_popular_templates(
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Return templates sorted by popularity (times_used * average_rating)."""
    stmt = (
        select(Template)
        .where(Template.is_public == True)  # noqa: E712
        .order_by(
            desc(
                func.coalesce(Template.times_used, 0)
                * func.coalesce(Template.average_rating, 0)
            )
        )
        .limit(limit)
    )
    result = await db.execute(stmt)
    templates = result.scalars().all()

    return {
        "data": [_serialize(t) for t in templates],
        "count": len(templates),
    }


# ---------------------------------------------------------------------------
# GET /api/templates/by-type/{event_type}
# ---------------------------------------------------------------------------


@router.get("/by-type/{event_type}")
async def get_templates_by_type(
    event_type: str,
    limit: int = Query(default=20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Return public templates filtered by event type."""
    stmt = (
        select(Template)
        .where(Template.is_public == True, Template.event_type == event_type)  # noqa: E712
        .order_by(desc(func.coalesce(Template.times_used, 0)))
        .limit(limit)
    )
    result = await db.execute(stmt)
    templates = result.scalars().all()

    return {
        "data": [_serialize(t) for t in templates],
        "count": len(templates),
    }


# ---------------------------------------------------------------------------
# POST /api/templates/customize
# ---------------------------------------------------------------------------


class CustomizeRequest(BaseModel):
    template_id: str
    guest_count: int | None = None
    budget: int | None = None
    city: str | None = None
    date_range: str | None = None
    preferences: str | None = None


@router.post("/customize")
async def customize_template(
    body: CustomizeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Customize an existing template for the user's needs via LLM."""
    # Fetch the template
    result = await db.execute(select(Template).where(Template.id == body.template_id))
    template = result.scalar_one_or_none()
    if template is None:
        from app.utils.exceptions import NotFoundError

        raise NotFoundError("Template not found")

    # Build the customization prompt
    overrides: list[str] = []
    if body.guest_count:
        overrides.append(f"Guest count: {body.guest_count}")
    if body.budget:
        overrides.append(f"Budget: ${body.budget}")
    if body.city:
        overrides.append(f"City: {body.city}")
    if body.date_range:
        overrides.append(f"Date range: {body.date_range}")
    if body.preferences:
        overrides.append(f"Preferences: {body.preferences}")

    overrides_text = "\n".join(overrides) if overrides else "No specific changes requested."

    prompt = f"""You are an event planning assistant. Customize the following event template
based on the user's requirements. Return a JSON object with the same structure as the
original template_data but adjusted for the user's needs.

Original template: {template.name}
Event type: {template.event_type}
Original guest count: {template.guest_count}
Original budget range: ${template.budget_min} - ${template.budget_max}

Original template data:
{template.template_data}

User's requested changes:
{overrides_text}

Return ONLY valid JSON with keys: theme, color_palette, services, timeline, budget_breakdown.
Adjust the budget_breakdown proportionally if the budget changed.
Include a 10% platform_fee in the budget_breakdown."""

    llm_result = await llm_service.invoke_llm(
        prompt=prompt,
        response_json_schema={
            "type": "object",
            "properties": {
                "theme": {"type": "string"},
                "color_palette": {"type": "array", "items": {"type": "string"}},
                "services": {"type": "array", "items": {"type": "string"}},
                "timeline": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "time": {"type": "string"},
                            "activity": {"type": "string"},
                        },
                    },
                },
                "budget_breakdown": {"type": "object"},
            },
        },
        system_prompt="You are Strathwell's AI event planner. Be specific and realistic.",
    )

    return {
        "original_template": _serialize(template),
        "customized": llm_result,
        "overrides_applied": overrides,
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _serialize(t: Template) -> dict[str, Any]:
    """Convert a Template ORM object to a dict."""
    return {
        "id": str(t.id),
        "name": t.name,
        "description": t.description,
        "event_type": t.event_type,
        "template_data": t.template_data,
        "before_layout_url": t.before_layout_url,
        "after_layout_url": t.after_layout_url,
        "budget_min": float(t.budget_min) if t.budget_min else None,
        "budget_max": float(t.budget_max) if t.budget_max else None,
        "guest_count": t.guest_count,
        "is_public": t.is_public,
        "is_featured": t.is_featured,
        "times_used": t.times_used,
        "average_rating": float(t.average_rating) if t.average_rating else None,
        "created_at": t.created_at.isoformat() if t.created_at else None,
    }
