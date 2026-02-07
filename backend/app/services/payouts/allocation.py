from __future__ import annotations

import math
from dataclasses import dataclass

from app.models.booking_vendor import BookingVendor


@dataclass(frozen=True)
class VendorAllocation:
    booking_vendor_id: str
    vendor_gross_from_paid: int
    platform_fee_from_paid: int
    vendor_net_from_paid: int


def allocate_paid_amount_across_vendors(
    booking_total_cents: int,
    paid_amount_cents: int,
    booking_vendors: list[BookingVendor],
    platform_commission_percent: float,
) -> list[VendorAllocation]:
    if booking_total_cents <= 0:
        raise ValueError("invalid_booking_total")
    if paid_amount_cents <= 0:
        raise ValueError("invalid_paid_amount")
    if not booking_vendors:
        return []

    weights = [vendor.agreed_amount_cents / booking_total_cents for vendor in booking_vendors]
    raw_allocations = [paid_amount_cents * weight for weight in weights]
    floored = [int(math.floor(value)) for value in raw_allocations]
    remainder = paid_amount_cents - sum(floored)
    fractional = [
        (index, raw_allocations[index] - floored[index]) for index in range(len(booking_vendors))
    ]
    fractional.sort(key=lambda item: item[1], reverse=True)
    for i in range(remainder):
        floored[fractional[i][0]] += 1

    allocations: list[VendorAllocation] = []
    for vendor, vendor_gross in zip(booking_vendors, floored):
        platform_fee = int(math.floor(vendor_gross * platform_commission_percent))
        vendor_net = vendor_gross - platform_fee
        allocations.append(
            VendorAllocation(
                booking_vendor_id=str(vendor.id),
                vendor_gross_from_paid=vendor_gross,
                platform_fee_from_paid=platform_fee,
                vendor_net_from_paid=vendor_net,
            )
        )
    return allocations
