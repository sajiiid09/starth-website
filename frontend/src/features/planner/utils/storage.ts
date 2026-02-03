import {
  safeParsePlannerSessionsPayload
} from "@/features/planner/schemas";
import { PlannerSession } from "@/features/planner/types";

export const PLANNER_SESSIONS_STORAGE_KEY = "strathwell_planner_sessions_v2";
export const PLANNER_STORAGE_VERSION = 2 as const;

export type PlannerStoragePayload = {
  version: 2;
  activeSessionId: string | null;
  sessions: PlannerSession[];
};

export const sortSessionsByUpdatedAt = (sessions: PlannerSession[]) =>
  [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

export const loadPlannerStorage = (): PlannerStoragePayload | null => {
  try {
    const raw = window.localStorage.getItem(PLANNER_SESSIONS_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const validated = safeParsePlannerSessionsPayload(parsed);
    if (!validated.success) {
      console.warn("Planner storage payload failed validation. Ignoring persisted value.");
      return null;
    }

    return {
      version: PLANNER_STORAGE_VERSION,
      activeSessionId: validated.data.activeSessionId,
      sessions: sortSessionsByUpdatedAt(validated.data.sessions)
    };
  } catch (error) {
    console.warn("Failed to load planner storage payload:", error);
    return null;
  }
};

export const savePlannerStorage = (payload: PlannerStoragePayload) => {
  try {
    window.localStorage.setItem(
      PLANNER_SESSIONS_STORAGE_KEY,
      JSON.stringify({
        version: PLANNER_STORAGE_VERSION,
        activeSessionId: payload.activeSessionId,
        sessions: sortSessionsByUpdatedAt(payload.sessions)
      })
    );
  } catch (error) {
    console.warn("Failed to save planner storage payload:", error);
  }
};

export const clearPlannerStorage = () => {
  try {
    window.localStorage.removeItem(PLANNER_SESSIONS_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear planner storage payload:", error);
  }
};
