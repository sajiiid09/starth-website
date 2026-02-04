import { assertValidPlannerState } from "@/features/planner/schemas";
import {
  DraftBrief,
  DraftBriefField,
  PlannerService,
  PlannerSession,
  PlannerState
} from "@/features/planner/types";

let idCounter = 0;
const nextId = (prefix: string) => {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
};

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const REQUIRED_BRIEF_FIELDS: DraftBriefField[] = [
  "eventType",
  "guestCount",
  "budget",
  "city",
  "dateRange"
];

const BRIEF_FIELD_QUESTIONS: Record<DraftBriefField, string> = {
  eventType: "What kind of event are we planning?",
  guestCount: "How many guests are you expecting?",
  budget: "What's your budget range?",
  city: "Which city is this in?",
  dateRange: "When is the event (date or month)?"
};

const retitleFromText = (text: string) => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "New plan";
  const title = normalized.split(" ").slice(0, 5).join(" ");
  return title.length > 52 ? `${title.slice(0, 49)}...` : title;
};

const extractBudget = (text: string) => {
  const budgetKMatch = text.match(/\$?\s*(\d+(?:\.\d+)?)\s*k\b/i);
  if (budgetKMatch) {
    return Math.round(Number(budgetKMatch[1]) * 1000);
  }

  const budgetMatch = text.match(/\$?\s*(\d{4,7})\b/);
  if (budgetMatch) {
    return Number(budgetMatch[1]);
  }

  return null;
};

const extractGuestCount = (text: string) =>
  extractValue(text, /(\d+)\s*(?:guests?|attendees?|people|pax)\b/i);

const extractValue = (text: string, pattern: RegExp) => {
  const match = text.match(pattern);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
};

const extractInventoryUpdates = (text: string) => {
  const chairs = extractValue(text, /(\d+)\s*(?:chairs?|seats?)/i);
  const tables = extractValue(text, /(\d+)\s*(?:tables?)/i);
  const stage = extractValue(text, /(\d+)\s*(?:stages?)/i);
  const buffet = extractValue(text, /(\d+)\s*(?:buffets?|stations?)/i);
  return { chairs, tables, stage, buffet };
};

