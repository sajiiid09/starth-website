"""Generic response schemas used by the CRUD factory."""

from typing import Any

from pydantic import BaseModel


class ItemResponse(BaseModel):
    """Single item response wrapper."""

    success: bool = True
    data: dict[str, Any]


class ListResponse(BaseModel):
    """List response wrapper."""

    success: bool = True
    data: list[dict[str, Any]]
    total: int = 0


class DeleteResponse(BaseModel):
    """Delete confirmation."""

    success: bool = True
    deleted_id: str


class ErrorResponse(BaseModel):
    """Error response."""

    success: bool = False
    detail: str
