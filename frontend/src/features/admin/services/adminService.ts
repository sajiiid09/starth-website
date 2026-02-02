import type { AdminService } from "@/features/admin/types";
import { adminServiceApi } from "@/features/admin/services/adminService.api";
import { adminServiceMock } from "@/features/admin/services/adminService.mock";

const dummyModeFlag = (import.meta.env.VITE_DUMMY_ADMIN_MODE ?? "true").toLowerCase();
const isDummyMode = dummyModeFlag === "true" || dummyModeFlag === "1";

export const adminService: AdminService = isDummyMode ? adminServiceMock : adminServiceApi;

export { isDummyMode as isAdminDummyMode };