const guessLocation = (text: string) => {
  const knownLocations = ["sf", "san francisco", "austin", "nyc", "new york", "chicago", "la"];
  const lower = text.toLowerCase();
  const found = knownLocations.find((value) => lower.includes(value));
  if (!found) return null;
  if (found === "sf") return "San Francisco";
  if (found === "nyc") return "New York City";
  if (found === "la") return "Los Angeles";
  return found
    .split(" ")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const recalculateKpisFromInventory = (
  inventory: PlannerState["spacePlan"]["inventory"],
  existingBudgetTotal?: number | null,
  attendeeHint?: number | null
) => {
  const inventoryCost =
    inventory.chairs * 28 +
    inventory.tables * 130 +
    inventory.stage * 3800 +
    inventory.buffet * 950;
  const attendees = Math.max(60, attendeeHint ?? Math.round(inventory.chairs * 0.8));
  const baselineCost = Math.round(inventoryCost * 2.2 + attendees * 110);
  const totalCost = Math.max(existingBudgetTotal ?? 0, baselineCost);
  return {
    totalCost,
    costPerAttendee: Math.round(totalCost / attendees),
    confidencePct: 72
  };
};

const buildPlannerStateDraft = (session: PlannerSession, userText: string): PlannerState => {
  const mergedText = `${session.messages
    .filter((message) => message.role === "user")
    .map((message) => message.text)
    .join(" ")} ${userText}`;
  const budgetMention = extractBudget(mergedText);
  const guestCountMention = extractGuestCount(mergedText);
  const inventoryUpdates = extractInventoryUpdates(mergedText);
  const location = guessLocation(mergedText) ?? "your target city";

  const inferredChairs =
    guestCountMention && guestCountMention > 0
      ? Math.max(guestCountMention, Math.round(guestCountMention * 1.05))
      : 160;
  const inventory = {
    chairs: inventoryUpdates.chairs ?? inferredChairs,
    tables: inventoryUpdates.tables ?? Math.max(12, Math.round((inventoryUpdates.chairs ?? inferredChairs) / 8)),
    stage: inventoryUpdates.stage ?? 1,
    buffet: inventoryUpdates.buffet ?? 4
  };

  const kpis = recalculateKpisFromInventory(inventory, budgetMention, guestCountMention);

  return assertValidPlannerState({
    blueprintId: nextId("bp"),
    title: "Event Blueprint Draft",
    summary: `Draft operating plan tailored for ${location}, with staffing and production priorities aligned to your brief.`,
    kpis,
    spacePlan: {
      beforeLabel: "Base floor plan",
      afterLabel: "Optimized event layout",
      inventory
    },
    timeline: [
      {
        time: "T-6 weeks",
        title: "Secure venue and core vendors",
        notes: "Lock venue hold and align production partner SLA."
      },
      {
        time: "T-3 weeks",
        title: "Finalize run-of-show",
        notes: "Confirm stage cues, service timing, and staffing blocks."
      },
      {
        time: "Event day",
        title: "Operate launch sequence",
        notes: "Use checkpoint cadence for arrivals, keynote, and close."
      }
    ],
    budget: {
      total: kpis.totalCost,
      breakdown: [
        { label: "Venue", pct: 38 },
        { label: "Food + Beverage", pct: 22 },
        { label: "Production", pct: 20 },
        { label: "Staffing", pct: 14 },
        { label: "Contingency", pct: 6 }
      ],
      tradeoffNote:
        "If budget pressure appears, reduce scenic build before cutting guest-facing service."
    },
    status: "draft"
  });
};

type PlannerIntentMeta = {
  inventoryChanged: boolean;
  guestCountChanged: boolean;
  budgetAdjusted: boolean;
  conflictDetected: boolean;
};

const normalizeBreakdown = (breakdown: PlannerState["budget"]["breakdown"]) => {
  const total = breakdown.reduce((sum, item) => sum + item.pct, 0);
  if (!total) return breakdown;

  const scaled = breakdown.map((item) => ({
    ...item,
    pct: Number(((item.pct / total) * 100).toFixed(1))
  }));
  const scaledTotal = scaled.reduce((sum, item) => sum + item.pct, 0);
  const drift = Number((100 - scaledTotal).toFixed(1));
  if (scaled.length > 0 && drift !== 0) {
    scaled[scaled.length - 1] = {
      ...scaled[scaled.length - 1],
      pct: Number((scaled[scaled.length - 1].pct + drift).toFixed(1))
    };
  }

  return scaled;
};

const rebalanceBreakdownForBudget = (
  breakdown: PlannerState["budget"]["breakdown"],
  budgetConstrained: boolean
) => {
  if (!budgetConstrained) return breakdown;

  const labels = breakdown.map((item) => item.label.toLowerCase());
  if (
    labels.includes("venue") &&
    labels.includes("food + beverage") &&
    labels.includes("production") &&
    labels.includes("staffing") &&
    labels.includes("contingency")
  ) {
    return [
      { label: "Venue", pct: 35 },
      { label: "Food + Beverage", pct: 23 },
      { label: "Production", pct: 16 },
      { label: "Staffing", pct: 18 },
      { label: "Contingency", pct: 8 }
    ];
  }

  return normalizeBreakdown(
    breakdown.map((item) => {
      const lowered = item.label.toLowerCase();
      if (lowered.includes("production")) return { ...item, pct: item.pct - 3 };
      if (lowered.includes("venue")) return { ...item, pct: item.pct - 2 };
      if (lowered.includes("staff")) return { ...item, pct: item.pct + 3 };
      if (lowered.includes("conting")) return { ...item, pct: item.pct + 2 };
      return item;
    })
  );
};

const applyPlannerIntentUpdates = (
  state: PlannerState,
  userText: string
): { updatedState: PlannerState; meta: PlannerIntentMeta } => {
  const inventoryUpdates = extractInventoryUpdates(userText);
  const guestCountMention = extractGuestCount(userText);
  const budgetMention = extractBudget(userText);
  const budgetConstraintRequested = /(budget|cap|under|within|limit|ceiling)/i.test(userText);
  const inventoryChanged = Object.values(inventoryUpdates).some((value) => value !== null);
  const guestCountChanged = Boolean(guestCountMention && guestCountMention > 0);
  const budgetAdjusted = Boolean(budgetConstraintRequested && budgetMention);
  if (!inventoryChanged && !guestCountChanged && !budgetAdjusted) {
    return {
      updatedState: state,
      meta: {
        inventoryChanged: false,
        guestCountChanged: false,
        budgetAdjusted: false,
        conflictDetected: false
      }
    };
  }

  const nextInventory = {
    chairs: inventoryUpdates.chairs ?? state.spacePlan.inventory.chairs,
    tables: inventoryUpdates.tables ?? state.spacePlan.inventory.tables,
    stage: inventoryUpdates.stage ?? state.spacePlan.inventory.stage,
    buffet: inventoryUpdates.buffet ?? state.spacePlan.inventory.buffet
  };

  const requiredCostFromPlan = Math.round(
    nextInventory.chairs * 26 +
      nextInventory.tables * 120 +
      nextInventory.stage * 3700 +
      nextInventory.buffet * 900 +
      (guestCountMention ?? state.spacePlan.inventory.chairs * 0.8) * 95
  );
  const targetBudget = budgetAdjusted && budgetMention ? budgetMention : state.budget.total;
  const conflictDetected =
    (budgetAdjusted && requiredCostFromPlan > targetBudget * 1.08) ||
    (guestCountMention ? nextInventory.chairs < Math.round(guestCountMention * 0.75) : false);
  const totalCost = budgetAdjusted
    ? Math.round(
        requiredCostFromPlan > targetBudget
          ? Math.max(targetBudget, requiredCostFromPlan * 0.9)
          : Math.max(requiredCostFromPlan, targetBudget * 0.96)
      )
    : Math.max(state.budget.total, requiredCostFromPlan);

  const recomputed = recalculateKpisFromInventory(
    nextInventory,
    totalCost,
    guestCountMention ?? null
  );
  const confidenceShift =
    (inventoryChanged ? 2 : 0) +
    (guestCountChanged ? 2 : 0) +
    (budgetAdjusted && !conflictDetected ? 1 : 0) -
    (conflictDetected ? 7 : 0);
  const nextConfidence = clamp(state.kpis.confidencePct + confidenceShift, 45, 95);
  const nextBreakdown = rebalanceBreakdownForBudget(state.budget.breakdown, budgetAdjusted);
  const nextTradeoffNote = budgetAdjusted
    ? conflictDetected
      ? "Budget cap is tighter than the current operating plan. Consider reducing scenic production or lowering premium food service depth."
      : "Budget target is achievable with moderate production trimming and tighter staffing windows."
    : state.budget.tradeoffNote;

  const updatedState = assertValidPlannerState({
    ...state,
    summary:
      "Blueprint updated from your latest constraints. Costs and execution confidence have been recalibrated.",
    kpis: {
      ...recomputed,
      confidencePct: nextConfidence
    },
    spacePlan: {
      ...state.spacePlan,
      inventory: nextInventory
    },
    budget: {
      ...state.budget,
      total: totalCost,
      breakdown: nextBreakdown,
      tradeoffNote: nextTradeoffNote
    }
  });

  return {
    updatedState,
    meta: {
      inventoryChanged,
      guestCountChanged,
      budgetAdjusted,
      conflictDetected
    }
  };
};

const MONTH_REGEX =
  /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(20\d{2})/i;
const MONTH_ONLY_REGEX =
  /(january|february|march|april|may|june|july|august|september|october|november|december)\b/i;
const QUARTER_REGEX = /\bq([1-4])\s*(20\d{2})\b/i;
const SEASON_REGEX = /\b(spring|summer|fall|winter)\s+(20\d{2})\b/i;
const DATE_SLASH_REGEX = /\b\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?\b/;

const EVENT_TYPE_RULES: Array<{ label: string; pattern: RegExp }> = [
  { label: "Product launch", pattern: /\bproduct\s+launch\b/i },
  { label: "Executive summit", pattern: /\bexecutive\s+summit\b/i },
  { label: "Brand evening", pattern: /\bbrand\s+evening\b/i },
  { label: "Conference", pattern: /\bconference\b/i },
  { label: "Offsite", pattern: /\boffsite\b/i },
  { label: "Retreat", pattern: /\bretreat\b/i },
  { label: "Networking event", pattern: /\bnetworking\b/i },
  { label: "Workshop", pattern: /\bworkshop\b/i },
  { label: "Gala", pattern: /\bgala\b/i }
];

const toTitleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");

const normalizeBriefString = (value: string) => value.trim().replace(/\s+/g, " ");

const extractEventType = (text: string) => {
  for (const rule of EVENT_TYPE_RULES) {
    if (rule.pattern.test(text)) return rule.label;
  }

  const generic = text.match(/\b(?:event|plan|planning)\s+(?:a|an)\s+([a-z\s-]{3,40})/i);
  if (!generic?.[1]) return null;

  const cleaned = normalizeBriefString(generic[1]).replace(/\b(in|for|with|on)\b.*$/i, "").trim();
  if (!cleaned) return null;
  return toTitleCase(cleaned);
};

const extractCity = (text: string) => {
  const known = guessLocation(text);
  if (known) return known;

  const match = text.match(/\b(?:in|at)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+){0,2})\b/i);
  if (!match?.[1]) return null;

  const candidate = normalizeBriefString(match[1]);
  if (!candidate) return null;
  if (MONTH_ONLY_REGEX.test(candidate)) return null;
  if (/\b(next|this|early|late)\b/i.test(candidate)) return null;

  return toTitleCase(candidate);
};

