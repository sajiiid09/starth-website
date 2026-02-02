import { dummyAuditLogs } from "@/features/admin/data/dummyAuditLogs";
import { dummyBookings } from "@/features/admin/data/dummyBookings";
import { dummyDisputes } from "@/features/admin/data/dummyDisputes";
import { dummyPayments } from "@/features/admin/data/dummyPayments";
import { dummyPayouts } from "@/features/admin/data/dummyPayouts";
import { dummyVendors } from "@/features/admin/data/dummyVendors";
import type {
  AdminAuditLog,
  AdminDispute,
  AdminPayout,
  AdminService,
  AdminVendor,
  ResolveDisputeInput,
  UpdatePayoutStatusInput,
  UpdateVendorVerificationInput,
  VendorListFilters
} from "@/features/admin/types";

const NETWORK_DELAY_MS = 120;

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

let vendors: AdminVendor[] = clone(dummyVendors);
let payouts: AdminPayout[] = clone(dummyPayouts);
let disputes: AdminDispute[] = clone(dummyDisputes);
let auditLogs: AdminAuditLog[] = clone(dummyAuditLogs);

const wait = () => new Promise((resolve) => window.setTimeout(resolve, NETWORK_DELAY_MS));

const nowIso = () => new Date().toISOString();

const getVendorOrThrow = (vendorId: string) => {
  const vendor = vendors.find((item) => item.id === vendorId);
  if (!vendor) {
    throw new Error(`Vendor ${vendorId} not found`);
  }
  return vendor;
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

const appendAuditLog = (entry: Omit<AdminAuditLog, "id" | "timestamp">) => {
  auditLogs = [
    {
      id: `aud_runtime_${Date.now()}`,
      timestamp: nowIso(),
      ...entry
    },
    ...auditLogs
  ];
};

const applyVendorState = (
  input: UpdateVendorVerificationInput,
  verificationState: AdminVendor["verificationState"],
  action: string,
  payoutEnabled: boolean
) => {
  const vendor = getVendorOrThrow(input.vendorId);
  vendor.verificationState = verificationState;
  vendor.payoutEnabled = payoutEnabled;
  vendor.updatedAt = nowIso();

  appendAuditLog({
    actor: "admin:mock-user",
    action,
    resourceType: "VENDOR",
    resourceId: vendor.id,
    ip: "127.0.0.1",
    userAgent: "mock-admin-ui/1.0",
    metadata: input.note ? { note: input.note } : undefined
  });

  return clone(vendor);
};

const applyPayoutState = (
  input: UpdatePayoutStatusInput,
  status: AdminPayout["status"],
  action: string
) => {
  const payout = getPayoutOrThrow(input.payoutId);
  payout.status = status;
  payout.updatedAt = nowIso();

  appendAuditLog({
    actor: "admin:mock-user",
    action,
    resourceType: "PAYOUT",
    resourceId: payout.id,
    ip: "127.0.0.1",
    userAgent: "mock-admin-ui/1.0",
    metadata: input.note ? { note: input.note } : undefined
  });

  return clone(payout);
};

export const adminServiceMock: AdminService = {
  async listVendors(filters?: VendorListFilters) {
    await wait();

    const query = filters?.query?.trim().toLowerCase();
    const filtered = vendors.filter((vendor) => {
      if (filters?.verificationState && vendor.verificationState !== filters.verificationState) {
        return false;
      }
      if (filters?.subtype && vendor.subtype !== filters.subtype) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [vendor.displayName, vendor.contactEmail, vendor.contactName]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    return clone(filtered);
  },

  async approveVendor(input) {
    await wait();
    return applyVendorState(input, "APPROVED", "VENDOR_APPROVED", true);
  },

  async requestVendorChanges(input) {
    await wait();
    return applyVendorState(input, "NEEDS_CHANGES", "VENDOR_CHANGES_REQUESTED", false);
  },

  async disableVendorPayout(input) {
    await wait();
    return applyVendorState(input, "DISABLED_PAYOUT", "VENDOR_PAYOUT_DISABLED", false);
  },

  async listBookings() {
    await wait();
    return clone(dummyBookings);
  },

  async listPayments() {
    await wait();
    return clone(dummyPayments);
  },

  async listPayouts() {
    await wait();
    return clone(payouts);
  },

  async approvePayout(input) {
    await wait();
    return applyPayoutState(input, "APPROVED", "PAYOUT_APPROVED");
  },

  async holdPayout(input) {
    await wait();
    return applyPayoutState(input, "HELD", "PAYOUT_HELD");
  },

  async listAuditLogs() {
    await wait();
    return clone(auditLogs);
  },

  async listDisputes() {
    await wait();
    return clone(disputes);
  },

  async resolveDispute(input: ResolveDisputeInput) {
    await wait();

    const dispute = getDisputeOrThrow(input.disputeId);
    dispute.status = input.resolution;
    dispute.updatedAt = nowIso();

    appendAuditLog({
      actor: "admin:mock-user",
      action: input.resolution === "RESOLVED" ? "DISPUTE_RESOLVED" : "DISPUTE_REJECTED",
      resourceType: "DISPUTE",
      resourceId: dispute.id,
      ip: "127.0.0.1",
      userAgent: "mock-admin-ui/1.0",
      metadata: input.note ? { note: input.note } : undefined
    });

    return clone(dispute);
  }
};
