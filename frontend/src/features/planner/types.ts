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

export type PlannerSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  plannerStateUpdatedAt?: number;
  messages: ChatMessage[];
  plannerState?: PlannerState;
};

export type PlannerServiceResponse = {
  assistantMessage: ChatMessage;
  updatedPlannerState?: PlannerState;
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
