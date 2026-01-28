from __future__ import annotations

import re
from datetime import datetime, timezone
from uuid import uuid4

import boto3

from app.core.config import get_settings


FILENAME_SAFE_PATTERN = re.compile(r"[^A-Za-z0-9._-]")


def sanitize_filename(filename: str, max_length: int = 80) -> str:
    trimmed = filename.replace("\\", "/").split("/")[-1].strip()
    sanitized = FILENAME_SAFE_PATTERN.sub("_", trimmed)
    sanitized = sanitized.strip("._") or "file"
    return sanitized[:max_length]


def build_object_key(user_id: str, kind: str, filename: str) -> str:
    timestamp = datetime.now(timezone.utc)
    unique_id = uuid4().hex
    safe_name = sanitize_filename(filename)
    return (
        "uploads/"
        f"{kind}/"
        f"{user_id}/"
        f"{timestamp.strftime('%Y')}/"
        f"{timestamp.strftime('%m')}/"
        f"{unique_id}_{safe_name}"
    )


def generate_presigned_put_url(
    key: str,
    content_type: str,
    expires: int,
) -> dict[str, object]:
    settings = get_settings()
    client = boto3.client(
        "s3",
        region_name=settings.s3_region or None,
        endpoint_url=settings.s3_endpoint_url or None,
        aws_access_key_id=settings.s3_access_key_id or None,
        aws_secret_access_key=settings.s3_secret_access_key or None,
    )

    upload_url = client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": settings.s3_bucket,
            "Key": key,
            "ContentType": content_type,
        },
        ExpiresIn=expires,
    )

    public_url = None
    if settings.s3_public_base_url:
        public_url = f"{settings.s3_public_base_url.rstrip('/')}/{key}"

    return {
        "upload_url": upload_url,
        "method": "PUT",
        "headers": {"Content-Type": content_type},
        "key": key,
        "public_url": public_url,
    }
