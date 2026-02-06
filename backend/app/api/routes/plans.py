"""Plans routes — sharing plans externally."""

import uuid
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.engine import get_db
from app.models.extra import Plan
from app.models.user import User

router = APIRouter(prefix="/api/plans", tags=["plans"])


class SharePlanRequest(BaseModel):
    planId: str | None = None
    recipientEmail: str | None = None
    message: str | None = None
    planData: dict[str, Any] | None = None


@router.post("/share")
async def share_plan(
    body: SharePlanRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Share a plan externally.

    If planData is provided, creates a new shared plan record.
    If planId is provided, marks existing plan as shared.
    Optionally sends an email to recipientEmail.
    """
    # Create or update the shared plan record
    if body.planData:
        plan = Plan(
            user_id=user.id,
            data={
                "shared": True,
                "sharedBy": str(user.id),
                "recipientEmail": body.recipientEmail,
                "message": body.message,
                "planData": body.planData,
            },
        )
        db.add(plan)
        await db.flush()
    elif body.planId:
        try:
            plan_uuid = uuid.UUID(body.planId)
        except ValueError:
            return {"success": False, "error": "Invalid plan ID"}

        result = await db.execute(
            select(Plan).where(Plan.id == plan_uuid, Plan.user_id == user.id)
        )
        plan = result.scalar_one_or_none()
        if plan is None:
            return {"success": False, "error": "Plan not found"}

        plan_data = plan.data or {}
        plan_data["shared"] = True
        plan_data["recipientEmail"] = body.recipientEmail
        plan.data = plan_data

    # Send notification email if recipient provided
    if body.recipientEmail:
        from app.services.email_service import send_email

        await send_email(
            to=body.recipientEmail,
            subject=f"{user.email} shared an event plan with you",
            html_body=f"""
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                <h2>Event Plan Shared With You</h2>
                <p>{user.email} has shared an event plan with you on Strathwell.</p>
                {f'<p>Message: {body.message}</p>' if body.message else ''}
                <a href="{__import__('app.core.config', fromlist=['settings']).settings.FRONTEND_URL}"
                   style="display: inline-block; padding: 12px 24px; background: #4f46e5;
                          color: white; text-decoration: none; border-radius: 6px;">
                    View on Strathwell
                </a>
            </div>
            """,
        )

    return {"success": True}
