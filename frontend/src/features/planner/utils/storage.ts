import {
  safeParsePlannerSession,
  safeParsePlannerSessionsPayload
} from "@/features/planner/schemas";
import { REQUIRED_BRIEF_FIELDS } from "@/features/planner/brief/briefFields";
import { DraftBrief, DraftBriefField, PlannerSession } from "@/features/planner/types";

export const PLANNER_SESSIONS_STORAGE_KEY = "strathwell_planner_sessions_v5";
const PLANNER_SESSIONS_STORAGE_V4_KEY = "strathwell_planner_sessions_v4";
const PLANNER_SESSIONS_STORAGE_V3_KEY = "strathwell_planner_sessions_v3";
const PLANNER_SESSIONS_STORAGE_V2_KEY = "strathwell_planner_sessions_v2";
export const PLANNER_STORAGE_VERSION = 5 as const;

export type PlannerStoragePayload = {
  version: 5;
  activeSessionId: string | null;
  sessions: PlannerSession[];
};

export const sortSessionsByUpdatedAt = (sessions: PlannerSession[]) =>
  [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

const isDraftBriefField = (value: unknown): value is DraftBriefField =>
  typeof value === "string" && REQUIRED_BRIEF_FIELDS.includes(value as DraftBriefField);

const isPlannerMode = (value: unknown): value is PlannerSession["mode"] =>
  value === "scratch" || value === "template";

const isPlannerViewMode = (value: unknown): value is PlannerSession["viewMode"] =>
  value === "chat_only" || value === "split";

const isPlannerBriefStatus = (value: unknown): value is PlannerSession["briefStatus"] =>
  value === "collecting" ||
  value === "ready_to_generate" ||
  value === "generating" ||
  value === "artifact_ready" ||
  value === "canvas_open";

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

const normalizeArtifact = (input: unknown): PlannerSession["artifact"] | undefined => {
  if (!input || typeof input !== "object") return undefined;

  const raw = input as Record<string, unknown>;
  if (
    typeof raw.id !== "string" ||
    !raw.id.trim() ||
    typeof raw.title !== "string" ||
    !raw.title.trim() ||
    typeof raw.createdAt !== "number" ||
    !Number.isFinite(raw.createdAt)
  ) {
    return undefined;
  }

  return {
    id: raw.id,
    title: raw.title,
    createdAt: raw.createdAt
  };
};

const getDefaultSessionState = (hasPlannerState: boolean) =>
  hasPlannerState
    ? {
        mode: "template" as const,
        viewMode: "split" as const,
        briefStatus: "canvas_open" as const
      }
    : {
        mode: "scratch" as const,
        viewMode: "chat_only" as const,
        briefStatus: "collecting" as const
      };

const normalizeLegacySession = (input: unknown): PlannerSession | null => {
  if (!input || typeof input !== "object") return null;

  const {
    matches: _legacyMatches,
    mode,
    viewMode,
    briefStatus,
    canvasState: _legacyCanvasState,
    draftBrief,
    artifact,
    lastAskedField,
    ...rest
  } = input as Record<string, unknown>;

  const hasPlannerState = rest.plannerState !== undefined && rest.plannerState !== null;
  const defaults = getDefaultSessionState(hasPlannerState);

  const normalizedMode = isPlannerMode(mode) ? mode : defaults.mode;

  const normalizedViewMode = isPlannerViewMode(viewMode) ? viewMode : defaults.viewMode;

  const normalizedBriefStatus = isPlannerBriefStatus(briefStatus)
    ? briefStatus
    : defaults.briefStatus;

  const normalizedLastAskedField = isDraftBriefField(lastAskedField)
    ? lastAskedField
    : undefined;

  const candidate = {
    ...rest,
    mode: normalizedMode,
    viewMode: normalizedViewMode,
    briefStatus: normalizedBriefStatus,
    draftBrief: normalizeDraftBrief(draftBrief),
    artifact: normalizeArtifact(artifact),
    lastAskedField: normalizedLastAskedField
  };

  const validated = safeParsePlannerSession(candidate);
  return validated.success ? (validated.data as unknown as PlannerSession) : null;
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

    if (migratedSessions.length === 0) {
      return null;
    }

    const normalizedActiveSessionId =
      typeof parsed.activeSessionId === "string" &&
      migratedSessions.some((session) => session.id === parsed.activeSessionId)
        ? parsed.activeSessionId
        : migratedSessions[0].id;

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
    { key: PLANNER_SESSIONS_STORAGE_V4_KEY, version: 4 },
    { key: PLANNER_SESSIONS_STORAGE_V3_KEY, version: 3 },
    { key: PLANNER_SESSIONS_STORAGE_V2_KEY, version: 2 }
  ];

  for (const candidate of legacyCandidates) {
    const migrated = migrateLegacyStorage(candidate.key, candidate.version);
    if (!migrated) continue;

    savePlannerStorage(migrated);
    window.localStorage.removeItem(PLANNER_SESSIONS_STORAGE_V4_KEY);
    window.localStorage.removeItem(PLANNER_SESSIONS_STORAGE_V3_KEY);
    window.localStorage.removeItem(PLANNER_SESSIONS_STORAGE_V2_KEY);
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
          sessions: sortSessionsByUpdatedAt(validated.data.sessions as unknown as PlannerSession[])
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
    window.localStorage.removeItem(PLANNER_SESSIONS_STORAGE_V4_KEY);
    window.localStorage.removeItem(PLANNER_SESSIONS_STORAGE_V3_KEY);
    window.localStorage.removeItem(PLANNER_SESSIONS_STORAGE_V2_KEY);
  } catch (error) {
    console.warn("Failed to clear planner storage payload:", error);
  }
};
