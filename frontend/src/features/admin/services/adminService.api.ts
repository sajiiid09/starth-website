import { request } from "@/api/httpClient";
import type {
  AdminAuditLog,
  AdminBooking,
  AdminDispute,
  AdminPayout,
  AdminPayment,
  AdminService,
  AdminVendor,
  ResolveDisputeInput,
  UpdatePayoutStatusInput,
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

  listBookings() {
    return request<AdminBooking[]>("GET", "/admin/bookings", { auth: true });
  },

  listPayments() {
    return request<AdminPayment[]>("GET", "/admin/payments", { auth: true });
  },

  listPayouts() {
    return request<AdminPayout[]>("GET", "/admin/payouts", { auth: true });
  },

  approvePayout(input: UpdatePayoutStatusInput) {
    if (!input.payoutId) {
      return Promise.reject(new Error("payoutId is required"));
    }
    return throwNotImplemented("approvePayout");
  },

  holdPayout(input: UpdatePayoutStatusInput) {
    if (!input.payoutId) {
      return Promise.reject(new Error("payoutId is required"));
    }
    return throwNotImplemented("holdPayout");
  },

  listAuditLogs() {
    return request<AdminAuditLog[]>("GET", "/admin/audit-logs", { auth: true });
  },

  listDisputes() {
    return request<AdminDispute[]>("GET", "/admin/disputes", { auth: true });
  },

  resolveDispute(input: ResolveDisputeInput) {
    if (!input.disputeId) {
      return Promise.reject(new Error("disputeId is required"));
    }
    return throwNotImplemented("resolveDispute");
  }
};
