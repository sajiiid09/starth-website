const ACCESS_TOKEN_KEY = "authToken";
const LEGACY_ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const CSRF_TOKEN_KEY = "csrfToken";

const canUseStorage = () => typeof window !== "undefined";
let accessTokenMemory: string | null = null;
let refreshTokenMemory: string | null = null;

export const getAccessToken = (): string | null => {
  return accessTokenMemory;
};

export const setAccessToken = (token: string) => {
  // Access tokens are now expected in HttpOnly cookies. Keep an in-memory value
  // only for legacy fallback inside the current tab/session.
  accessTokenMemory = token;
};

export const getRefreshToken = (): string | null => {
  return refreshTokenMemory;
};

export const setRefreshToken = (token: string) => {
  // Refresh tokens are now expected in HttpOnly cookies.
  refreshTokenMemory = token;
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
  accessTokenMemory = null;
  refreshTokenMemory = null;
  if (!canUseStorage()) {
    return;
  }

  // Cleanup legacy persisted tokens from pre-cookie auth flows.
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(CSRF_TOKEN_KEY);
};
