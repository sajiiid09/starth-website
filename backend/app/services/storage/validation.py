from __future__ import annotations

from fastapi import status

from app.core.config import get_settings
from app.core.errors import APIError


def validate_content_type(content_type: str) -> None:
    settings = get_settings()
    allowed = {
        mime.strip()
        for mime in settings.allowed_upload_mime.split(",")
        if mime.strip()
    }
    if content_type not in allowed:
        raise APIError(
            error_code="unsupported_mime",
            message="Unsupported content type.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


def validate_file_size(file_size_bytes: int) -> None:
    settings = get_settings()
    if file_size_bytes > settings.max_upload_bytes:
        raise APIError(
            error_code="file_too_large",
            message="File too large.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


def validate_extension_matches_mime(filename: str, content_type: str) -> None:
    extension_map = {
        "image/jpeg": {".jpg", ".jpeg"},
        "image/png": {".png"},
        "image/webp": {".webp"},
        "video/mp4": {".mp4"},
        "application/pdf": {".pdf"},
        "image/svg+xml": {".svg"},
    }
    allowed_extensions = extension_map.get(content_type)
    if not allowed_extensions:
        return
    filename_lower = filename.lower()
    if not any(filename_lower.endswith(ext) for ext in allowed_extensions):
        raise APIError(
            error_code="mime_extension_mismatch",
            message="Filename extension does not match content type.",
            status_code=status.HTTP_400_BAD_REQUEST,
            details={
                "allowed_extensions": sorted(allowed_extensions),
                "content_type": content_type,
            },
        )
