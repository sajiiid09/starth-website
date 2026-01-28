from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role
from app.core.errors import not_found
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.templates import TemplateCreateIn, TemplateDetailOut, TemplateUpdateIn
from app.services import templates_service
from app.services.audit import log_admin_action
from app.utils.serialization import model_to_dict

router = APIRouter(prefix="/admin", tags=["admin-templates"])


@router.post("/templates", response_model=TemplateDetailOut)
def create_template(
    payload: TemplateCreateIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(UserRole.ADMIN)),
) -> TemplateDetailOut:
    template = templates_service.create_template(db, payload)

    log_admin_action(
        db,
        actor_user_id=admin_user.id,
        action="admin_template_create",
        entity_type="template",
        entity_id=str(template.id),
        before_obj=None,
        after_obj=model_to_dict(template),
    )
    db.commit()

    return TemplateDetailOut(
        id=str(template.id),
        title=template.title,
        category=template.category,
        summary=template.summary,
        blueprint_json=template.blueprint_json,
        est_cost_min=template.est_cost_min,
        est_cost_max=template.est_cost_max,
    )


@router.patch("/templates/{template_id}", response_model=TemplateDetailOut)
def update_template(
    template_id: UUID,
    payload: TemplateUpdateIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(UserRole.ADMIN)),
) -> TemplateDetailOut:
    template = templates_service.get_template(db, template_id)
    if not template:
        raise not_found("Template not found")

    before = model_to_dict(template)
    template = templates_service.update_template(db, template, payload)

    log_admin_action(
        db,
        actor_user_id=admin_user.id,
        action="admin_template_update",
        entity_type="template",
        entity_id=str(template.id),
        before_obj=before,
        after_obj=model_to_dict(template),
    )
    db.commit()

    return TemplateDetailOut(
        id=str(template.id),
        title=template.title,
        category=template.category,
        summary=template.summary,
        blueprint_json=template.blueprint_json,
        est_cost_min=template.est_cost_min,
        est_cost_max=template.est_cost_max,
    )


@router.delete("/templates/{template_id}")
def delete_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(UserRole.ADMIN)),
) -> dict[str, str]:
    template = templates_service.get_template(db, template_id)
    if not template:
        raise not_found("Template not found")

    before = model_to_dict(template)
    templates_service.delete_template(db, template)

    log_admin_action(
        db,
        actor_user_id=admin_user.id,
        action="admin_template_delete",
        entity_type="template",
        entity_id=str(template_id),
        before_obj=before,
        after_obj=None,
    )
    db.commit()

    return {"status": "deleted"}
