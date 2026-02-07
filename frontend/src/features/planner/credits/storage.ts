import { CreditsConfig, CreditsStoragePayload } from "@/features/planner/credits/types";

export const CREDITS_STORAGE_KEY = "strathwell_credits_v1";
export const CREDITS_STORAGE_VERSION = 1 as const;
const FALLBACK_DEFAULT_CREDITS = 120;
const FALLBACK_CREDITS_PER_MESSAGE = 1;

const toPositiveInt = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.round(parsed));
};

const parseBooleanFlag = (raw: unknown, fallback: boolean) => {
  if (raw === undefined || raw === null) return fallback;
  const normalized = String(raw).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
};

export const getCreditsConfig = (): CreditsConfig => {
  const isEnabled = parseBooleanFlag(import.meta.env.VITE_ENABLE_CREDITS_UI, true);
  const defaultCredits = toPositiveInt(
    import.meta.env.VITE_DEFAULT_CREDITS,
    FALLBACK_DEFAULT_CREDITS
  );
  const creditsPerMessage = toPositiveInt(
    import.meta.env.VITE_CREDITS_PER_MESSAGE,
    FALLBACK_CREDITS_PER_MESSAGE
  );

  return {
    isEnabled,
    defaultCredits,
    creditsPerMessage
  };
};

export const loadCredits = (defaultCredits: number) => {
  try {
    const raw = window.localStorage.getItem(CREDITS_STORAGE_KEY);
    if (!raw) return defaultCredits;

    const parsed = JSON.parse(raw) as Partial<CreditsStoragePayload>;
    if (parsed.version !== CREDITS_STORAGE_VERSION) return defaultCredits;
    if (typeof parsed.credits !== "number" || !Number.isFinite(parsed.credits)) {
      return defaultCredits;
    }

    return Math.max(0, Math.round(parsed.credits));
  } catch (error) {
    console.warn("Failed to load credits state:", error);
    return defaultCredits;
  }
};

export const saveCredits = (credits: number) => {
  try {
    const payload: CreditsStoragePayload = {
      version: CREDITS_STORAGE_VERSION,
      credits: Math.max(0, Math.round(credits)),
      updatedAt: Date.now()
    };
    window.localStorage.setItem(CREDITS_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Failed to save credits state:", error);
  }
};

export const clearCredits = () => {
  try {
    window.localStorage.removeItem(CREDITS_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear credits state:", error);
  }
};
