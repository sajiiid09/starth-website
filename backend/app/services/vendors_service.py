from __future__ import annotations

from typing import Any
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import VendorType, VendorVerificationStatus
from app.models.service_profile import ServiceProfile
from app.models.user import User
from app.models.vendor import Vendor
from app.models.venue_profile import VenueProfile
from app.schemas.vendors import ServiceProviderOnboardingIn, VenueOwnerOnboardingIn


def get_or_create_vendor_for_user(
    db: Session, user: User, vendor_type: VendorType
) -> Vendor:
    vendor = db.execute(select(Vendor).where(Vendor.user_id == user.id)).scalar_one_or_none()
    if vendor:
        return vendor
    vendor = Vendor(user_id=user.id, vendor_type=vendor_type)
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


def submit_venue_owner_onboarding(
    db: Session, user: User, payload: VenueOwnerOnboardingIn
) -> Vendor:
    vendor = get_or_create_vendor_for_user(db, user, VendorType.VENUE_OWNER)
    if vendor.vendor_type != VendorType.VENUE_OWNER:
        raise ValueError("vendor_type_mismatch")

    profile = db.execute(
        select(VenueProfile).where(VenueProfile.vendor_id == vendor.id)
    ).scalar_one_or_none()

    if profile is None:
        profile = VenueProfile(vendor_id=vendor.id)

    profile.venue_name = payload.venue_name
    profile.location_text = payload.location_text
    profile.square_feet = payload.square_feet
    profile.capacity_comfortable = payload.capacity_comfortable
    profile.capacity_max = payload.capacity_max
    profile.pricing_note = payload.pricing_note
    profile.assets_json = payload.assets_json

    vendor.verification_status = VendorVerificationStatus.SUBMITTED

    db.add(profile)
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


def submit_service_provider_onboarding(
    db: Session, user: User, payload: ServiceProviderOnboardingIn
) -> Vendor:
    vendor = get_or_create_vendor_for_user(db, user, VendorType.SERVICE_PROVIDER)
    if vendor.vendor_type != VendorType.SERVICE_PROVIDER:
        raise ValueError("vendor_type_mismatch")

    profile = db.execute(
        select(ServiceProfile).where(ServiceProfile.vendor_id == vendor.id)
    ).scalar_one_or_none()

    if profile is None:
        profile = ServiceProfile(vendor_id=vendor.id)

    profile.categories_json = payload.categories
    profile.service_areas_json = payload.service_areas
    profile.pricing_note = payload.pricing_note
    profile.assets_json = payload.assets_json

    vendor.verification_status = VendorVerificationStatus.SUBMITTED

    db.add(profile)
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


def get_vendor_me(db: Session, user: User) -> dict[str, Any] | None:
    vendor = db.execute(select(Vendor).where(Vendor.user_id == user.id)).scalar_one_or_none()
    if not vendor:
        return None

    profile: dict[str, Any] | None = None
    if vendor.vendor_type == VendorType.VENUE_OWNER:
        venue = db.execute(
            select(VenueProfile).where(VenueProfile.vendor_id == vendor.id)
        ).scalar_one_or_none()
        if venue:
            profile = {
                "venue_name": venue.venue_name,
                "location_text": venue.location_text,
                "square_feet": venue.square_feet,
                "capacity_comfortable": venue.capacity_comfortable,
                "capacity_max": venue.capacity_max,
                "pricing_note": venue.pricing_note,
                "assets_json": venue.assets_json,
            }
    else:
        service = db.execute(
            select(ServiceProfile).where(ServiceProfile.vendor_id == vendor.id)
        ).scalar_one_or_none()
        if service:
            profile = {
                "categories": service.categories_json,
                "service_areas": service.service_areas_json,
                "pricing_note": service.pricing_note,
                "assets_json": service.assets_json,
            }

    return {
        "vendor": vendor,
        "profile": profile,
    }


def list_public_vendors(
    db: Session,
    vendor_type: VendorType | None = None,
    category: str | None = None,
    location_text: str | None = None,
    service_area: str | None = None,
) -> list[dict[str, Any]]:
    vendors_query = select(Vendor).where(
        Vendor.verification_status == VendorVerificationStatus.APPROVED
    )
    if vendor_type:
        vendors_query = vendors_query.where(Vendor.vendor_type == vendor_type)

    vendors = db.execute(vendors_query).scalars().all()
    results: list[dict[str, Any]] = []

    for vendor in vendors:
        user = db.execute(select(User).where(User.id == vendor.user_id)).scalar_one_or_none()
        display_name = user.email if user else "Vendor"

        if vendor.vendor_type == VendorType.VENUE_OWNER:
            venue = db.execute(
                select(VenueProfile).where(VenueProfile.vendor_id == vendor.id)
            ).scalar_one_or_none()
            if not venue:
                continue
            if location_text and location_text.lower() not in venue.location_text.lower():
                continue

            results.append(
                {
                    "vendor": vendor,
                    "display_name": display_name,
                    "location_text": venue.location_text,
                    "assets_json": venue.assets_json,
                }
            )
        else:
            service = db.execute(
                select(ServiceProfile).where(ServiceProfile.vendor_id == vendor.id)
            ).scalar_one_or_none()
            if not service:
                continue
            categories = service.categories_json or []
            service_areas = service.service_areas_json or []
            if category and category not in categories:
                continue
            if service_area and service_area not in service_areas:
                continue

            results.append(
                {
                    "vendor": vendor,
                    "display_name": display_name,
                    "categories": categories,
                    "service_areas": service_areas,
                    "assets_json": service.assets_json,
                }
            )

    return results