const extractDateRange = (text: string) => {
  const monthYear = text.match(MONTH_REGEX);
  if (monthYear) {
    return `${toTitleCase(monthYear[1])} ${monthYear[2]}`;
  }

  const quarter = text.match(QUARTER_REGEX);
  if (quarter) {
    return `Q${quarter[1]} ${quarter[2]}`;
  }

  const season = text.match(SEASON_REGEX);
  if (season) {
    return `${toTitleCase(season[1])} ${season[2]}`;
  }

  const slashDate = text.match(DATE_SLASH_REGEX);
  if (slashDate) return slashDate[0];

  const monthOnly = text.match(MONTH_ONLY_REGEX);
  if (monthOnly) {
    return toTitleCase(monthOnly[1]);
  }

  return null;
};

const extractDraftBriefFromText = (text: string): Partial<DraftBrief> => {
  const partial: Partial<DraftBrief> = {};

  const eventType = extractEventType(text);
  if (eventType) partial.eventType = eventType;

  const guestCount = extractGuestCount(text);
  if (guestCount && guestCount > 0) partial.guestCount = Math.round(guestCount);

  const budget = extractBudget(text);
  if (budget && budget > 0) partial.budget = Math.round(budget);

  const city = extractCity(text);
  if (city) partial.city = city;

  const dateRange = extractDateRange(text);
  if (dateRange) partial.dateRange = dateRange;

  return partial;
};

