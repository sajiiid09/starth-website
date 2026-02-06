import { request } from "@/api/httpClient";
import {
  PlannerService,
  PlannerServiceResponse,
  PlannerSession,
  ChatMessage
} from "@/features/planner/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let idCounter = 0;

function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

function retitleFromText(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "New plan";
  const title = normalized.split(" ").slice(0, 5).join(" ");
  return title.length > 52 ? `${title.slice(0, 49)}...` : title;
}

// ---------------------------------------------------------------------------
// API request / response shapes
// ---------------------------------------------------------------------------

type SendMessageRequest = {
  sessionId: string;
  userText: string;
  messages: ChatMessage[];
  draftBrief?: PlannerSession["draftBrief"];
  mode?: PlannerSession["mode"];
  briefStatus?: PlannerSession["briefStatus"];
  plannerState?: PlannerSession["plannerState"];
};

type SendMessageResponse = {
  assistantMessage: ChatMessage;
  updatedPlannerState?: PlannerServiceResponse["updatedPlannerState"];
  updatedSession?: PlannerServiceResponse["updatedSession"];
};

type SeedSessionsResponse = {
  sessions: PlannerSession[];
};

// ---------------------------------------------------------------------------
// Service implementation
// ---------------------------------------------------------------------------

export const plannerServiceApi: PlannerService = {
  async sendMessage(
    session: PlannerSession,
    userText: string
  ): Promise<PlannerServiceResponse> {
    const payload: SendMessageRequest = {
      sessionId: session.id,
      userText,
      messages: session.messages,
      draftBrief: session.draftBrief,
      mode: session.mode,
      briefStatus: session.briefStatus,
      plannerState: session.plannerState
    };

    const response = await request<SendMessageResponse>(
      "POST",
      "/api/planner/message",
      { body: payload, auth: true }
    );

    return {
      assistantMessage: response.assistantMessage,
      updatedPlannerState: response.updatedPlannerState,
      updatedSession: response.updatedSession
    };
  },

  createNewSession(): PlannerSession {
    const now = Date.now();
    return {
      id: nextId("session"),
      title: "New plan",
      createdAt: now,
      updatedAt: now,
      mode: "scratch",
      briefStatus: "collecting",
      canvasState: "hidden",
      messages: []
    };
  },

  seedSessions(): PlannerSession[] {
    // Fire-and-forget fetch from backend; return empty array synchronously.
    // PlannerSessionsContext will merge results when the promise resolves.
    request<SeedSessionsResponse>("GET", "/api/planner/sessions", { auth: true })
      .then((response) => {
        if (response.sessions?.length) {
          window.dispatchEvent(
            new CustomEvent("planner:sessions-seeded", {
              detail: { sessions: response.sessions }
            })
          );
        }
      })
      .catch((error) => {
        console.warn("[plannerService.api] Failed to fetch seed sessions:", error);
      });

    return [];
  },

  retitleSessionFromFirstMessage(
    session: PlannerSession,
    firstUserText: string
  ): PlannerSession {
    return {
      ...session,
      title: retitleFromText(firstUserText)
    };
  },

  async approveLayout(sessionId: string): Promise<void> {
    await request<void>(
      "POST",
      `/api/planner/sessions/${encodeURIComponent(sessionId)}/approve-layout`,
      { auth: true }
    );
  }
};
