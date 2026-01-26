from __future__ import annotations

from fastapi import HTTPException, status

from app.core.config import get_settings


def validate_content_type(content_type: str) -> None:
    settings = get_settings()
    allowed = {
        mime.strip()
        for mime in settings.allowed_upload_mime.split(",")
        if mime.strip()
    }
    if content_type not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "unsupported_mime"},
        )


def validate_file_size(file_size_bytes: int) -> None:
    settings = get_settings()
    if file_size_bytes > settings.max_upload_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "file_too_large"},
        )
