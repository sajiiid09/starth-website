from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field, field_validator


class TemplateSummaryOut(BaseModel):
    id: str
    title: str
    category: str
    summary: str
    est_cost_min: int | None = None
    est_cost_max: int | None = None


class TemplateDetailOut(TemplateSummaryOut):
    blueprint_json: dict[str, Any]


class TemplateCreateIn(BaseModel):
    title: str = Field(min_length=1)
    category: str = Field(min_length=1)
    summary: str = Field(min_length=1)
    blueprint_json: dict[str, Any]
    est_cost_min: int | None = Field(default=None, ge=0)
    est_cost_max: int | None = Field(default=None, ge=0)

    @field_validator("blueprint_json")
    @classmethod
    def validate_blueprint(cls, value: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(value, dict):
            raise ValueError("blueprint_json must be an object")
        return value


class TemplateUpdateIn(BaseModel):
    title: str | None = Field(default=None, min_length=1)
    category: str | None = Field(default=None, min_length=1)
    summary: str | None = Field(default=None, min_length=1)
    blueprint_json: dict[str, Any] | None = None
    est_cost_min: int | None = Field(default=None, ge=0)
    est_cost_max: int | None = Field(default=None, ge=0)

    @field_validator("blueprint_json")
    @classmethod
    def validate_blueprint(cls, value: dict[str, Any] | None) -> dict[str, Any] | None:
        if value is None:
            return value
        if not isinstance(value, dict):
            raise ValueError("blueprint_json must be an object")
        return value
