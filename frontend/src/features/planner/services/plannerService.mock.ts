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

const createBaseMatches = (): MatchesState => ({
  activeTab: "templates",
  templates: [
    {
      id: "template-launch-core",
      type: "template",
      title: "Launch Night Control Room",
      description: "Structured launch format with timed reveals and stage transitions."
    },
    {
      id: "template-executive-offsite",
      type: "template",
      title: "Executive Offsite Sequence",
      description: "Two-day agenda framework with networking and breakout choreography."
    },
    {
      id: "template-brand-evening",
      type: "template",
      title: "Brand Evening Arc",
      description: "Premium guest journey from arrival through closing storytelling moment."
    }
  ],
  marketplace: [
    {
      id: "market-harbor-loft",
      type: "marketplace",
      title: "Harbor Loft",
      description: "Waterfront venue with modular staging and hospitality support."
    },
    {
      id: "market-northline-catering",
      type: "marketplace",
      title: "Northline Catering Studio",
      description: "Culinary partner with plated and roaming menu options."
    },
    {
      id: "market-summit-av",
      type: "marketplace",
      title: "Summit AV Collective",
      description: "AV and production partner for hybrid and in-room experiences."
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

const recalculateKpisFromInventory = (
  inventory: PlannerState["spacePlan"]["inventory"],
  existingBudgetTotal?: number | null
) => {
  const inventoryCost =
    inventory.chairs * 28 +
    inventory.tables * 130 +
    inventory.stage * 3800 +
    inventory.buffet * 950;

  const totalCost = Math.max(existingBudgetTotal ?? 0, Math.round(inventoryCost * 2.6));
  const attendees = Math.max(60, Math.round(inventory.chairs * 0.8));
  return {
    totalCost,
    costPerAttendee: Math.round(totalCost / attendees),
    confidencePct: 74
  };
};

const buildPlannerStateDraft = (session: PlannerSession, userText: string): PlannerState => {
  const mergedText = `${session.messages
    .filter((message) => message.role === "user")
    .map((message) => message.text)
    .join(" ")} ${userText}`;
  const budgetMention = extractBudget(mergedText);
  const inventoryUpdates = extractInventoryUpdates(mergedText);
  const location = guessLocation(mergedText) ?? "your target city";

  const inventory = {
    chairs: inventoryUpdates.chairs ?? 160,
    tables: inventoryUpdates.tables ?? 24,
    stage: inventoryUpdates.stage ?? 1,
    buffet: inventoryUpdates.buffet ?? 4
  };

  const kpis = recalculateKpisFromInventory(inventory, budgetMention);

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

const updatePlannerStateInventory = (
  state: PlannerState,
  userText: string
): PlannerState | null => {
  const inventoryUpdates = extractInventoryUpdates(userText);
  const hasUpdate = Object.values(inventoryUpdates).some((value) => value !== null);
  if (!hasUpdate) return null;

  const nextInventory = {
    chairs: inventoryUpdates.chairs ?? state.spacePlan.inventory.chairs,
    tables: inventoryUpdates.tables ?? state.spacePlan.inventory.tables,
    stage: inventoryUpdates.stage ?? state.spacePlan.inventory.stage,
    buffet: inventoryUpdates.buffet ?? state.spacePlan.inventory.buffet
  };

  const budgetHint = extractBudget(userText) ?? state.budget.total;
  const nextKpis = recalculateKpisFromInventory(nextInventory, budgetHint);

  return assertValidPlannerState({
    ...state,
    summary:
      "Blueprint updated with revised inventory assumptions from your latest instruction.",
    kpis: nextKpis,
    spacePlan: {
      ...state.spacePlan,
      inventory: nextInventory
    },
    budget: {
      ...state.budget,
      total: nextKpis.totalCost,
      tradeoffNote:
        "Inventory increases raise staging and service effort; balance with simplified decor if needed."
    }
  });
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
    templates: relabel(base.templates),
    marketplace: relabel(base.marketplace)
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
      )
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
      const revised = updatePlannerStateInventory(existing, trimmedText);
      updatedPlannerState = revised ?? existing;
      assistantText = revised
        ? "Applied your inventory update and rebalanced projected cost. I also adjusted the blueprint confidence."
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
