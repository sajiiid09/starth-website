import { REQUIRED_BRIEF_FIELDS } from "@/features/planner/brief/briefFields";

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
  status?: "thinking" | "orchestrating" | "final";
};

export type PlannerState = {
  blueprintId: string;
  title: string;
  summary: string;
  kpis: {
    totalCost: number;
    costPerAttendee: number;
    confidencePct: number;
  };
  spacePlan: {
    beforeLabel: string;
    afterLabel: string;
    inventory: {
      chairs: number;
      tables: number;
      stage: number;
      buffet: number;
    };
  };
  timeline: Array<{
    time: string;
    title: string;
    notes: string;
  }>;
  budget: {
    total: number;
    breakdown: Array<{
      label: string;
      pct: number;
    }>;
    tradeoffNote?: string;
  };
  status: "draft" | "ready_for_review" | "approved";
};

export type DraftBrief = {
  eventType?: string;
  guestCount?: number;
  budget?: number;
  city?: string;
  dateRange?: string;
};

export type DraftBriefField = (typeof REQUIRED_BRIEF_FIELDS)[number];

export type PlannerMode = "scratch" | "template";
export type PlannerViewMode = "chat_only" | "split";
export type PlannerBriefStatus =
  | "collecting"
  | "ready_to_generate"
  | "generating"
  | "artifact_ready"
  | "canvas_open";

export type PlannerArtifact = {
  id: string;
  title: string;
  createdAt: number;
};

export type PlannerSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  mode: PlannerMode;
  viewMode: PlannerViewMode;
  briefStatus: PlannerBriefStatus;
  draftBrief?: DraftBrief;
  artifact?: PlannerArtifact;
  lastAskedField?: DraftBriefField;
  plannerStateUpdatedAt?: number;
  messages: ChatMessage[];
  plannerState?: PlannerState;
};

export type PlannerSessionUpdate = Partial<
  Omit<PlannerSession, "id" | "createdAt" | "updatedAt" | "messages">
>;

export type PlannerDeferredGeneration = {
  delayMs: number;
  plannerState: PlannerState;
  assistantText: string;
  sessionUpdate?: PlannerSessionUpdate;
};

export type PlannerServiceResponse = {
  assistantMessage: ChatMessage;
  updatedPlannerState?: PlannerState;
  updatedSession?: PlannerSessionUpdate;
  deferredGeneration?: PlannerDeferredGeneration;
};

export type PlannerService = {
  sendMessage: (
    session: PlannerSession,
    userText: string
  ) => Promise<PlannerServiceResponse>;
  createNewSession: () => PlannerSession;
  seedSessions: () => PlannerSession[];
  retitleSessionFromFirstMessage: (
    session: PlannerSession,
    firstUserText: string
  ) => PlannerSession;
  approveLayout?: (sessionId: string) => Promise<void>;
};
