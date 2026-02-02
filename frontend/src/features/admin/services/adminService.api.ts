import { request } from "@/api/httpClient";
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
  FinanceOverview,
  PaymentListFilters,
  PayoutListFilters,
  ResolveDisputeInput,
  VendorListFilters
} from "@/features/admin/types";

const throwNotImplemented = (methodName: string): never => {
  throw new Error(`${methodName} is not implemented yet for the live admin API.`);
};

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
    return throwNotImplemented("approveVendor");
  },

  needsChangesVendor(vendorId: string, note: string) {
    if (!vendorId) {
      return Promise.reject(new Error("vendorId is required"));
    }
    if (!note.trim()) {
      return Promise.reject(new Error("note is required"));
    }
    return throwNotImplemented("needsChangesVendor");
  },

  disableVendorPayout(vendorId: string, _reason?: string) {
    if (!vendorId) {
      return Promise.reject(new Error("vendorId is required"));
    }
    return throwNotImplemented("disableVendorPayout");
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
    return throwNotImplemented("approvePayout");
  },

  holdPayout(payoutId: string, _reason?: string) {
    if (!payoutId) {
      return Promise.reject(new Error("payoutId is required"));
    }
    return throwNotImplemented("holdPayout");
  },

  reversePayout(payoutId: string, _reason?: string) {
    if (!payoutId) {
      return Promise.reject(new Error("payoutId is required"));
    }
    return throwNotImplemented("reversePayout");
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

  updateDisputeStatus(disputeId: string, _status: AdminDisputeStatus) {
    if (!disputeId) {
      return Promise.reject(new Error("disputeId is required"));
    }
    return throwNotImplemented("updateDisputeStatus");
  },

  holdPayoutsForBooking(bookingId: string, _reason?: string) {
    if (!bookingId) {
      return Promise.reject(new Error("bookingId is required"));
    }
    return throwNotImplemented("holdPayoutsForBooking");
  },

  opsResetDummyData() {
    return throwNotImplemented("opsResetDummyData");
  },

  opsReconcileDummyPayments() {
    return throwNotImplemented("opsReconcileDummyPayments");
  },

  resolveDispute(input: ResolveDisputeInput) {
    if (!input.disputeId) {
      return Promise.reject(new Error("disputeId is required"));
    }
    return throwNotImplemented("resolveDispute");
  }
};
