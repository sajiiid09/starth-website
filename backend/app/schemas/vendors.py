from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.models.enums import VendorType, VendorVerificationStatus


class VenueOwnerOnboardingIn(BaseModel):
    venue_name: str = Field(min_length=1)
    location_text: str = Field(min_length=1)
    square_feet: int | None = Field(default=None, ge=0)
    capacity_comfortable: int | None = Field(default=None, ge=0)
    capacity_max: int | None = Field(default=None, ge=0)
    pricing_note: str | None = None
    assets_json: dict[str, Any] | None = None


class ServiceProviderOnboardingIn(BaseModel):
    categories: list[str] = Field(min_length=1)
    service_areas: list[str] = Field(min_length=1)
    pricing_note: str | None = None
    assets_json: dict[str, Any] | None = None


class VendorMeOut(BaseModel):
    vendor_id: str
    vendor_type: VendorType
    verification_status: VendorVerificationStatus
    payout_enabled: bool
    profile: dict[str, Any] | None = None


class VendorPublicCardOut(BaseModel):
    vendor_id: str
    vendor_type: VendorType
    display_name: str
    location_text: str | None = None
    categories: list[str] | None = None
    service_areas: list[str] | None = None
    assets_json: dict[str, Any] | None = None


class VendorNeedsChangesIn(BaseModel):
    note: str = Field(min_length=1)
