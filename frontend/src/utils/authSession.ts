const CURRENT_USER_KEY = "currentUser";

type StoredUser = {
  id?: string;
  roles?: string[];
};

export const getStoredUser = (): StoredUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.sessionStorage.getItem(CURRENT_USER_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as StoredUser;
  } catch (error) {
    console.error("Failed to parse current user from session storage:", error);
    return null;
  }
};

export const isAuthenticated = () => Boolean(getStoredUser());
