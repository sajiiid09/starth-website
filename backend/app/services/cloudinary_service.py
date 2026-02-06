"""Cloudinary service — file upload, signed URLs, and private uploads."""

import logging
import time
from typing import Any

import cloudinary
import cloudinary.api
import cloudinary.uploader
from fastapi import UploadFile

from app.core.config import settings

logger = logging.getLogger(__name__)

_configured = False


def _ensure_configured() -> None:
    """Configure the Cloudinary SDK once (idempotent)."""
    global _configured
    if _configured:
        return

    if not settings.CLOUDINARY_CLOUD_NAME:
        logger.warning("Cloudinary credentials not set — uploads will fail")
        _configured = True
        return

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )
    _configured = True


async def upload_file(
    file: UploadFile,
    folder: str = "uploads",
) -> str:
    """Upload a file to Cloudinary (public).

    Args:
        file: The uploaded file from the request.
        folder: Cloudinary folder (e.g. "venues", "events", "providers").

    Returns:
        The public URL of the uploaded file.
    """
    _ensure_configured()

    if not settings.CLOUDINARY_CLOUD_NAME:
        logger.warning("Cloudinary not configured — returning placeholder URL")
        return f"https://placeholder.cloudinary.com/{folder}/{file.filename}"

    contents = await file.read()

    result: dict[str, Any] = cloudinary.uploader.upload(
        contents,
        folder=f"strathwell/{folder}",
        resource_type="auto",
        filename_override=file.filename,
        use_filename=True,
        unique_filename=True,
    )

    return result["secure_url"]


async def upload_private_file(
    file: UploadFile,
    folder: str = "private",
) -> str:
    """Upload a file to Cloudinary with private/authenticated access.

    Returns:
        The private URL (requires signed URL to access).
    """
    _ensure_configured()

    if not settings.CLOUDINARY_CLOUD_NAME:
        logger.warning("Cloudinary not configured — returning placeholder URL")
        return f"https://placeholder.cloudinary.com/private/{folder}/{file.filename}"

    contents = await file.read()

    result: dict[str, Any] = cloudinary.uploader.upload(
        contents,
        folder=f"strathwell/{folder}",
        resource_type="auto",
        type="private",
        filename_override=file.filename,
        use_filename=True,
        unique_filename=True,
    )

    return result["secure_url"]


async def upload_bytes(
    data: bytes,
    folder: str = "generated",
    filename: str = "image.png",
) -> str:
    """Upload raw bytes to Cloudinary (used for generated images).

    Returns:
        The public URL of the uploaded file.
    """
    _ensure_configured()

    if not settings.CLOUDINARY_CLOUD_NAME:
        return f"https://placeholder.cloudinary.com/{folder}/{filename}"

    result: dict[str, Any] = cloudinary.uploader.upload(
        data,
        folder=f"strathwell/{folder}",
        resource_type="image",
        filename_override=filename,
        use_filename=True,
        unique_filename=True,
    )

    return result["secure_url"]


def create_signed_url(
    public_id: str,
    resource_type: str = "image",
    expires_in: int = 3600,
) -> str:
    """Generate a time-limited signed URL for a private Cloudinary resource.

    Args:
        public_id: The Cloudinary public_id of the resource.
        resource_type: "image", "video", or "raw".
        expires_in: Seconds until the URL expires (default 1 hour).

    Returns:
        A signed URL string.
    """
    _ensure_configured()

    if not settings.CLOUDINARY_CLOUD_NAME:
        return f"https://placeholder.cloudinary.com/signed/{public_id}"

    timestamp = int(time.time()) + expires_in

    url: str = cloudinary.utils.cloudinary_url(
        public_id,
        type="private",
        resource_type=resource_type,
        sign_url=True,
        secure=True,
        timestamp=timestamp,
    )[0]

    return url
