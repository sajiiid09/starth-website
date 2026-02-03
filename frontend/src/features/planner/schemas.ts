import { z } from "zod";
import { PlannerSession, PlannerState } from "@/features/planner/types";

export const zChatMessage = z.object({
  id: z.string().min(1),
  role: z.enum(["user", "assistant", "system"]),
  text: z.string(),
  createdAt: z.number(),
  status: z.enum(["thinking", "orchestrating", "final"]).optional()
});

export const zMatchItem = z.object({
  id: z.string().min(1),
  type: z.enum(["template", "marketplace"]),
  title: z.string().min(1),
  description: z.string(),
  imageUrl: z.string().url().optional()
});

export const zMatchesState = z.object({
  activeTab: z.enum(["templates", "marketplace"]),
  templates: z.array(zMatchItem),
  marketplace: z.array(zMatchItem)
});

export const zPlannerState = z.object({
  blueprintId: z.string().min(1),
  title: z.string().min(1),
  summary: z.string(),
  kpis: z.object({
    totalCost: z.number(),
    costPerAttendee: z.number(),
    confidencePct: z.number().min(0).max(100)
  }),
  spacePlan: z.object({
    beforeLabel: z.string(),
    afterLabel: z.string(),
    inventory: z.object({
      chairs: z.number(),
      tables: z.number(),
      stage: z.number(),
      buffet: z.number()
    })
  }),
  timeline: z.array(
    z.object({
      time: z.string(),
      title: z.string(),
      notes: z.string()
    })
  ),
  budget: z.object({
    total: z.number(),
    breakdown: z.array(
      z.object({
        label: z.string(),
        pct: z.number()
      })
    ),
    tradeoffNote: z.string().optional()
  }),
  status: z.enum(["draft", "ready_for_review", "approved"])
});

export const zPlannerSession = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  createdAt: z.number(),
  updatedAt: z.number(),
  plannerStateUpdatedAt: z.number().optional(),
  messages: z.array(zChatMessage),
  matches: zMatchesState,
  plannerState: zPlannerState.optional()
});

export const zPlannerSessionsPayload = z.object({
  version: z.literal(2),
  activeSessionId: z.string().nullable(),
  sessions: z.array(zPlannerSession)
});

export const safeParsePlannerSession = (input: unknown) => zPlannerSession.safeParse(input);
export const safeParsePlannerSessionsPayload = (input: unknown) =>
  zPlannerSessionsPayload.safeParse(input);

export const assertValidPlannerState = (input: unknown): PlannerState => {
  const parsed = zPlannerState.safeParse(input);
  if (parsed.success) {
    return parsed.data;
  }

  const issues = parsed.error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "root";
    return `${path}: ${issue.message}`;
  });
  throw new Error(`Invalid planner state: ${issues.join("; ")}`);
};

export const assertValidPlannerSession = (input: unknown): PlannerSession => {
  const parsed = zPlannerSession.safeParse(input);
  if (parsed.success) {
    return parsed.data;
  }

  const issues = parsed.error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "root";
    return `${path}: ${issue.message}`;
  });
  throw new Error(`Invalid planner session: ${issues.join("; ")}`);
};
