from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_role
from app.models.enums import UserRole, VendorVerificationStatus
from app.models.vendor import Vendor
from app.models.user import User
from app.schemas.vendors import VendorNeedsChangesIn
from app.services.audit import log_admin_action
from app.utils.serialization import model_to_dict

router = APIRouter(prefix="/admin", tags=["admin-vendors"])


@router.get("/vendors/pending")
def list_pending_vendors(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
) -> list[dict[str, str]]:
    vendors = db.execute(
        select(Vendor).where(
            Vendor.verification_status.in_(
                [
                    VendorVerificationStatus.SUBMITTED,
                    VendorVerificationStatus.NEEDS_CHANGES,
                ]
            )
        )
    ).scalars().all()

    return [
        {
            "vendor_id": str(vendor.id),
            "vendor_type": vendor.vendor_type.value,
            "verification_status": vendor.verification_status.value,
            "review_note": vendor.review_note,
        }
        for vendor in vendors
    ]


@router.post("/vendors/{vendor_id}/approve")
def approve_vendor(
    vendor_id: UUID,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(UserRole.ADMIN)),
) -> dict[str, str]:
    vendor = db.execute(select(Vendor).where(Vendor.id == vendor_id)).scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")

    before = model_to_dict(vendor)

    vendor.verification_status = VendorVerificationStatus.APPROVED
    vendor.payout_enabled = True
    vendor.review_note = None

    db.add(vendor)
    log_admin_action(
        db,
        actor_user_id=admin_user.id,
        action="admin_vendor_approve",
        entity_type="vendor",
        entity_id=str(vendor.id),
        before_obj=before,
        after_obj=model_to_dict(vendor),
    )
    db.commit()

    return {"status": "approved"}


@router.post("/vendors/{vendor_id}/needs-changes")
def needs_changes_vendor(
    vendor_id: UUID,
    payload: VendorNeedsChangesIn,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(UserRole.ADMIN)),
) -> dict[str, str]:
    vendor = db.execute(select(Vendor).where(Vendor.id == vendor_id)).scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")

    before = model_to_dict(vendor)

    vendor.verification_status = VendorVerificationStatus.NEEDS_CHANGES
    vendor.review_note = payload.note
    vendor.payout_enabled = False

    db.add(vendor)
    log_admin_action(
        db,
        actor_user_id=admin_user.id,
        action="admin_vendor_needs_changes",
        entity_type="vendor",
        entity_id=str(vendor.id),
        before_obj=before,
        after_obj=model_to_dict(vendor),
    )
    db.commit()

    return {"status": "needs_changes"}


@router.post("/vendors/{vendor_id}/disable-payout")
def disable_vendor_payout(
    vendor_id: UUID,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(UserRole.ADMIN)),
) -> dict[str, str]:
    vendor = db.execute(select(Vendor).where(Vendor.id == vendor_id)).scalar_one_or_none()
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found")

    before = model_to_dict(vendor)

    vendor.payout_enabled = False

    db.add(vendor)
    log_admin_action(
        db,
        actor_user_id=admin_user.id,
        action="admin_vendor_disable_payout",
        entity_type="vendor",
        entity_id=str(vendor.id),
        before_obj=before,
        after_obj=model_to_dict(vendor),
    )
    db.commit()

    return {"status": "payout_disabled"}
