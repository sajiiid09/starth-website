from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_authenticated
from app.core.config import get_settings
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.uploads import PresignUploadRequest, PresignUploadResponse
from app.services.storage.s3 import build_object_key, generate_presigned_put_url
from app.services.storage.validation import validate_content_type, validate_file_size

router = APIRouter(prefix="/uploads", tags=["uploads"])

VENDOR_KINDS = {"venue_blueprint", "venue_photo", "service_portfolio"}


@router.post("/presign", response_model=PresignUploadResponse)
def presign_upload(
    payload: PresignUploadRequest,
    user: User = Depends(require_authenticated),
    _: Session = Depends(get_db),
) -> PresignUploadResponse:
    settings = get_settings()
    if not settings.s3_bucket:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Storage bucket not configured",
        )

    if payload.kind in VENDOR_KINDS and user.role != UserRole.VENDOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    if payload.kind == "template_media" and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    validate_content_type(payload.content_type)
    validate_file_size(payload.file_size_bytes)

    key = build_object_key(str(user.id), payload.kind, payload.filename)
    presigned = generate_presigned_put_url(
        key=key,
        content_type=payload.content_type,
        expires=settings.upload_url_expire_seconds,
    )

    return PresignUploadResponse(**presigned)
