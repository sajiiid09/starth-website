const parseFlag = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1";
};

export const isAdminDummyMode = parseFlag(import.meta.env.VITE_DUMMY_ADMIN_MODE, false);
export const isAdminReadOnly = parseFlag(import.meta.env.VITE_ADMIN_READONLY, false);
export const isDemoOpsEnabled = parseFlag(import.meta.env.VITE_ENABLE_DEMO_OPS, true);
export const isReconciliationOpsEnabled = parseFlag(import.meta.env.VITE_ENABLE_RECONCILIATION_OPS, true);
export const hasAdminOpsTools = isDemoOpsEnabled || isReconciliationOpsEnabled;
