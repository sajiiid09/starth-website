type PendingPlannerIntent = {
  prompt: string;
  returnPath: string;
  source?: "home" | "ai-planner";
};

const PENDING_PLANNER_INTENT_KEY = "pendingPlannerIntent";

export const setPendingPlannerIntent = (intent: PendingPlannerIntent) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(PENDING_PLANNER_INTENT_KEY, JSON.stringify(intent));
};

export const getPendingPlannerIntent = (): PendingPlannerIntent | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.sessionStorage.getItem(PENDING_PLANNER_INTENT_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as PendingPlannerIntent;
  } catch (error) {
    console.error("Failed to parse pending planner intent:", error);
    return null;
  }
};

export const clearPendingPlannerIntent = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(PENDING_PLANNER_INTENT_KEY);
};
