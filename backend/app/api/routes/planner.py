from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import require_subscription_active
from app.models.user import User

router = APIRouter(prefix="/planner", tags=["planner"])


@router.get("/access-check")
def planner_access_check(
    _: User = Depends(require_subscription_active),
) -> dict[str, bool]:
    return {"ok": True}
