from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


UploadKind = Literal["venue_blueprint", "venue_photo", "service_portfolio", "template_media"]


class PresignUploadRequest(BaseModel):
    kind: UploadKind
    filename: str = Field(min_length=1)
    content_type: str = Field(min_length=1)
    file_size_bytes: int = Field(ge=1)


class PresignUploadResponse(BaseModel):
    upload_url: str
    method: str
    headers: dict[str, str]
    key: str
    public_url: str | None = None