const coerceReplyForAskedField = (
  field: DraftBriefField,
  text: string
): Partial<DraftBrief> => {
  const normalized = normalizeBriefString(text);
  if (!normalized) return {};

  if (field === "guestCount") {
    const count = extractValue(normalized, /(\d+)/);
    return count && count > 0 ? { guestCount: Math.round(count) } : {};
  }

  if (field === "budget") {
    const budget = extractBudget(normalized);
    return budget && budget > 0 ? { budget: Math.round(budget) } : {};
  }

  if (field === "city") {
    return { city: toTitleCase(normalized.replace(/\.$/, "")) };
  }

  if (field === "dateRange") {
    const extracted = extractDateRange(normalized);
    return { dateRange: extracted ?? normalized.replace(/\.$/, "") };
  }

  return { eventType: toTitleCase(normalized.replace(/\.$/, "")) };
};

const getNextMissingBriefField = (brief: DraftBrief): DraftBriefField | null => {
  for (const field of REQUIRED_BRIEF_FIELDS) {
    const value = brief[field];
    if (value === undefined || value === null || value === "") {
      return field;
    }
  }
  return null;
};

const deriveSessionTitleFromBrief = (brief: DraftBrief) => {
  if (brief.eventType && brief.city) {
    return `${brief.eventType} - ${brief.city}`;
  }
  if (brief.eventType) return `${brief.eventType} Plan`;
  if (brief.city) return `${brief.city} Plan`;
  return "New plan";
};

