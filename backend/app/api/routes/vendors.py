from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role, require_subscription_active
from app.core.errors import APIError, not_found
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.vendors import (
    ServiceProviderOnboardingIn,
    VenueOwnerOnboardingIn,
    VendorMeOut,
)
from app.services import vendors_service

router = APIRouter(prefix="/vendors", tags=["vendors"])


@router.get("/me", response_model=VendorMeOut)
def get_vendor_me(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.VENDOR)),
) -> VendorMeOut:
    result = vendors_service.get_vendor_me(db, user)
    if not result:
        raise not_found("Vendor not found")

    vendor = result["vendor"]
    return VendorMeOut(
        vendor_id=str(vendor.id),
        vendor_type=vendor.vendor_type,
        verification_status=vendor.verification_status,
        payout_enabled=vendor.payout_enabled,
        profile=result.get("profile"),
    )


@router.post("/onboarding/venue-owner", response_model=VendorMeOut)
def submit_venue_owner_onboarding(
    payload: VenueOwnerOnboardingIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.VENDOR)),
    _: User = Depends(require_subscription_active),
) -> VendorMeOut:
    try:
        vendor = vendors_service.submit_venue_owner_onboarding(db, user, payload)
    except ValueError as exc:
        if str(exc) == "vendor_type_mismatch":
            raise APIError(
                error_code="vendor_type_mismatch",
                message="Vendor type mismatch.",
                status_code=status.HTTP_400_BAD_REQUEST,
            ) from exc
        raise

    result = vendors_service.get_vendor_me(db, user)
    profile = result.get("profile") if result else None

    return VendorMeOut(
        vendor_id=str(vendor.id),
        vendor_type=vendor.vendor_type,
        verification_status=vendor.verification_status,
        payout_enabled=vendor.payout_enabled,
        profile=profile,
    )


@router.post("/onboarding/service-provider", response_model=VendorMeOut)
def submit_service_provider_onboarding(
    payload: ServiceProviderOnboardingIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(UserRole.VENDOR)),
    _: User = Depends(require_subscription_active),
) -> VendorMeOut:
    try:
        vendor = vendors_service.submit_service_provider_onboarding(db, user, payload)
    except ValueError as exc:
        if str(exc) == "vendor_type_mismatch":
            raise APIError(
                error_code="vendor_type_mismatch",
                message="Vendor type mismatch.",
                status_code=status.HTTP_400_BAD_REQUEST,
            ) from exc
        raise

    result = vendors_service.get_vendor_me(db, user)
    profile = result.get("profile") if result else None

    return VendorMeOut(
        vendor_id=str(vendor.id),
        vendor_type=vendor.vendor_type,
        verification_status=vendor.verification_status,
        payout_enabled=vendor.payout_enabled,
        profile=profile,
    )
