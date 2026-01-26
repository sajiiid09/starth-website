from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.template import Template
from app.schemas.templates import TemplateCreateIn, TemplateUpdateIn


def list_templates(db: Session, category: str | None = None) -> list[Template]:
    query = select(Template)
    if category:
        query = query.where(Template.category == category)
    return list(db.execute(query).scalars().all())


def get_template(db: Session, template_id: UUID) -> Template | None:
    return db.execute(select(Template).where(Template.id == template_id)).scalar_one_or_none()


def create_template(db: Session, data: TemplateCreateIn) -> Template:
    template = Template(
        title=data.title,
        category=data.category,
        summary=data.summary,
        blueprint_json=data.blueprint_json,
        est_cost_min=data.est_cost_min,
        est_cost_max=data.est_cost_max,
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def update_template(db: Session, template: Template, data: TemplateUpdateIn) -> Template:
    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(template, key, value)
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def delete_template(db: Session, template: Template) -> None:
    db.delete(template)
    db.commit()
