export type VendorType = "venue_owner" | "service_provider";

export type VendorOnboardingStatus =
  | "draft"
  | "submitted"
  | "pending"
  | "needs_changes"
  | "approved";

export type SessionState = {
  role: "organizer" | "vendor" | "admin";
  vendorType: VendorType | null;
  vendorOnboardingStatus: VendorOnboardingStatus;
  vendorProfileDraft: Record<string, unknown>;
};

const SESSION_STORAGE_KEY = "starth_session_state";

const defaultSession: SessionState = {
  role: "organizer",
  vendorType: null,
  vendorOnboardingStatus: "draft",
  vendorProfileDraft: {}
};

const readSession = (): SessionState => {
  if (typeof window === "undefined") {
    return defaultSession;
  }
  const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!stored) {
    return defaultSession;
  }
  try {
    return { ...defaultSession, ...JSON.parse(stored) } as SessionState;
  } catch (error) {
    console.error("Failed to parse session state:", error);
    return defaultSession;
  }
};

const writeSession = (nextSession: SessionState) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
};

export const getSessionState = () => readSession();

export const updateSessionState = (partial: Partial<SessionState>) => {
  const nextSession = { ...readSession(), ...partial };
  writeSession(nextSession);
  return nextSession;
};

export const setVendorType = (vendorType: VendorType | null) =>
  updateSessionState({ vendorType });

export const setVendorOnboardingStatus = (status: VendorOnboardingStatus) =>
  updateSessionState({ vendorOnboardingStatus: status });

export const updateVendorProfileDraft = (draft: Record<string, unknown>) =>
  updateSessionState({ vendorProfileDraft: draft });

export const resetVendorSession = () =>
  writeSession({ ...defaultSession, role: "vendor" });

export const getVendorOnboardingPath = (vendorType: VendorType | null) =>
  vendorType === "venue_owner"
    ? "/vendor/onboarding/venue"
    : vendorType === "service_provider"
      ? "/vendor/onboarding/service"
      : "/vendor/onboarding/select";
