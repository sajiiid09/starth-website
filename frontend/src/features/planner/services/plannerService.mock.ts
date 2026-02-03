import { assertValidPlannerState } from "@/features/planner/schemas";
import {
  MatchItem,
  MatchesState,
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

const templateThumbs = {
  launch:
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=600",
  offsite:
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=600",
  evening:
    "https://images.unsplash.com/photo-1561489413-985b06da5bee?auto=format&fit=crop&q=80&w=600"
};

const marketplaceThumbs = {
  venue:
    "https://images.unsplash.com/photo-1519671482502-9759101d4561?auto=format&fit=crop&q=80&w=600",
  catering:
    "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=600",
  av:
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=600"
};

const createBaseMatches = (): MatchesState => ({
  activeTab: "templates",
  templates: [
    {
      id: "template-launch-core",
      type: "template",
      title: "Launch Night Control Room",
      description: "Structured launch format with timed reveals and stage transitions.",
      imageUrl: templateThumbs.launch
    },
    {
      id: "template-executive-offsite",
      type: "template",
      title: "Executive Offsite Sequence",
      description: "Two-day agenda framework with networking and breakout choreography.",
      imageUrl: templateThumbs.offsite
    },
    {
      id: "template-brand-evening",
      type: "template",
      title: "Brand Evening Arc",
      description: "Premium guest journey from arrival through closing storytelling moment.",
      imageUrl: templateThumbs.evening
    }
  ],
  marketplace: [
    {
      id: "market-harbor-loft",
      type: "marketplace",
      title: "Harbor Loft",
      description: "Waterfront venue with modular staging and hospitality support.",
      imageUrl: marketplaceThumbs.venue
    },
    {
      id: "market-northline-catering",
      type: "marketplace",
      title: "Northline Catering Studio",
      description: "Culinary partner with plated and roaming menu options.",
      imageUrl: marketplaceThumbs.catering
    },
    {
      id: "market-summit-av",
      type: "marketplace",
      title: "Summit AV Collective",
      description: "AV and production partner for hybrid and in-room experiences.",
      imageUrl: marketplaceThumbs.av
    }
  ]
});

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

const updateMatchesForContext = (base: MatchesState, userText: string): MatchesState => {
  const location = guessLocation(userText);
  if (!location) {
    return base;
  }

  const relabel = (items: MatchItem[]) =>
    items.map((item) => ({
      ...item,
      description: `${item.description} Shortlisted for ${location}.`
    }));

  return {
    ...base,
    templates: [
      {
        id: `template-${location.toLowerCase().replace(/\s+/g, "-")}-signal`,
        type: "template",
        title: `${location} Signature Flow`,
        description:
          "Local market pacing template tuned for arrival velocity, networking cadence, and premium close.",
        imageUrl: templateThumbs.launch
      },
      ...relabel(base.templates).slice(0, 4)
    ].slice(0, 5),
    marketplace: [
      {
        id: `market-${location.toLowerCase().replace(/\s+/g, "-")}-collective`,
        type: "marketplace",
        title: `${location} Venue Collective`,
        description:
          "High-fit local shortlist combining flexible floorplans with experienced guest operations teams.",
        imageUrl: marketplaceThumbs.venue
      },
      ...relabel(base.marketplace).slice(0, 4)
    ].slice(0, 5),
  };
};

const createSeedSessions = (): PlannerSession[] => {
  const now = Date.now();
  const sharedMatches = createBaseMatches();

  return [
    {
      id: "seed-product-launch",
      title: "Product Launch Plan",
      createdAt: now - 1000 * 60 * 60 * 36,
      updatedAt: now - 1000 * 60 * 15,
      messages: [
        {
          id: "seed-msg-1",
          role: "assistant",
          text: "Welcome back. We can tighten your launch timeline and venue shortlist.",
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
      matches: sharedMatches,
      plannerState: buildPlannerStateDraft(
        {
          id: "seed-state-source",
          title: "source",
          createdAt: now,
          updatedAt: now,
          messages: [
            {
              id: "seed-state-user",
              role: "user",
              text: "Plan a 140 guest product launch in SF with $30k budget.",
              createdAt: now
            }
          ],
          matches: sharedMatches
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
      messages: [],
      matches: createBaseMatches()
    },
    {
      id: "seed-brand-evening",
      title: "Brand Evening Blueprint",
      createdAt: now - 1000 * 60 * 60 * 110,
      updatedAt: now - 1000 * 60 * 60 * 22,
      messages: [],
      matches: createBaseMatches()
    },
    {
      id: "seed-roadshow-nyc",
      title: "Roadshow NYC",
      createdAt: now - 1000 * 60 * 60 * 140,
      updatedAt: now - 1000 * 60 * 60 * 30,
      messages: [],
      matches: createBaseMatches()
    },
    {
      id: "seed-board-retreat",
      title: "Board Retreat",
      createdAt: now - 1000 * 60 * 60 * 190,
      updatedAt: now - 1000 * 60 * 60 * 60,
      messages: [],
      matches: createBaseMatches()
    },
    {
      id: "seed-holiday-gala",
      title: "Holiday Gala Draft",
      createdAt: now - 1000 * 60 * 60 * 220,
      updatedAt: now - 1000 * 60 * 60 * 90,
      messages: [],
      matches: createBaseMatches()
    }
  ];
};

export const plannerServiceMock: PlannerService = {
  async sendMessage(session, userText) {
    await delay(520);

    const trimmedText = userText.trim();
    const userTurnCount = session.messages.filter((message) => message.role === "user").length;
    const currentMatches = session.matches ?? createBaseMatches();
    let updatedMatches = updateMatchesForContext(currentMatches, trimmedText);
    let updatedPlannerState: PlannerState | undefined;
    let assistantText =
      "Great context. I can refine this into a stronger execution plan right away.";

    if (userTurnCount <= 1) {
      assistantText =
        "Great start. To calibrate correctly, what guest count, target city, and budget range should I optimize for?";
    } else if (userTurnCount === 2) {
      assistantText =
        "Perfect. Next I need your format priorities: stage-forward program, networking density, or content depth?";
    } else if (userTurnCount === 3) {
      updatedPlannerState = buildPlannerStateDraft(session, trimmedText);
      assistantText =
        "I drafted a blueprint with cost KPIs, layout inventory, and a working timeline. Review the right panel and tell me what to tighten.";
    } else {
      const existing = session.plannerState ?? buildPlannerStateDraft(session, trimmedText);
      const revision = applyPlannerIntentUpdates(existing, trimmedText);
      updatedPlannerState = revision.updatedState;
      assistantText = revision.meta.conflictDetected
        ? "I applied your changes, but the new constraints create execution pressure. I adjusted the tradeoff note and confidence so you can review the implications."
        : revision.meta.inventoryChanged
          ? "Inventory updates applied. I recalibrated cost, per-attendee spend, and execution confidence."
          : revision.meta.budgetAdjusted
            ? "Budget constraints are now reflected in the simulation, including a refreshed tradeoff note and spend mix."
            : revision.meta.guestCountChanged
              ? "Guest count update applied. Capacity assumptions and KPI efficiency are now aligned."
              : "Updated the draft to reflect your latest guidance. Want me to prepare this for review status?";
    }

    return {
      assistantMessage: {
        id: nextId("assistant"),
        role: "assistant",
        text: assistantText,
        status: "final",
        createdAt: Date.now()
      },
      updatedPlannerState,
      updatedMatches
    };
  },

  createNewSession() {
    const now = Date.now();
    return {
      id: nextId("session"),
      title: "New plan",
      createdAt: now,
      updatedAt: now,
      messages: [],
      matches: createBaseMatches()
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
