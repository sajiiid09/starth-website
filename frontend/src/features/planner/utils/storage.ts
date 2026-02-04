import {
  safeParsePlannerSession,
  safeParsePlannerSessionsPayload
} from "@/features/planner/schemas";
import { PlannerSession } from "@/features/planner/types";

export const PLANNER_SESSIONS_STORAGE_KEY = "strathwell_planner_sessions_v3";
const PLANNER_SESSIONS_STORAGE_LEGACY_KEY = "strathwell_planner_sessions_v2";
export const PLANNER_STORAGE_VERSION = 3 as const;

export type PlannerStoragePayload = {
  version: 3;
  activeSessionId: string | null;
  sessions: PlannerSession[];
};

export const sortSessionsByUpdatedAt = (sessions: PlannerSession[]) =>
  [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

const migrateLegacyV2Storage = (): PlannerStoragePayload | null => {
  const raw = window.localStorage.getItem(PLANNER_SESSIONS_STORAGE_LEGACY_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as {
      version?: number;
      activeSessionId?: unknown;
      sessions?: unknown[];
    };
    if (parsed.version !== 2 || !Array.isArray(parsed.sessions)) {
      return null;
    }

    const migratedSessions = parsed.sessions
      .map((session) => {
        if (!session || typeof session !== "object") return null;
        const { matches: _legacyMatches, ...rest } = session as Record<string, unknown>;
        const validated = safeParsePlannerSession(rest);
        return validated.success ? validated.data : null;
      })
      .filter((session): session is PlannerSession => Boolean(session));

    return {
      version: PLANNER_STORAGE_VERSION,
      activeSessionId:
        typeof parsed.activeSessionId === "string" || parsed.activeSessionId === null
          ? parsed.activeSessionId
          : null,
      sessions: sortSessionsByUpdatedAt(migratedSessions)
    };
  } catch (error) {
    console.warn("Failed to migrate legacy planner storage payload:", error);
    return null;
  }
};

export const loadPlannerStorage = (): PlannerStoragePayload | null => {
  try {
    const raw = window.localStorage.getItem(PLANNER_SESSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const validated = safeParsePlannerSessionsPayload(parsed);
      if (!validated.success) {
        console.warn("Planner storage payload failed validation. Ignoring persisted value.");
      } else {
        return {
          version: PLANNER_STORAGE_VERSION,
          activeSessionId: validated.data.activeSessionId,
          sessions: sortSessionsByUpdatedAt(validated.data.sessions)
        };
      }
    }

    const migrated = migrateLegacyV2Storage();
    if (migrated) {
      savePlannerStorage(migrated);
      window.localStorage.removeItem(PLANNER_SESSIONS_STORAGE_LEGACY_KEY);
      return migrated;
    }

    return null;
  } catch (error) {
    console.warn("Failed to load planner storage payload:", error);
    const migrated = migrateLegacyV2Storage();
    if (migrated) {
      savePlannerStorage(migrated);
      window.localStorage.removeItem(PLANNER_SESSIONS_STORAGE_LEGACY_KEY);
      return migrated;
    }
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
    window.localStorage.removeItem(PLANNER_SESSIONS_STORAGE_LEGACY_KEY);
  } catch (error) {
    console.warn("Failed to clear planner storage payload:", error);
  }
};
