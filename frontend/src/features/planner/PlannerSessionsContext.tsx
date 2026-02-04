import React from "react";
import { plannerService } from "@/features/planner/services/plannerService";
import { PlannerSession } from "@/features/planner/types";
import {
  loadPlannerStorage,
  savePlannerStorage,
  sortSessionsByUpdatedAt
} from "@/features/planner/utils/storage";

type PlannerSessionsContextValue = {
  isReady: boolean;
  sessions: PlannerSession[];
  activeSessionId: string | null;
  activeSession: PlannerSession | null;
  setActiveSession: (sessionId: string) => void;
  createNewSession: () => PlannerSession;
  updateSession: (
    sessionId: string,
    updater: (session: PlannerSession) => PlannerSession
  ) => void;
};

const PlannerSessionsContext = React.createContext<PlannerSessionsContextValue | null>(null);

type PlannerSessionsProviderProps = {
  enabled?: boolean;
  children: React.ReactNode;
};

export const PlannerSessionsProvider: React.FC<PlannerSessionsProviderProps> = ({
  enabled = true,
  children
}) => {
  const [isReady, setIsReady] = React.useState(false);
  const [sessions, setSessions] = React.useState<PlannerSession[]>([]);
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null);
  const persistTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!enabled) {
      setSessions([]);
      setActiveSessionId(null);
      setIsReady(true);
      return;
    }

    const loaded = loadPlannerStorage();
    const initialSessions =
      loaded?.sessions && loaded.sessions.length > 0
        ? sortSessionsByUpdatedAt(loaded.sessions)
        : sortSessionsByUpdatedAt(plannerService.seedSessions());
    const initialActiveSessionId =
      loaded?.activeSessionId &&
      initialSessions.some((session) => session.id === loaded.activeSessionId)
        ? loaded.activeSessionId
        : initialSessions[0]?.id ?? null;

    setSessions(initialSessions);
    setActiveSessionId(initialActiveSessionId);
    setIsReady(true);
  }, [enabled]);

  React.useEffect(() => {
    if (!enabled || !isReady) {
      return;
    }

    if (persistTimeoutRef.current) {
      window.clearTimeout(persistTimeoutRef.current);
    }

    persistTimeoutRef.current = window.setTimeout(() => {
      savePlannerStorage({
        version: 3,
        sessions,
        activeSessionId
      });
      persistTimeoutRef.current = null;
    }, 140);

    return () => {
      if (persistTimeoutRef.current) {
        window.clearTimeout(persistTimeoutRef.current);
        persistTimeoutRef.current = null;
      }
    };
  }, [activeSessionId, enabled, isReady, sessions]);

  React.useEffect(() => {
    if (!enabled || !isReady) return;
    if (sessions.length === 0) {
      setActiveSessionId(null);
      return;
    }

    if (!activeSessionId || !sessions.some((session) => session.id === activeSessionId)) {
      setActiveSessionId(sessions[0].id);
    }
  }, [activeSessionId, enabled, isReady, sessions]);

  const setActiveSession = React.useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  const createNewSession = React.useCallback(() => {
    const created = plannerService.createNewSession();
    setSessions((prev) => sortSessionsByUpdatedAt([created, ...prev]));
    setActiveSessionId(created.id);
    return created;
  }, []);

  const updateSession = React.useCallback(
    (sessionId: string, updater: (session: PlannerSession) => PlannerSession) => {
      setSessions((prev) => {
        let didUpdate = false;
        const next = prev.map((session) => {
          if (session.id !== sessionId) return session;
          didUpdate = true;
          const updated = updater(session);
          return { ...updated, updatedAt: Date.now() };
        });

        if (!didUpdate) return prev;
        return sortSessionsByUpdatedAt(next);
      });
    },
    []
  );

  const activeSession = React.useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessionId, sessions]
  );

  const value = React.useMemo(
    () => ({
      isReady,
      sessions,
      activeSessionId,
      activeSession,
      setActiveSession,
      createNewSession,
      updateSession
    }),
    [
      isReady,
      sessions,
      activeSessionId,
      activeSession,
      setActiveSession,
      createNewSession,
      updateSession
    ]
  );

  return (
    <PlannerSessionsContext.Provider value={value}>
      {children}
    </PlannerSessionsContext.Provider>
  );
};

export const usePlannerSessions = () => {
  const context = React.useContext(PlannerSessionsContext);
  if (!context) {
    throw new Error("usePlannerSessions must be used within PlannerSessionsProvider.");
  }
  return context;
};
