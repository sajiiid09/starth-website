const ACCESS_TOKEN_KEY = "authToken";
const LEGACY_ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const CSRF_TOKEN_KEY = "csrfToken";

const canUseStorage = () => typeof window !== "undefined";

export const getAccessToken = (): string | null => {
  if (!canUseStorage()) {
    return null;
  }

  return (
    window.localStorage.getItem(ACCESS_TOKEN_KEY) ??
    window.localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY)
  );
};

export const setAccessToken = (token: string) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  // Keep legacy key in sync for callers that still read this key directly.
  window.localStorage.setItem(LEGACY_ACCESS_TOKEN_KEY, token);
};

export const getRefreshToken = (): string | null => {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const getCsrfToken = (): string | null => {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(CSRF_TOKEN_KEY);
};

export const setCsrfToken = (token: string) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(CSRF_TOKEN_KEY, token);
};

export const clearAuthTokens = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(CSRF_TOKEN_KEY);
};