const buildBlueprintFromBrief = (session: PlannerSession, brief: DraftBrief): PlannerState => {
  const summaryPrompt = `Plan a ${brief.eventType ?? "premium event"} for ${brief.guestCount ?? 150} guests in ${brief.city ?? "San Francisco"} around ${brief.dateRange ?? "next quarter"} with $${brief.budget ?? 35000} budget.`;
  const draft = buildPlannerStateDraft(session, summaryPrompt);

  return assertValidPlannerState({
    ...draft,
    title: brief.eventType ? `${brief.eventType} Blueprint` : draft.title,
    summary: `Initial draft for a ${brief.eventType ?? "premium event"} in ${brief.city ?? "your city"} (${brief.dateRange ?? "timing TBD"}) for ${brief.guestCount ?? 0} guests with a target budget of ${brief.budget ? `$${brief.budget.toLocaleString()}` : "TBD"}.`
  });
};

const ensureSessionDefaults = (session: PlannerSession): PlannerSession => {
  const hasPlannerState = Boolean(session.plannerState);

  return {
    ...session,
    mode: session.mode ?? (hasPlannerState ? "template" : "scratch"),
    briefStatus: session.briefStatus ?? (hasPlannerState ? "generated" : "collecting"),
    canvasState: session.canvasState ?? (hasPlannerState ? "visible" : "hidden")
  };
};

const createSeedSessions = (): PlannerSession[] => {
  const now = Date.now();

  return [
    {
      id: "seed-product-launch",
      title: "Product Launch Plan",
      createdAt: now - 1000 * 60 * 60 * 36,
      updatedAt: now - 1000 * 60 * 15,
      mode: "template",
      briefStatus: "generated",
      canvasState: "visible",
      draftBrief: {
        eventType: "Product launch",
        guestCount: 140,
        budget: 30000,
        city: "San Francisco",
        dateRange: "March 2026"
      },
      messages: [
        {
          id: "seed-msg-1",
          role: "assistant",
          text: "Welcome back. We can tighten your launch timeline.",
          status: "final",
          createdAt: now - 1000 * 60 * 44
        },
        {
          id: "seed-msg-2",
          role: "user",
          text: "Keep the premium format but reduce wasteful spend.",
          status: "final",
          createdAt: now - 1000 * 60 * 43
        }
      ],
      plannerState: buildPlannerStateDraft(
        {
          id: "seed-state-source",
          title: "source",
          createdAt: now,
          updatedAt: now,
          mode: "template",
          briefStatus: "generated",
          canvasState: "visible",
          messages: [
            {
              id: "seed-state-user",
              role: "user",
              text: "Plan a 140 guest product launch in SF with $30k budget.",
              createdAt: now
            }
          ]
        },
        "Plan a 140 guest product launch in SF with $30k budget."
      ),
      plannerStateUpdatedAt: now - 1000 * 60 * 5
    },
    {
      id: "seed-offsite-q2",
      title: "Offsite Q2",
      createdAt: now - 1000 * 60 * 60 * 80,
      updatedAt: now - 1000 * 60 * 60 * 7,
      mode: "scratch",
      briefStatus: "collecting",
      canvasState: "hidden",
      messages: []
    },
    {
      id: "seed-brand-evening",
      title: "Brand Evening Blueprint",
      createdAt: now - 1000 * 60 * 60 * 110,
      updatedAt: now - 1000 * 60 * 60 * 22,
      mode: "scratch",
      briefStatus: "collecting",
      canvasState: "hidden",
      messages: []
    },
    {
      id: "seed-roadshow-nyc",
      title: "Roadshow NYC",
      createdAt: now - 1000 * 60 * 60 * 140,
      updatedAt: now - 1000 * 60 * 60 * 30,
      mode: "scratch",
      briefStatus: "collecting",
      canvasState: "hidden",
      messages: []
    },
    {
      id: "seed-board-retreat",
      title: "Board Retreat",
      createdAt: now - 1000 * 60 * 60 * 190,
      updatedAt: now - 1000 * 60 * 60 * 60,
      mode: "scratch",
      briefStatus: "collecting",
      canvasState: "hidden",
      messages: []
    },
    {
      id: "seed-holiday-gala",
      title: "Holiday Gala Draft",
      createdAt: now - 1000 * 60 * 60 * 220,
      updatedAt: now - 1000 * 60 * 60 * 90,
      mode: "scratch",
      briefStatus: "collecting",
      canvasState: "hidden",
      messages: []
    }
  ];
};

