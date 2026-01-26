from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_subscription_active
from app.schemas.templates import TemplateDetailOut, TemplateSummaryOut
from app.services import templates_service

router = APIRouter(tags=["templates"])


@router.get("/templates", response_model=list[TemplateSummaryOut])
def list_templates(
    db: Session = Depends(get_db),
    category: str | None = Query(default=None),
) -> list[TemplateSummaryOut]:
    templates = templates_service.list_templates(db, category=category)
    return [
        TemplateSummaryOut(
            id=str(template.id),
            title=template.title,
            category=template.category,
            summary=template.summary,
            est_cost_min=template.est_cost_min,
            est_cost_max=template.est_cost_max,
        )
        for template in templates
    ]


@router.get("/templates/{template_id}", response_model=TemplateDetailOut)
def get_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    _: object = Depends(require_subscription_active),
) -> TemplateDetailOut:
    template = templates_service.get_template(db, template_id)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    return TemplateDetailOut(
        id=str(template.id),
        title=template.title,
        category=template.category,
        summary=template.summary,
        blueprint_json=template.blueprint_json,
        est_cost_min=template.est_cost_min,
        est_cost_max=template.est_cost_max,
    )
