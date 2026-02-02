import type { AdminService } from "@/features/admin/types";
import { isAdminReadOnly, isAdminDummyMode } from "@/features/admin/config";
import { adminServiceApi } from "@/features/admin/services/adminService.api";
import { adminServiceMock } from "@/features/admin/services/adminService.mock";

const baseAdminService = isAdminDummyMode ? adminServiceMock : adminServiceApi;

const guardMutation = <TArgs extends unknown[], TResult>(
  methodName: string,
  mutation: (...args: TArgs) => Promise<TResult>
) => {
  return async (...args: TArgs) => {
    if (isAdminReadOnly) {
      throw new Error(`Admin read-only mode is enabled. ${methodName} is disabled.`);
    }
    return mutation(...args);
  };
};

export const adminService: AdminService = {
  ...baseAdminService,
  approveVendor: guardMutation("approveVendor", baseAdminService.approveVendor),
  needsChangesVendor: guardMutation("needsChangesVendor", baseAdminService.needsChangesVendor),
  disableVendorPayout: guardMutation("disableVendorPayout", baseAdminService.disableVendorPayout),
  approvePayout: guardMutation("approvePayout", baseAdminService.approvePayout),
  holdPayout: guardMutation("holdPayout", baseAdminService.holdPayout),
  reversePayout: guardMutation("reversePayout", baseAdminService.reversePayout),
  updateDisputeStatus: guardMutation("updateDisputeStatus", baseAdminService.updateDisputeStatus),
  holdPayoutsForBooking: guardMutation("holdPayoutsForBooking", baseAdminService.holdPayoutsForBooking),
  opsResetDummyData: guardMutation("opsResetDummyData", baseAdminService.opsResetDummyData),
  opsReconcileDummyPayments: guardMutation(
    "opsReconcileDummyPayments",
    baseAdminService.opsReconcileDummyPayments
  ),
  resolveDispute: guardMutation("resolveDispute", baseAdminService.resolveDispute)
};

export { isAdminDummyMode };
