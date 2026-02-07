import { REQUIRED_BRIEF_FIELDS } from "@/features/planner/brief/briefFields";
import {
  ChatMessage,
  DraftBrief,
  DraftBriefField,
  PlannerService,
  PlannerServiceResponse,
  PlannerSession,
  PlannerState
} from "@/features/planner/types";

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

function buildAssistantMessage(text: string): ChatMessage {
  return {
    id: nextId("assistant"),
    role: "assistant",
    text,
    status: "final",
    createdAt: Date.now()
  };
}

function normalizeText(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function parseEventType(userText: string): string | undefined {
  const lower = userText.toLowerCase();
  const eventTypes = [
    "conference",
    "retreat",
    "wedding",
    "launch",
    "summit",
    "workshop",
    "gala",
    "meetup",
    "expo",
    "festival",
    "party"
  ];

  const found = eventTypes.find((eventType) => lower.includes(eventType));
  if (!found) return undefined;

  return found.charAt(0).toUpperCase() + found.slice(1);
}

function parseGuestCount(userText: string): number | undefined {
  const withLabel = userText.match(
    /\b([0-9]{1,4}(?:,[0-9]{3})?)\s*(?:guests?|attendees?|people|pax)\b/i
  );
  if (withLabel) {
    return Number(withLabel[1].replace(/,/g, ""));
  }

  const countLabel = userText.match(
    /(?:guest\s*count|headcount|attendance)\s*(?:is|=|around|about)?\s*([0-9]{1,4}(?:,[0-9]{3})?)/i
  );
  if (countLabel) {
    return Number(countLabel[1].replace(/,/g, ""));
  }

  return undefined;
}

function toScaledNumber(value: string, scale?: string): number {
  const numeric = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return NaN;

  if (!scale) return numeric;
  if (scale.toLowerCase() === "k") return numeric * 1_000;
  if (scale.toLowerCase() === "m") return numeric * 1_000_000;
  return numeric;
}

function parseBudget(userText: string): number | undefined {
  const budgetKeyword = /\b(budget|spend|cost|cap)\b/i.test(userText);

  const currencyMatch = userText.match(/\$\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+(?:\.[0-9]+)?)\s*([kKmM])?/);
  if (currencyMatch) {
    const budget = toScaledNumber(currencyMatch[1], currencyMatch[2]);
    return Number.isFinite(budget) && budget > 0 ? Math.round(budget) : undefined;
  }

  if (budgetKeyword) {
    const contextual = userText.match(
      /([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+(?:\.[0-9]+)?)\s*([kKmM])?/
    );
    if (contextual) {
      const budget = toScaledNumber(contextual[1], contextual[2]);
      return Number.isFinite(budget) && budget > 0 ? Math.round(budget) : undefined;
    }
  }

  const shorthand = userText.match(/\b([1-9][0-9]{1,2})\s*([kK])\b/);
  if (shorthand) {
    const budget = toScaledNumber(shorthand[1], shorthand[2]);
    return Number.isFinite(budget) && budget > 0 ? Math.round(budget) : undefined;
  }

  return undefined;
}

function parseDateRange(userText: string): string | undefined {
  const normalized = normalizeText(userText);

  const relativeMatch = normalized.match(
    /\b(next month|this month|next quarter|this quarter|next year|this year|tomorrow|next week)\b/i
  );
  if (relativeMatch) {
    return relativeMatch[1];
  }

  const monthYearMatch = normalized.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/i
  );
  if (monthYearMatch) {
    return monthYearMatch[0];
  }

  const fromToMatch = normalized.match(
    /\bfrom\s+([A-Za-z0-9, ]{3,40})\s+to\s+([A-Za-z0-9, ]{3,40})\b/i
  );
  if (fromToMatch) {
    return `from ${fromToMatch[1].trim()} to ${fromToMatch[2].trim()}`;
  }

  const inMonthMatch = normalized.match(
    /\bin\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/i
  );
  if (inMonthMatch) {
    return inMonthMatch[0].replace(/^in\s+/i, "");
  }

  return undefined;
}

