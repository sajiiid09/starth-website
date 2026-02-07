import { request } from "@/api/httpClient";
import type {
  AdminAuditLog,
  AdminBooking,
  AdminDispute,
  AdminDisputeStatus,
  AdminPayout,
  AdminPayment,
  AdminService,
  AdminPaymentStatus,
  AdminVendor,
  ApprovePayoutInput,
  AuditLogFilters,
  BookingFinanceSummary,
  BookingListFilters,
  DisputeListFilters,
  FinanceOverview,
  PaymentListFilters,
  PayoutListFilters,
  ResolveDisputeInput,
  VendorListFilters
} from "@/features/admin/types";

const withQuery = (path: string, params: Record<string, string | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
};

export const adminServiceApi: AdminService = {
  listVendors(filters?: VendorListFilters) {
    const path = withQuery("/admin/vendors", {
      status: filters?.status,
      q: filters?.q
    });
    return request<AdminVendor[]>("GET", path, { auth: true });
  },

  getVendor(vendorId: string) {
    return request<AdminVendor>("GET", `/admin/vendors/${vendorId}`, { auth: true });
  },

  approveVendor(vendorId: string) {
    if (!vendorId) {
      return Promise.reject(new Error("vendorId is required"));
    }
    return request<AdminVendor>("POST", `/admin/vendors/${vendorId}/approve`, { auth: true });
  },

  needsChangesVendor(vendorId: string, note: string) {
    if (!vendorId) {
      return Promise.reject(new Error("vendorId is required"));
    }
    if (!note.trim()) {
      return Promise.reject(new Error("note is required"));
    }
    return request<AdminVendor>("POST", `/admin/vendors/${vendorId}/needs-changes`, {
      auth: true,
      body: { reason: note },
    });
  },

  disableVendorPayout(vendorId: string, reason?: string) {
    if (!vendorId) {
      return Promise.reject(new Error("vendorId is required"));
    }
    return request<AdminVendor>("POST", `/admin/vendors/${vendorId}/disable-payout`, {
      auth: true,
      body: { reason: reason ?? "" },
    });
  },

  listBookings(filters?: BookingListFilters) {
    const path = withQuery("/admin/bookings", {
      status: filters?.status,
      q: filters?.q
    });
    return request<AdminBooking[]>("GET", path, { auth: true });
  },

  getBooking(bookingId: string) {
    return request<AdminBooking>("GET", `/admin/bookings/${bookingId}`, { auth: true });
  },

  listPayments(filters?: PaymentListFilters) {
    const path = withQuery("/admin/payments", {
      status: filters?.status,
      q: filters?.q
    });
    return request<AdminPayment[]>("GET", path, { auth: true });
  },

  listPayouts(filters?: PayoutListFilters) {
    const path = withQuery("/admin/payouts", {
      status: filters?.status,
      q: filters?.q
    });
    return request<AdminPayout[]>("GET", path, { auth: true });
  },

  approvePayout(payoutId: string, input: ApprovePayoutInput) {
    if (!payoutId) {
      return Promise.reject(new Error("payoutId is required"));
    }
    if (!input.confirm) {
      return Promise.reject(new Error("confirm=true is required"));
    }
    return request<AdminPayout>("POST", `/admin/payouts/${payoutId}/approve`, { auth: true });
  },

  holdPayout(payoutId: string, reason?: string) {
    if (!payoutId) {
      return Promise.reject(new Error("payoutId is required"));
    }
    return request<AdminPayout>("POST", `/admin/payouts/${payoutId}/hold`, {
      auth: true,
      body: { reason: reason ?? "" },
    });
  },

  reversePayout(payoutId: string, reason?: string) {
    if (!payoutId) {
      return Promise.reject(new Error("payoutId is required"));
    }
    return request<AdminPayout>("POST", `/admin/payouts/${payoutId}/reverse`, {
      auth: true,
      body: { reason: reason ?? "" },
    });
  },

  getFinanceOverview() {
    return request<FinanceOverview>("GET", "/admin/finance/overview", { auth: true });
  },

  getBookingFinanceSummary(bookingId: string) {
    return request<BookingFinanceSummary>("GET", `/admin/bookings/${bookingId}/finance-summary`, {
      auth: true
    });
  },

  listAuditLogs(filters?: AuditLogFilters) {
    const path = withQuery("/admin/audit-logs", {
      q: filters?.q,
      action: filters?.action,
      resourceType: filters?.resourceType
    });
    return request<AdminAuditLog[]>("GET", path, { auth: true });
  },

  listDisputes(filters?: DisputeListFilters) {
    const path = withQuery("/admin/disputes", {
      status: filters?.status
    });
    return request<AdminDispute[]>("GET", path, { auth: true });
  },

  getDispute(disputeId: string) {
    return request<AdminDispute>("GET", `/admin/disputes/${disputeId}`, { auth: true });
  },

  updateDisputeStatus(disputeId: string, status: AdminDisputeStatus) {
    if (!disputeId) {
      return Promise.reject(new Error("disputeId is required"));
    }
    return request<AdminDispute>("POST", `/admin/disputes/${disputeId}/status`, {
      auth: true,
      body: { status },
    });
  },

  holdPayoutsForBooking(bookingId: string, reason?: string) {
    if (!bookingId) {
      return Promise.reject(new Error("bookingId is required"));
    }
    return request<AdminPayout[]>("POST", `/admin/bookings/${bookingId}/hold-payouts`, {
      auth: true,
      body: { reason: reason ?? "" },
    });
  },

  opsResetDummyData() {
    return request<{ resetAt: string }>("POST", "/admin/ops/reset-dummy-data", { auth: true });
  },

  opsReconcileDummyPayments() {
    return request<{ paymentId: string; status: AdminPaymentStatus }>(
      "POST",
      "/admin/ops/reconcile-dummy-payments",
      { auth: true }
    );
  },

  resolveDispute(input: ResolveDisputeInput) {
    if (!input.disputeId) {
      return Promise.reject(new Error("disputeId is required"));
    }
    return request<AdminDispute>("POST", `/admin/disputes/${input.disputeId}/resolve`, {
      auth: true,
      body: { resolution: input.resolution, release_funds: input.resolution === "RESOLVED" },
    });
  }
};
