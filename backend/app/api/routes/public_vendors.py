from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.enums import VendorType
from app.schemas.vendors import VendorPublicCardOut
from app.services import vendors_service

router = APIRouter(tags=["vendors"])


@router.get("/vendors/public", response_model=list[VendorPublicCardOut])
def list_public_vendors(
    db: Session = Depends(get_db),
    vendor_type: VendorType | None = Query(default=None),
    category: str | None = Query(default=None),
    location: str | None = Query(default=None),
    service_area: str | None = Query(default=None),
) -> list[VendorPublicCardOut]:
    rows = vendors_service.list_public_vendors(
        db,
        vendor_type=vendor_type,
        category=category,
        location_text=location,
        service_area=service_area,
    )

    results: list[VendorPublicCardOut] = []
    for row in rows:
        vendor = row["vendor"]
        results.append(
            VendorPublicCardOut(
                vendor_id=str(vendor.id),
                vendor_type=vendor.vendor_type,
                display_name=row.get("display_name", "Vendor"),
                location_text=row.get("location_text"),
                categories=row.get("categories"),
                service_areas=row.get("service_areas"),
                assets_json=row.get("assets_json"),
            )
        )
    return results