const createAssistantMessage = (text: string) => ({
  id: nextId("assistant"),
  role: "assistant" as const,
  text,
  status: "final" as const,
  createdAt: Date.now()
});

export const plannerServiceMock: PlannerService = {
  async sendMessage(sessionInput, userText) {
    await delay(520);

    const session = ensureSessionDefaults(sessionInput);
    const trimmedText = userText.trim();

    if (session.mode === "scratch" && session.briefStatus !== "generated") {
      const extracted = extractDraftBriefFromText(trimmedText);
      const mergedBrief: DraftBrief = {
        ...(session.draftBrief ?? {}),
        ...extracted
      };

      if (session.lastAskedField && mergedBrief[session.lastAskedField] === undefined) {
        Object.assign(mergedBrief, coerceReplyForAskedField(session.lastAskedField, trimmedText));
      }

      const missingField = getNextMissingBriefField(mergedBrief);
      if (missingField) {
        return {
          assistantMessage: createAssistantMessage(BRIEF_FIELD_QUESTIONS[missingField]),
          updatedSession: {
            mode: "scratch",
            briefStatus: "collecting",
            canvasState: "hidden",
            draftBrief: mergedBrief,
            lastAskedField: missingField,
            title:
              session.title === "New plan"
                ? deriveSessionTitleFromBrief(mergedBrief)
                : session.title
          }
        };
      }

      const generatedPlannerState = buildBlueprintFromBrief(session, mergedBrief);
      const synthesizedTitle = deriveSessionTitleFromBrief(mergedBrief);

      return {
        assistantMessage: createAssistantMessage("Generating your blueprint..."),
        updatedSession: {
          mode: "scratch",
          briefStatus: "generating",
          canvasState: "hidden",
          draftBrief: mergedBrief,
          lastAskedField: undefined,
          title: synthesizedTitle
        },
        deferredGeneration: {
          delayMs: 820,
          plannerState: generatedPlannerState,
          assistantText:
            "Blueprint ready. I mapped your brief into the first draft. Tell me what you want to adjust.",
          sessionUpdate: {
            mode: "scratch",
            briefStatus: "generated",
            canvasState: "visible",
            draftBrief: mergedBrief,
            lastAskedField: undefined,
            title: synthesizedTitle
          }
        }
      };
    }

    const existing = session.plannerState ?? buildPlannerStateDraft(session, trimmedText);
    const revision = applyPlannerIntentUpdates(existing, trimmedText);
    const updatedPlannerState = revision.updatedState;

    const assistantText = revision.meta.conflictDetected
      ? "I applied your changes, but the new constraints create execution pressure. I adjusted the tradeoff note and confidence so you can review the implications."
      : revision.meta.inventoryChanged
        ? "Inventory updates applied. I recalibrated cost, per-attendee spend, and execution confidence."
        : revision.meta.budgetAdjusted
          ? "Budget constraints are now reflected in the simulation, including a refreshed tradeoff note and spend mix."
          : revision.meta.guestCountChanged
            ? "Guest count update applied. Capacity assumptions and KPI efficiency are now aligned."
            : "Updated the draft to reflect your latest guidance. Want me to tighten the timeline next?";

    return {
      assistantMessage: createAssistantMessage(assistantText),
      updatedPlannerState,
      updatedSession: {
        mode: session.mode,
        briefStatus: "generated",
        canvasState: "visible"
      }
    };
  },

  createNewSession() {
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

  seedSessions() {
    return createSeedSessions();
  },

  retitleSessionFromFirstMessage(session, firstUserText) {
    return {
      ...session,
      title: retitleFromText(firstUserText)
    };
  },

  async approveLayout() {
    await delay(250);
  }
};
