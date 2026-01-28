from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role
from app.core.config import get_settings
from app.core.errors import forbidden
from app.models.booking import Booking
from app.models.template import Template
from app.models.user import User
from app.models.vendor import Vendor
from app.services.audit import log_admin_action
from app.models.enums import UserRole
from app.services.templates_service import list_templates
from scripts.seed_templates import seed_templates

router = APIRouter(prefix="/admin", tags=["admin-ops"])


@router.get("/health/details")
def admin_health_details(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
) -> dict:
    settings = get_settings()
    db.execute(text("SELECT 1"))
    return {
        "env": settings.app_env,
        "counts": {
            "users": db.execute(select(func.count()).select_from(User)).scalar_one(),
            "vendors": db.execute(select(func.count()).select_from(Vendor)).scalar_one(),
            "templates": db.execute(select(func.count()).select_from(Template)).scalar_one(),
            "bookings": db.execute(select(func.count()).select_from(Booking)).scalar_one(),
        },
    }


@router.post("/demo/seed")
def admin_demo_seed(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(UserRole.ADMIN)),
) -> dict[str, int]:
    settings = get_settings()
    if not settings.enable_demo_ops:
        raise forbidden("Demo ops disabled")
    seed_templates()
    templates_count = len(list_templates(db))
    log_admin_action(
        db,
        actor_user_id=admin_user.id,
        action="admin_demo_seed",
        entity_type="ops",
        entity_id="demo_seed",
        before_obj=None,
        after_obj={"templates_count": templates_count},
    )
    db.commit()
    return {"templates_seeded": templates_count}
