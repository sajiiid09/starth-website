import { clearAuthTokens, getAccessToken, getCsrfToken } from "./authStorage";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
const CSRF_PROTECTED_METHODS: HttpMethod[] = ["POST", "PUT", "PATCH", "DELETE"];

export type NormalizedApiError = {
  message: string;
  status: number;
  details?: unknown;
};

export type RequestOptions = {
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
};

export class HttpClientError extends Error {
  status: number;
  details?: unknown;
  response?: {
    status: number;
    data?: unknown;
  };

  constructor({ message, status, details }: NormalizedApiError) {
    super(message);
    this.name = "HttpClientError";
    this.status = status;
    this.details = details;
    this.response = {
      status,
      data: details
    };
  }
}

const DEFAULT_API_BASE_URL = "http://localhost:8000";
const AUTH_REDIRECT_PATH = "/appentry";
export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";
const LOGIN_ROUTE_PATTERNS = [/^\/appentry(\/|$)/, /^\/app-entry(\/|$)/, /^\/signin(\/|$)/, /^\/login(\/|$)/];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

let hasRedirectedForUnauthorized = false;

const resolveApiBaseUrl = (rawBaseUrl: string): URL | null => {
  const baseUrl = rawBaseUrl.trim();

  if (!baseUrl) {
    return null;
  }

  try {
    const parsed = new URL(baseUrl);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed;
    }
  } catch {
    // Fall through to relative handling.
  }

  if (typeof window !== "undefined" && baseUrl.startsWith("/")) {
    try {
      return new URL(baseUrl, window.location.origin);
    } catch {
      // Continue to invalid config logging.
    }
  }

  console.error(
    `[httpClient] Invalid VITE_API_BASE_URL "${rawBaseUrl}". Use an absolute URL like "https://api.example.com". Falling back to relative requests.`
  );

  return null;
};

const resolvedApiBaseUrl = resolveApiBaseUrl(API_BASE_URL);

const buildRequestUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  if (!resolvedApiBaseUrl) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  const baseForJoin = new URL(resolvedApiBaseUrl.toString());
  if (!baseForJoin.pathname.endsWith("/")) {
    baseForJoin.pathname = `${baseForJoin.pathname}/`;
  }

  return new URL(normalizedPath, baseForJoin).toString();
};

const getErrorMessage = (status: number, payload: unknown, fallback?: string) => {
  if (payload && typeof payload === "object") {
    if ("message" in payload && typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }
    if ("error" in payload && typeof payload.error === "string" && payload.error.trim()) {
      return payload.error;
    }
  }
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }
  if (fallback) {
    return fallback;
  }
  return `Request failed with status ${status}`;
};

const toError = (status: number, payload: unknown, fallbackMessage?: string): HttpClientError => {
  const details = payload ?? undefined;
  const message =
    getErrorMessage(status, details, fallbackMessage);

  return new HttpClientError({
    message,
    status,
    details
  });
};

const parseResponsePayload = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text || null;
  } catch {
    return null;
  }
};

const handleUnauthorized = () => {
  clearAuthTokens();

  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(AUTH_UNAUTHORIZED_EVENT, {
      detail: { reason: "http_401" }
    })
  );

  const isOnLoginRoute = LOGIN_ROUTE_PATTERNS.some((pattern) =>
    pattern.test(window.location.pathname)
  );
  if (isOnLoginRoute || hasRedirectedForUnauthorized) {
    return;
  }

  hasRedirectedForUnauthorized = true;
  window.location.assign(AUTH_REDIRECT_PATH);
};

export const request = async <T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers
  };

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    if (options.auth) {
      const token = getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        if (CSRF_PROTECTED_METHODS.includes(method)) {
          const csrfToken = getCsrfToken();
          if (csrfToken) {
            headers["X-CSRF-Token"] = csrfToken;
          }
        }
      }
    }

    response = await fetch(buildRequestUrl(path), {
      method,
      credentials: "include",
      headers,
      body:
        options.body === undefined
          ? undefined
          : options.body instanceof FormData
            ? options.body
            : JSON.stringify(options.body)
    });
  } catch (error) {
    throw new HttpClientError({
      message: error instanceof Error ? error.message : "Network request failed",
      status: 0
    });
  }

  const payload = await parseResponsePayload(response);

  if (response.status === 401) {
    handleUnauthorized();
  }
  if (!response.ok) {
    throw toError(response.status, payload, response.statusText || undefined);
  }

  return payload as T;
};