function toTitleCase(input: string): string {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function parseCity(userText: string): string | undefined {
  const normalized = normalizeText(userText);
  const cityMatch = normalized.match(/\b(?:in|at)\s+([A-Za-z][A-Za-z .'-]{1,40})(?=$|,|\.|\bfor\b|\bon\b)/i);

  if (!cityMatch) return undefined;

  const candidate = cityMatch[1].trim().replace(/\s+/g, " ");
  if (!candidate) return undefined;

  const stopWords = ["budget", "guests", "attendees", "people", "conference", "retreat", "wedding"];
  if (stopWords.some((word) => candidate.toLowerCase().includes(word))) {
    return undefined;
  }

  return toTitleCase(candidate);
}

function extractDraftFromText(userText: string): DraftBrief {
  return {
    eventType: parseEventType(userText),
    guestCount: parseGuestCount(userText),
    budget: parseBudget(userText),
    city: parseCity(userText),
    dateRange: parseDateRange(userText)
  };
}

function mergeDraftBrief(current: DraftBrief | undefined, patch: DraftBrief): DraftBrief {
  const merged: DraftBrief = { ...(current ?? {}) };

  if (patch.eventType) merged.eventType = patch.eventType;
  if (typeof patch.guestCount === "number" && patch.guestCount > 0) merged.guestCount = patch.guestCount;
  if (typeof patch.budget === "number" && patch.budget > 0) merged.budget = patch.budget;
  if (patch.city) merged.city = patch.city;
  if (patch.dateRange) merged.dateRange = patch.dateRange;

  return merged;
}

function hasBriefFieldValue(draftBrief: DraftBrief, field: DraftBriefField): boolean {
  const value = draftBrief[field];
  if (typeof value === "number") return Number.isFinite(value) && value > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return false;
}

function getNextMissingField(draftBrief: DraftBrief): DraftBriefField | null {
  const missing = REQUIRED_BRIEF_FIELDS.find((field) => !hasBriefFieldValue(draftBrief, field));
  return missing ?? null;
}

function getQuestionForMissingField(field: DraftBriefField): string {
  if (field === "eventType") {
    return "What type of event are you planning (conference, retreat, wedding, launch, etc.)?";
  }
  if (field === "guestCount") {
    return "How many guests should I plan for?";
  }
  if (field === "budget") {
    return "What total budget should I optimize for?";
  }
  if (field === "city") {
    return "Which city should I plan this event in?";
  }
  return "What date range should I target (for example, March 2026 or next month)?";
}

function getBriefSummary(draftBrief: DraftBrief): string {
  const parts: string[] = [];

  if (draftBrief.eventType) parts.push(draftBrief.eventType);
  if (draftBrief.guestCount) parts.push(`${draftBrief.guestCount} guests`);
  if (draftBrief.budget) parts.push(`$${draftBrief.budget.toLocaleString()} budget`);
  if (draftBrief.city) parts.push(`in ${draftBrief.city}`);
  if (draftBrief.dateRange) parts.push(`for ${draftBrief.dateRange}`);

  return parts.join(" | ");
}

function buildPlannerStateFromBrief(draftBrief: DraftBrief): PlannerState {
  const eventType = draftBrief.eventType ?? "Event";
  const guestCount = draftBrief.guestCount ?? 100;
  const budget = draftBrief.budget ?? 25000;
  const city = draftBrief.city ?? "TBD";
  const dateRange = draftBrief.dateRange ?? "TBD";

  return {
    blueprintId: nextId("blueprint"),
    title: `${eventType} Blueprint`,
    summary: `${eventType} plan for ${guestCount} guests in ${city} (${dateRange}).`,
    kpis: {
      totalCost: budget,
      costPerAttendee: Math.max(1, Math.round(budget / Math.max(guestCount, 1))),
      confidencePct: 86
    },
    spacePlan: {
      beforeLabel: "Current layout",
      afterLabel: "Recommended layout",
      inventory: {
        chairs: Math.max(guestCount, 20),
        tables: Math.max(Math.round(guestCount / 8), 6),
        stage: 1,
        buffet: Math.max(Math.round(guestCount / 45), 2)
      }
    },
    timeline: [
      {
        time: "08:30",
        title: "Setup + vendor check-in",
        notes: "Confirm staging, AV, and signage before doors open."
      },
      {
        time: "10:00",
        title: `${eventType} program start`,
        notes: "Launch main session with host intro and agenda."
      },
      {
        time: "16:30",
        title: "Wrap + teardown",
        notes: "Closeout, supplier handoff, and post-event checklist."
      }
    ],
    budget: {
      total: budget,
      breakdown: [
        { label: "Venue", pct: 35 },
        { label: "Catering", pct: 25 },
        { label: "Production", pct: 20 },
        { label: "Staffing", pct: 10 },
        { label: "Contingency", pct: 10 }
      ],
      tradeoffNote: "Reallocate production and catering percentages based on sponsor requirements."
    },
    status: "draft"
  };
}

function getPlannerEditResponse(session: PlannerSession, userText: string): PlannerServiceResponse {
  const current = session.plannerState;

  if (!current) {
    return {
      assistantMessage: buildAssistantMessage(
        "I can refine the plan once a blueprint is available. Share event basics and I'll generate one first."
      )
    };
  }

  const next = { ...current };
  const parsedBudget = parseBudget(userText);
  const parsedGuestCount = parseGuestCount(userText);
  const parsedCity = parseCity(userText);
  const parsedDateRange = parseDateRange(userText);

  if (parsedBudget) {
    next.budget = {
      ...next.budget,
      total: parsedBudget
    };
    next.kpis = {
      ...next.kpis,
      totalCost: parsedBudget,
      costPerAttendee: Math.max(1, Math.round(parsedBudget / Math.max(parsedGuestCount ?? session.draftBrief?.guestCount ?? 100, 1)))
    };
  }

  if (parsedGuestCount) {
    const activeBudget = parsedBudget ?? next.budget.total;
    next.kpis = {
      ...next.kpis,
      costPerAttendee: Math.max(1, Math.round(activeBudget / Math.max(parsedGuestCount, 1)))
    };
    next.spacePlan = {
      ...next.spacePlan,
      inventory: {
        ...next.spacePlan.inventory,
        chairs: Math.max(parsedGuestCount, 20),
        tables: Math.max(Math.round(parsedGuestCount / 8), 6),
        buffet: Math.max(Math.round(parsedGuestCount / 45), 2)
      }
    };
  }

  const locationNote = parsedCity ? ` in ${parsedCity}` : "";
  const timingNote = parsedDateRange ? ` for ${parsedDateRange}` : "";
  next.summary = `${next.summary} Updated via chat${locationNote}${timingNote}.`;

  return {
    assistantMessage: buildAssistantMessage("Updated. I applied those edits to the current blueprint."),
    updatedPlannerState: next,
    updatedSession: {
      briefStatus: session.briefStatus === "canvas_open" ? "canvas_open" : "artifact_ready"
    }
  };
}

function getScratchCollectionResponse(session: PlannerSession, userText: string): PlannerServiceResponse {
  if (session.briefStatus === "generating") {
    return {
      assistantMessage: buildAssistantMessage("Generating blueprint..."),
      updatedSession: {
        briefStatus: "generating"
      }
    };
  }

  const extracted = extractDraftFromText(userText);
  const mergedDraft = mergeDraftBrief(session.draftBrief, extracted);
  const missingField = getNextMissingField(mergedDraft);

  if (missingField) {
    return {
      assistantMessage: buildAssistantMessage(getQuestionForMissingField(missingField)),
      updatedSession: {
        mode: "scratch",
        briefStatus: "collecting",
        draftBrief: mergedDraft,
        lastAskedField: missingField
      }
    };
  }

  const generatedPlannerState = buildPlannerStateFromBrief(mergedDraft);
  const now = Date.now();

  return {
    assistantMessage: buildAssistantMessage("Generating blueprint..."),
    updatedSession: {
      mode: "scratch",
      briefStatus: "generating",
      draftBrief: mergedDraft,
      lastAskedField: undefined
    },
    deferredGeneration: {
      delayMs: 1400,
      plannerState: generatedPlannerState,
      assistantText: `Blueprint ready: ${getBriefSummary(mergedDraft)}.`,
      sessionUpdate: {
        briefStatus: "artifact_ready",
        artifact: {
          id: generatedPlannerState.blueprintId,
          title: generatedPlannerState.title,
          createdAt: now
        },
        plannerStateUpdatedAt: now
      }
    }
  };
}

export const plannerServiceMock: PlannerService = {
  async sendMessage(session: PlannerSession, userText: string): Promise<PlannerServiceResponse> {
    const trimmed = normalizeText(userText);

    if (!trimmed) {
      return {
        assistantMessage: buildAssistantMessage("Tell me a bit more about your event goals to continue.")
      };
    }

    await new Promise((resolve) => window.setTimeout(resolve, 220));

    const hasPlannerState = Boolean(session.plannerState);
    if (session.mode === "template" || hasPlannerState) {
      return getPlannerEditResponse(session, trimmed);
    }

    if (session.mode === "scratch" && session.briefStatus !== "canvas_open") {
      return getScratchCollectionResponse(session, trimmed);
    }

    return {
      assistantMessage: buildAssistantMessage("Share your event details and I'll help shape the plan.")
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
      viewMode: "chat_only",
      briefStatus: "collecting",
      messages: []
    };
  },

  seedSessions(): PlannerSession[] {
    return [];
  },

  retitleSessionFromFirstMessage(session: PlannerSession, firstUserText: string): PlannerSession {
    return {
      ...session,
      title: retitleFromText(firstUserText)
    };
  },

  async approveLayout(): Promise<void> {
    return;
  }
};
