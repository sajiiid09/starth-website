from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role
from app.models.audit_log import AuditLog
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.templates import TemplateCreateIn, TemplateDetailOut, TemplateUpdateIn
from app.services import templates_service

router = APIRouter(prefix="/admin", tags=["admin-templates"])


def _template_snapshot(template: object | None) -> dict[str, object | None]:
    if template is None:
        return {}
    return {
        "id": str(template.id),
        "title": template.title,
        "category": template.category,
        "summary": template.summary,
        "blueprint_json": template.blueprint_json,
        "est_cost_min": template.est_cost_min,
        "est_cost_max": template.est_cost_max,
    }


@router.post("/templates", response_model=TemplateDetailOut)
def create_template(
    payload: TemplateCreateIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(UserRole.ADMIN)),
) -> TemplateDetailOut:
    template = templates_service.create_template(db, payload)

    audit_log = AuditLog(
        actor_user_id=admin_user.id,
        action="admin_template_create",
        entity_type="template",
        entity_id=str(template.id),
        before_json=None,
        after_json=_template_snapshot(template),
    )
    db.add(audit_log)
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    before = _template_snapshot(template)
    template = templates_service.update_template(db, template, payload)

    audit_log = AuditLog(
        actor_user_id=admin_user.id,
        action="admin_template_update",
        entity_type="template",
        entity_id=str(template.id),
        before_json=before,
        after_json=_template_snapshot(template),
    )
    db.add(audit_log)
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    before = _template_snapshot(template)
    templates_service.delete_template(db, template)

    audit_log = AuditLog(
        actor_user_id=admin_user.id,
        action="admin_template_delete",
        entity_type="template",
        entity_id=str(template_id),
        before_json=before,
        after_json=None,
    )
    db.add(audit_log)
    db.commit()

    return {"status": "deleted"}
