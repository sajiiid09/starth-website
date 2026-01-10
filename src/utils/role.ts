export type AppRole = "user" | "vendor" | "admin";

const ROLE_STORAGE_KEY = "activeRole";

const storageToRole: Record<string, AppRole> = {
  organizer: "user",
  service_provider: "vendor",
  admin: "admin",
  user: "user",
  vendor: "vendor"
};

const roleToStorage: Record<AppRole, string> = {
  user: "organizer",
  vendor: "service_provider",
  admin: "admin"
};

export const getCurrentRole = (): AppRole | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const storedRole = window.localStorage.getItem(ROLE_STORAGE_KEY);
  if (!storedRole) {
    return null;
  }
  return storageToRole[storedRole] ?? null;
};

export const setCurrentRole = (role: AppRole) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(ROLE_STORAGE_KEY, roleToStorage[role]);
};

export const clearRole = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(ROLE_STORAGE_KEY);
};

export const getRoleHomePath = (role: AppRole) => {
  if (role === "admin") {
    return "/admin";
  }
  if (role === "vendor") {
    return "/vendor";
  }
  return "/dashboard";
};
