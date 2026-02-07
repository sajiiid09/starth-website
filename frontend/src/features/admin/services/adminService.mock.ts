import { dummyAuditLogs } from "@/features/admin/data/dummyAuditLogs";
import { dummyBookings } from "@/features/admin/data/dummyBookings";
import { dummyDisputes } from "@/features/admin/data/dummyDisputes";
import { dummyPayments } from "@/features/admin/data/dummyPayments";
import { dummyPayouts } from "@/features/admin/data/dummyPayouts";
import { dummyVendors } from "@/features/admin/data/dummyVendors";
import type {
  AdminAuditLog,
  AdminBooking,
  AdminDispute,
  AdminDisputeStatus,
  AdminPayout,
  AdminPayment,
  AdminService,
  AdminVendor,
  ApprovePayoutInput,
  AuditLogFilters,
  BookingFinanceSummary,
  BookingListFilters,
  DisputeListFilters,
  FinanceLedgerEntry,
  FinanceOverview,
  PaymentListFilters,
  PayoutListFilters,
  ResolveDisputeInput,
  VendorListFilters
} from "@/features/admin/types";

const NETWORK_DELAY_MS = 120;
const HOLD_STATUSES: AdminPayout["status"][] = ["REQUESTED", "PENDING_ADMIN_APPROVAL", "HELD"];
const RELEASED_STATUSES: AdminPayout["status"][] = ["APPROVED", "PAID"];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

let vendors: AdminVendor[] = [];
let bookings: AdminBooking[] = [];
let payments: AdminPayment[] = [];
let payouts: AdminPayout[] = [];
let disputes: AdminDispute[] = [];
let auditLogs: AdminAuditLog[] = [];

const resetInMemoryData = () => {
  vendors = clone(dummyVendors);
  bookings = clone(dummyBookings);
  payments = clone(dummyPayments);
  payouts = clone(dummyPayouts);
  disputes = clone(dummyDisputes);
  auditLogs = clone(dummyAuditLogs);
};

resetInMemoryData();

const wait = () => new Promise((resolve) => window.setTimeout(resolve, NETWORK_DELAY_MS));
const nowIso = () => new Date().toISOString();

