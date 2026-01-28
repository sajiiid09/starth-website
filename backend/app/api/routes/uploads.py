from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_authenticated
from app.core.config import get_settings
from app.core.errors import APIError, forbidden
from app.models.asset import Asset
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.uploads import (
    PresignUploadRequest,
    PresignUploadResponse,
    RegisterUploadRequest,
    RegisterUploadResponse,
)
from app.services.storage.s3 import build_object_key, generate_presigned_put_url
from app.services.storage.validation import (
    validate_content_type,
    validate_extension_matches_mime,
    validate_file_size,
)

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
        raise APIError(
            error_code="storage_not_configured",
            message="Storage bucket not configured",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if payload.kind in VENDOR_KINDS and user.role != UserRole.VENDOR:
        raise forbidden("Not authorized")
    if payload.kind == "template_media" and user.role != UserRole.ADMIN:
        raise forbidden("Not authorized")

    filename = payload.filename.replace("\\", "/").split("/")[-1].strip()
    if not filename:
        raise APIError(
            error_code="invalid_filename",
            message="Filename is required.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    validate_content_type(payload.content_type)
    validate_file_size(payload.file_size_bytes)
    validate_extension_matches_mime(filename, payload.content_type)

    expires = min(settings.upload_url_expire_seconds, 600)
    if expires <= 0:
        raise APIError(
            error_code="invalid_upload_ttl",
            message="Upload URL TTL must be greater than zero.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    key = build_object_key(str(user.id), payload.kind, filename)
    presigned = generate_presigned_put_url(
        key=key,
        content_type=payload.content_type,
        expires=expires,
    )

    return PresignUploadResponse(**presigned)


@router.post("/register", response_model=RegisterUploadResponse)
def register_upload(
    payload: RegisterUploadRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_authenticated),
) -> RegisterUploadResponse:
    key_prefix = f"uploads/{payload.kind}/{user.id}/"
    if not payload.key.startswith(key_prefix):
        raise forbidden("Upload key does not belong to the current user.")

    filename = payload.key.split("/")[-1]
    if not filename:
        raise APIError(
            error_code="invalid_filename",
            message="Filename is invalid.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    validate_content_type(payload.content_type)
    validate_file_size(payload.file_size_bytes)
    validate_extension_matches_mime(filename, payload.content_type)

    existing_asset = db.execute(
        select(Asset).where(Asset.key == payload.key)
    ).scalar_one_or_none()
    if existing_asset and existing_asset.owner_user_id != user.id:
        raise forbidden("Upload key does not belong to the current user.")

    if existing_asset:
        existing_asset.public_url = payload.public_url
        existing_asset.content_type = payload.content_type
        existing_asset.file_size_bytes = payload.file_size_bytes
        existing_asset.kind = payload.kind
        db.add(existing_asset)
        db.commit()
        return RegisterUploadResponse(asset_id=str(existing_asset.id))

    asset = Asset(
        owner_user_id=user.id,
        kind=payload.kind,
        key=payload.key,
        public_url=payload.public_url,
        content_type=payload.content_type,
        file_size_bytes=payload.file_size_bytes,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)

    return RegisterUploadResponse(asset_id=str(asset.id))
