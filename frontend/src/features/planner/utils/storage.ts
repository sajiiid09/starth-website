import {
  safeParsePlannerSession,
  safeParsePlannerSessionsPayload
} from "@/features/planner/schemas";
import { DraftBrief, DraftBriefField, PlannerSession } from "@/features/planner/types";

export const PLANNER_SESSIONS_STORAGE_KEY = "strathwell_planner_sessions_v4";
const PLANNER_SESSIONS_STORAGE_V3_KEY = "strathwell_planner_sessions_v3";
const PLANNER_SESSIONS_STORAGE_V2_KEY = "strathwell_planner_sessions_v2";
export const PLANNER_STORAGE_VERSION = 4 as const;

export type PlannerStoragePayload = {
  version: 4;
  activeSessionId: string | null;
  sessions: PlannerSession[];
};

export const sortSessionsByUpdatedAt = (sessions: PlannerSession[]) =>
  [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

const BRIEF_FIELDS: DraftBriefField[] = [
  "eventType",
  "guestCount",
  "budget",
  "city",
  "dateRange"
];

const isDraftBriefField = (value: unknown): value is DraftBriefField =>
  typeof value === "string" && BRIEF_FIELDS.includes(value as DraftBriefField);

const normalizeDraftBrief = (input: unknown): DraftBrief | undefined => {
  if (!input || typeof input !== "object") return undefined;

  const raw = input as Record<string, unknown>;
  const normalized: DraftBrief = {};

  if (typeof raw.eventType === "string" && raw.eventType.trim()) {
    normalized.eventType = raw.eventType.trim();
  }
  if (typeof raw.city === "string" && raw.city.trim()) {
    normalized.city = raw.city.trim();
  }
  if (typeof raw.dateRange === "string" && raw.dateRange.trim()) {
    normalized.dateRange = raw.dateRange.trim();
  }

  if (typeof raw.guestCount === "number" && Number.isFinite(raw.guestCount) && raw.guestCount > 0) {
    normalized.guestCount = Math.round(raw.guestCount);
  }
  if (typeof raw.budget === "number" && Number.isFinite(raw.budget) && raw.budget > 0) {
    normalized.budget = Math.round(raw.budget);
  }

  return Object.keys(normalized).length ? normalized : undefined;
};

const normalizeLegacySession = (input: unknown): PlannerSession | null => {
  if (!input || typeof input !== "object") return null;

  const {
    matches: _legacyMatches,
    mode,
    briefStatus,
    canvasState,
    draftBrief,
    lastAskedField,
    ...rest
  } = input as Record<string, unknown>;

  const hasPlannerState = rest.plannerState !== undefined && rest.plannerState !== null;

  const normalizedMode =
    mode === "scratch" || mode === "template" ? mode : hasPlannerState ? "template" : "scratch";

  const normalizedBriefStatus =
    briefStatus === "collecting" ||
    briefStatus === "ready_to_generate" ||
    briefStatus === "generating" ||
    briefStatus === "generated"
      ? briefStatus
      : hasPlannerState
        ? "generated"
        : "collecting";

  const normalizedCanvasState =
    canvasState === "hidden" || canvasState === "visible"
      ? canvasState
      : hasPlannerState
        ? "visible"
        : "hidden";

  const normalizedLastAskedField = isDraftBriefField(lastAskedField)
    ? lastAskedField
    : undefined;

  const candidate = {
    ...rest,
    mode: normalizedMode,
    briefStatus: normalizedBriefStatus,
    canvasState: normalizedCanvasState,
    draftBrief: normalizeDraftBrief(draftBrief),
    lastAskedField: normalizedLastAskedField
  };

  const validated = safeParsePlannerSession(candidate);
  return validated.success ? validated.data : null;
};

const migrateLegacyStorage = (
  storageKey: string,
  expectedVersion: number
): PlannerStoragePayload | null => {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as {
      version?: number;
      activeSessionId?: unknown;
      sessions?: unknown[];
    };

    if (parsed.version !== expectedVersion || !Array.isArray(parsed.sessions)) {
      return null;
    }

    const migratedSessions = parsed.sessions
      .map((session) => normalizeLegacySession(session))
      .filter((session): session is PlannerSession => Boolean(session));

    const normalizedActiveSessionId =
      typeof parsed.activeSessionId === "string" &&
      migratedSessions.some((session) => session.id === parsed.activeSessionId)
        ? parsed.activeSessionId
        : null;

    return {
      version: PLANNER_STORAGE_VERSION,
      activeSessionId: normalizedActiveSessionId,
      sessions: sortSessionsByUpdatedAt(migratedSessions)
    };
  } catch (error) {
    console.warn("Failed to migrate legacy planner storage payload:", error);
    return null;
  }
};

const migrateFromLegacyKeys = (): PlannerStoragePayload | null => {
  const legacyCandidates: Array<{ key: string; version: number }> = [
    { key: PLANNER_SESSIONS_STORAGE_V3_KEY, version: 3 },
    { key: PLANNER_SESSIONS_STORAGE_V2_KEY, version: 2 }
  ];

  for (const candidate of legacyCandidates) {
    const migrated = migrateLegacyStorage(candidate.key, candidate.version);
    if (!migrated) continue;

    savePlannerStorage(migrated);
    window.localStorage.removeItem(candidate.key);
    return migrated;
  }

  return null;
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

    return migrateFromLegacyKeys();
  } catch (error) {
    console.warn("Failed to load planner storage payload:", error);
    return migrateFromLegacyKeys();
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
    window.localStorage.removeItem(PLANNER_SESSIONS_STORAGE_V3_KEY);
    window.localStorage.removeItem(PLANNER_SESSIONS_STORAGE_V2_KEY);
  } catch (error) {
    console.warn("Failed to clear planner storage payload:", error);
  }
};