const appendAuditLog = (entry: Omit<AdminAuditLog, "id" | "timestamp">) => {
  auditLogs = [
    {
      id: `aud_runtime_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: nowIso(),
      ...entry
    },
    ...auditLogs
  ];
};

const getVendorOrThrow = (vendorId: string) => {
  const vendor = vendors.find((item) => item.id === vendorId);
  if (!vendor) {
    throw new Error(`Vendor ${vendorId} not found`);
  }
  return vendor;
};

const getBookingOrThrow = (bookingId: string) => {
  const booking = bookings.find((item) => item.id === bookingId);
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }
  return booking;
};

const getPayoutOrThrow = (payoutId: string) => {
  const payout = payouts.find((item) => item.id === payoutId);
  if (!payout) {
    throw new Error(`Payout ${payoutId} not found`);
  }
  return payout;
};

const getDisputeOrThrow = (disputeId: string) => {
  const dispute = disputes.find((item) => item.id === disputeId);
  if (!dispute) {
    throw new Error(`Dispute ${disputeId} not found`);
  }
  return dispute;
};

const updateVendorState = (
  vendorId: string,
  verificationState: AdminVendor["verificationState"],
  action: string,
  payoutEnabled: boolean,
  note?: string
) => {
  const vendor = getVendorOrThrow(vendorId);
  vendor.verificationState = verificationState;
  vendor.payoutEnabled = payoutEnabled;
  vendor.updatedAt = nowIso();
  vendor.submission.lastUpdatedAt = vendor.updatedAt;

  if (note) {
    vendor.submission.note = note;
  }

  appendAuditLog({
    actor: "admin:mock-user",
    action,
    resourceType: "VENDOR",
    resourceId: vendor.id,
    ip: "127.0.0.1",
    userAgent: "mock-admin-ui/1.0",
    metadata: note ? { note } : undefined
  });

  return clone(vendor);
};

const filterByQuery = <T>(items: T[], q: string | undefined, serializer: (item: T) => string) => {
  const query = q?.trim().toLowerCase();
  if (!query) {
    return items;
  }
  return items.filter((item) => serializer(item).toLowerCase().includes(query));
};

const buildBookingSummary = (bookingId: string): BookingFinanceSummary => {
  const booking = getBookingOrThrow(bookingId);
  const payment = payments.find((item) => item.bookingId === bookingId) ?? null;
  const bookingPayouts = payouts
    .filter((item) => item.bookingId === bookingId)
    .sort((a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime());

  const heldFundsCents = bookingPayouts
    .filter((item) => HOLD_STATUSES.includes(item.status))
    .reduce((sum, item) => sum + item.amountCents, 0);

  const releasedFundsCents = bookingPayouts
    .filter((item) => RELEASED_STATUSES.includes(item.status))
    .reduce((sum, item) => sum + item.amountCents, 0);

  const reversedFundsCents = bookingPayouts
    .filter((item) => item.status === "REVERSED")
    .reduce((sum, item) => sum + item.amountCents, 0);

  const ledger: FinanceLedgerEntry[] = [];

  if (payment) {
    ledger.push({
      id: `led_pay_${payment.id}`,
      label: `Payment ${payment.status.toLowerCase().replace(/_/g, " ")}`,
      category: "PAYMENT",
      amountCents: payment.amountCents,
      occurredAt: payment.updatedAt
    });
  }

  bookingPayouts.forEach((payout) => {
    if (HOLD_STATUSES.includes(payout.status)) {
      ledger.push({
        id: `led_hold_${payout.id}`,
        label: `${payout.type.toLowerCase()} payout held`,
        category: "HELD",
        amountCents: payout.amountCents,
        occurredAt: payout.updatedAt
      });
      return;
    }

    if (RELEASED_STATUSES.includes(payout.status)) {
      ledger.push({
        id: `led_release_${payout.id}`,
        label: `${payout.type.toLowerCase()} payout released`,
        category: "RELEASED",
        amountCents: payout.amountCents,
        occurredAt: payout.updatedAt
      });
      return;
    }

    if (payout.status === "REVERSED") {
      ledger.push({
        id: `led_reverse_${payout.id}`,
        label: `${payout.type.toLowerCase()} payout reversed`,
        category: "REVERSAL",
        amountCents: payout.amountCents,
        occurredAt: payout.updatedAt
      });
    }
  });

  ledger.sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

  return {
    bookingId,
    bookingTotalCents: booking.totalAmountCents,
    payment,
    payouts: clone(bookingPayouts),
    heldFundsCents,
    releasedFundsCents,
    reversedFundsCents,
    ledger
  };
};

const applyPayoutState = (payoutId: string, status: AdminPayout["status"], action: string, note?: string) => {
  const payout = getPayoutOrThrow(payoutId);
  payout.status = status;
  payout.updatedAt = nowIso();

  appendAuditLog({
    actor: "admin:mock-user",
    action,
    resourceType: "PAYOUT",
    resourceId: payout.id,
    ip: "127.0.0.1",
    userAgent: "mock-admin-ui/1.0",
    metadata: note ? { note } : undefined
  });

  return clone(payout);
};

const setDisputeStatus = (disputeId: string, status: AdminDisputeStatus) => {
  const dispute = getDisputeOrThrow(disputeId);
  dispute.status = status;
  dispute.updatedAt = nowIso();

  appendAuditLog({
    actor: "admin:mock-user",
    action: `DISPUTE_${status}`,
    resourceType: "DISPUTE",
    resourceId: dispute.id,
    ip: "127.0.0.1",
    userAgent: "mock-admin-ui/1.0"
  });

  return clone(dispute);
};

export const adminServiceMock: AdminService = {
  async listVendors(filters?: VendorListFilters) {
    await wait();

    const statusFiltered = filters?.status
      ? vendors.filter((vendor) => vendor.verificationState === filters.status)
      : vendors;

    return clone(
      filterByQuery(statusFiltered, filters?.q, (vendor) =>
        [vendor.displayName, vendor.contactEmail, vendor.contactName, vendor.city, vendor.state].join(" ")
      )
    );
  },

  async getVendor(vendorId: string) {
    await wait();
    return clone(getVendorOrThrow(vendorId));
  },

  async approveVendor(vendorId: string) {
    await wait();
    return updateVendorState(vendorId, "APPROVED", "VENDOR_APPROVED", true);
  },

  async needsChangesVendor(vendorId: string, note: string) {
    await wait();
    return updateVendorState(vendorId, "NEEDS_CHANGES", "VENDOR_CHANGES_REQUESTED", false, note);
  },

  async disableVendorPayout(vendorId: string, reason?: string) {
    await wait();
    return updateVendorState(vendorId, "DISABLED_PAYOUT", "VENDOR_PAYOUT_DISABLED", false, reason);
  },

  async listBookings(filters?: BookingListFilters) {
    await wait();

    const statusFiltered = filters?.status
      ? bookings.filter((booking) => booking.state === filters.status)
      : bookings;

    return clone(
      filterByQuery(statusFiltered, filters?.q, (booking) =>
        [booking.id, booking.organizerName, booking.vendorName, booking.eventName, booking.venueCity].join(" ")
      )
    );
  },

  async getBooking(bookingId: string) {
    await wait();
    return clone(getBookingOrThrow(bookingId));
  },

  async listPayments(filters?: PaymentListFilters) {
    await wait();

    const statusFiltered = filters?.status
      ? payments.filter((payment) => payment.status === filters.status)
      : payments;

    return clone(
      filterByQuery(statusFiltered, filters?.q, (payment) =>
        [payment.id, payment.bookingId, payment.providerRef, payment.status].join(" ")
      )
    );
  },

  async listPayouts(filters?: PayoutListFilters) {
    await wait();

    const statusFiltered = filters?.status
      ? payouts.filter((payout) => payout.status === filters.status)
      : payouts;

    return clone(
      filterByQuery(statusFiltered, filters?.q, (payout) =>
        [payout.id, payout.bookingId, payout.vendorId, payout.vendorName, payout.type, payout.status].join(" ")
      )
    );
  },

  async approvePayout(payoutId: string, input: ApprovePayoutInput) {
    await wait();

    if (!input.confirm) {
      throw new Error("Payout approval requires explicit confirmation.");
    }

    return applyPayoutState(payoutId, "APPROVED", "PAYOUT_APPROVED", "Approved by admin review");
  },

  async holdPayout(payoutId: string, reason?: string) {
    await wait();
    return applyPayoutState(payoutId, "HELD", "PAYOUT_HELD", reason);
  },

  async reversePayout(payoutId: string, reason?: string) {
    await wait();
    return applyPayoutState(payoutId, "REVERSED", "PAYOUT_REVERSED", reason);
  },

  async getFinanceOverview(): Promise<FinanceOverview> {
    await wait();

    const totalHeldFundsCents = payouts
      .filter((item) => HOLD_STATUSES.includes(item.status))
      .reduce((sum, item) => sum + item.amountCents, 0);

    const totalPaidOutCents = payouts
      .filter((item) => item.status === "PAID")
      .reduce((sum, item) => sum + item.amountCents, 0);

    const pendingPayoutsCount = payouts.filter((item) => ["REQUESTED", "PENDING_ADMIN_APPROVAL"].includes(item.status)).length;

    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth();

    const activeBookingsThisMonth = bookings.filter((booking) => {
      const eventDate = new Date(booking.startsAt);
      return (
        booking.state === "ACTIVE" &&
        eventDate.getUTCFullYear() === currentYear &&
        eventDate.getUTCMonth() === currentMonth
      );
    }).length;

    return {
      totalHeldFundsCents,
      totalPaidOutCents,
      pendingPayoutsCount,
      activeBookingsThisMonth,
      recentActivity: clone(auditLogs.slice(0, 8))
    };
  },

  async getBookingFinanceSummary(bookingId: string) {
    await wait();
    return buildBookingSummary(bookingId);
  },

  async listAuditLogs(filters?: AuditLogFilters) {
    await wait();

    let items = auditLogs;

    if (filters?.action) {
      items = items.filter((item) => item.action === filters.action);
    }

    if (filters?.resourceType) {
      items = items.filter((item) => item.resourceType === filters.resourceType);
    }

    items = filterByQuery(items, filters?.q, (item) =>
      [item.actor, item.action, item.resourceType, item.resourceId, JSON.stringify(item.metadata ?? {})].join(" ")
    );

    return clone(items);
  },

  async listDisputes(filters?: DisputeListFilters) {
    await wait();

    const statusFiltered = filters?.status
      ? disputes.filter((dispute) => dispute.status === filters.status)
      : disputes;

    return clone(statusFiltered);
  },

  async getDispute(disputeId: string) {
    await wait();
    return clone(getDisputeOrThrow(disputeId));
  },

  async updateDisputeStatus(disputeId: string, status: AdminDisputeStatus) {
    await wait();
    return setDisputeStatus(disputeId, status);
  },

  async holdPayoutsForBooking(bookingId: string, reason?: string) {
    await wait();

    const related = payouts.filter((payout) => payout.bookingId === bookingId && payout.status !== "PAID" && payout.status !== "REVERSED");

    related.forEach((payout) => {
      payout.status = "HELD";
      payout.updatedAt = nowIso();
    });

    appendAuditLog({
      actor: "admin:mock-user",
      action: "BOOKING_PAYOUTS_HELD",
      resourceType: "BOOKING",
      resourceId: bookingId,
      ip: "127.0.0.1",
      userAgent: "mock-admin-ui/1.0",
      metadata: {
        reason,
        heldPayoutIds: related.map((item) => item.id)
      }
    });

    return clone(related);
  },

  async opsResetDummyData() {
    await wait();
    resetInMemoryData();

    appendAuditLog({
      actor: "admin:mock-user",
      action: "OPS_DEMO_SEED_RESET",
      resourceType: "BOOKING",
      resourceId: "demo-datasets",
      ip: "127.0.0.1",
      userAgent: "mock-admin-ui/1.0"
    });

    return { resetAt: nowIso() };
  },

  async opsReconcileDummyPayments() {
    await wait();

    if (payments.length === 0) {
      throw new Error("No payments available for reconciliation.");
    }

    const randomIndex = Math.floor(Math.random() * payments.length);
    const target = payments[randomIndex];
    const previousStatus = target.status;

    target.status = "CORRECTED";
    target.updatedAt = nowIso();

    appendAuditLog({
      actor: "admin:mock-user",
      action: "OPS_RECONCILIATION_RUN",
      resourceType: "PAYMENT",
      resourceId: target.id,
      ip: "127.0.0.1",
      userAgent: "mock-admin-ui/1.0",
      metadata: {
        previousStatus,
        newStatus: target.status
      }
    });

    return {
      paymentId: target.id,
      status: target.status
    };
  },

  async resolveDispute(input: ResolveDisputeInput) {
    await wait();

    const nextStatus: AdminDisputeStatus = input.resolution === "RESOLVED" ? "RESOLVED" : "REJECTED";
    return setDisputeStatus(input.disputeId, nextStatus);
  }
};
