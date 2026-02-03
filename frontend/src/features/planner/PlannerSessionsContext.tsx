import React from "react";

export type ChatRole = "user" | "assistant" | "system";
export type ChatStatus = "thinking" | "orchestrating" | "final";
export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  status?: ChatStatus;
  createdAt: number;
};

export type PlannerSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
};

const SESSIONS_STORAGE_KEY = "strathwell_planner_sessions_v1";
const ACTIVE_SESSION_STORAGE_KEY = "strathwell_planner_active_session_v1";

const createSeedSessions = (): PlannerSession[] => {
  const now = Date.now();
  return [
    {
      id: "seed-product-launch",
      title: "Product Launch Plan",
      createdAt: now - 1000 * 60 * 60 * 30,
      updatedAt: now - 1000 * 60 * 20,
      messages: [
        {
          id: "seed-1",
          role: "assistant",
          text: "Hi! I can help structure your product launch. What date and target guest profile are you planning for?",
          status: "final",
          createdAt: now - 1000 * 60 * 30
        },
        {
          id: "seed-2",
          role: "user",
          text: "March launch in SF, about 120 guests, premium feel.",
          status: "final",
          createdAt: now - 1000 * 60 * 29
        },
        {
          id: "seed-3",
          role: "assistant",
          text: "Perfect. I would prioritize venue shortlist, guest journey, and production timeline first.",
          status: "final",
          createdAt: now - 1000 * 60 * 28
        }
      ]
    },
    {
      id: "seed-offsite-q2",
      title: "Offsite Q2",
      createdAt: now - 1000 * 60 * 60 * 60,
      updatedAt: now - 1000 * 60 * 60 * 6,
      messages: [
        {
          id: "seed-4",
          role: "assistant",
          text: "Let us map goals, attendees, and session format for your Q2 offsite.",
          status: "final",
          createdAt: now - 1000 * 60 * 60 * 8
        }
      ]
    },
    {
      id: "seed-brand-evening",
      title: "Brand Evening Blueprint",
      createdAt: now - 1000 * 60 * 60 * 72,
      updatedAt: now - 1000 * 60 * 60 * 15,
      messages: []
    },
    {
      id: "seed-roadshow-nyc",
      title: "Roadshow NYC",
      createdAt: now - 1000 * 60 * 60 * 110,
      updatedAt: now - 1000 * 60 * 60 * 40,
      messages: []
    },
    {
      id: "seed-board-retreat",
      title: "Board Retreat",
      createdAt: now - 1000 * 60 * 60 * 150,
      updatedAt: now - 1000 * 60 * 60 * 72,
      messages: []
    },
    {
      id: "seed-holiday-gala",
      title: "Holiday Gala Draft",
      createdAt: now - 1000 * 60 * 60 * 200,
      updatedAt: now - 1000 * 60 * 60 * 120,
      messages: []
    }
  ];
};

const sortSessionsByUpdatedAt = (sessions: PlannerSession[]) =>
  [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

const createSessionId = () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const sanitizeStoredSessions = (value: unknown): PlannerSession[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((session) => typeof session === "object" && session !== null)
    .map((session) => {
      const typed = session as PlannerSession;
      return {
        id: typed.id,
        title: typed.title,
        createdAt: typed.createdAt,
        updatedAt: typed.updatedAt,
        messages: Array.isArray(typed.messages) ? typed.messages : []
      };
    })
    .filter(
      (session) =>
        typeof session.id === "string" &&
        typeof session.title === "string" &&
        typeof session.createdAt === "number" &&
        typeof session.updatedAt === "number"
    );
};

export const toSessionTitleFromMessage = (text: string) => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "New plan";
  const title = normalized.split(" ").slice(0, 5).join(" ");
  return title.length > 56 ? `${title.slice(0, 53)}...` : title;
};

type PlannerSessionsContextValue = {
  isReady: boolean;
  sessions: PlannerSession[];
  activeSessionId: string | null;
  activeSession: PlannerSession | null;
  setActiveSession: (sessionId: string) => void;
  createNewSession: () => string;
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

  React.useEffect(() => {
    if (!enabled) {
      setSessions([]);
      setActiveSessionId(null);
      setIsReady(true);
      return;
    }

    let loadedSessions = createSeedSessions();
    let loadedActiveSessionId: string | null = null;

    try {
      const storedSessions = window.localStorage.getItem(SESSIONS_STORAGE_KEY);
      const storedActiveId = window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);

      if (storedSessions) {
        const parsed = JSON.parse(storedSessions);
        const sanitized = sanitizeStoredSessions(parsed);
        if (sanitized.length > 0) {
          loadedSessions = sortSessionsByUpdatedAt(sanitized);
        }
      }

      if (
        storedActiveId &&
        loadedSessions.some((session) => session.id === storedActiveId)
      ) {
        loadedActiveSessionId = storedActiveId;
      }
    } catch (error) {
      console.warn("Failed to load planner sessions from localStorage:", error);
    }

    setSessions(sortSessionsByUpdatedAt(loadedSessions));
    setActiveSessionId(loadedActiveSessionId ?? loadedSessions[0]?.id ?? null);
    setIsReady(true);
  }, [enabled]);

  React.useEffect(() => {
    if (!enabled || !isReady) return;

    try {
      window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      if (activeSessionId) {
        window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, activeSessionId);
      }
    } catch (error) {
      console.warn("Failed to persist planner sessions to localStorage:", error);
    }
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
    const now = Date.now();
    const created: PlannerSession = {
      id: createSessionId(),
      title: "New plan",
      createdAt: now,
      updatedAt: now,
      messages: []
    };

    setSessions((prev) => sortSessionsByUpdatedAt([created, ...prev]));
    setActiveSessionId(created.id);
    return created.id;
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
      activeSession,
      activeSessionId,
      createNewSession,
      isReady,
      sessions,
      setActiveSession,
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
