from __future__ import annotations

from enum import Enum


class UserRole(str, Enum):
    ORGANIZER = "organizer"
    VENDOR = "vendor"
    ADMIN = "admin"


class SubscriptionStatus(str, Enum):
    TRIAL = "trial"
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"


class VendorType(str, Enum):
    VENUE_OWNER = "venue_owner"
    SERVICE_PROVIDER = "service_provider"


class VendorVerificationStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    NEEDS_CHANGES = "needs_changes"


class BookingStatus(str, Enum):
    DRAFT = "draft"
    AWAITING_VENDOR_APPROVAL = "awaiting_vendor_approval"
    READY_FOR_PAYMENT = "ready_for_payment"
    PAID = "paid"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELED = "canceled"


class BookingVendorRole(str, Enum):
    VENUE = "venue"
    SERVICE = "service"


class BookingVendorApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DECLINED = "declined"
    COUNTERED = "countered"


class PaymentProvider(str, Enum):
    STRIPE = "stripe"
    PAYPAL = "paypal"
    MANUAL = "manual"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class LedgerEntryType(str, Enum):
    HELD_FUNDS = "held_funds"
    PLATFORM_FEE = "platform_fee"
    RELEASE = "release"
    PAYOUT = "payout"
    REFUND = "refund"


class PayoutMilestone(str, Enum):
    RESERVATION = "reservation"
    COMPLETION = "completion"


class PayoutStatus(str, Enum):
    LOCKED = "locked"
    ELIGIBLE = "eligible"
    PAID = "paid"
    REVERSED = "reversed"
    HELD = "held"


class SubscriptionProvider(str, Enum):
    STRIPE = "stripe"
    MANUAL = "manual"
