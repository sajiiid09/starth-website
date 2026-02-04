import { z } from "zod";
import { PlannerSession, PlannerState } from "@/features/planner/types";

export const zChatMessage = z.object({
  id: z.string().min(1),
  role: z.enum(["user", "assistant", "system"]),
  text: z.string(),
  createdAt: z.number(),
  status: z.enum(["thinking", "orchestrating", "final"]).optional()
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

export const zDraftBrief = z.object({
  eventType: z.string().min(1).optional(),
  guestCount: z.number().positive().optional(),
  budget: z.number().positive().optional(),
  city: z.string().min(1).optional(),
  dateRange: z.string().min(1).optional()
});

export const zPlannerSession = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  createdAt: z.number(),
  updatedAt: z.number(),
  mode: z.enum(["scratch", "template"]),
  briefStatus: z.enum(["collecting", "ready_to_generate", "generating", "generated"]),
  canvasState: z.enum(["hidden", "visible"]),
  draftBrief: zDraftBrief.optional(),
  lastAskedField: z.enum(["eventType", "guestCount", "budget", "city", "dateRange"]).optional(),
  plannerStateUpdatedAt: z.number().optional(),
  messages: z.array(zChatMessage),
  plannerState: zPlannerState.optional()
});

export const zPlannerSessionsPayload = z.object({
  version: z.literal(4),
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
