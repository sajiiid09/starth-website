import { plannerServiceApi } from "@/features/planner/services/plannerService.api";
import { plannerServiceMock } from "@/features/planner/services/plannerService.mock";

const isDummyModeEnabled = () => {
  const raw = import.meta.env.VITE_DUMMY_PLANNER_MODE;
  if (raw === undefined) return true;
  const normalized = String(raw).toLowerCase();
  return normalized !== "false" && normalized !== "0" && normalized !== "off";
};

export const plannerService = isDummyModeEnabled() ? plannerServiceMock : plannerServiceApi;
export const isPlannerDummyMode = isDummyModeEnabled();
