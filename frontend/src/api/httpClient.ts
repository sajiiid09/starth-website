export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

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

  constructor({ message, status, details }: NormalizedApiError) {
    super(message);
    this.name = "HttpClientError";
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const normalizePath = (path: string) => {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("authToken");
};

const toError = (status: number, payload: unknown): HttpClientError => {
  const details = payload;
  const message =
    details && typeof details === "object" && "message" in details && typeof details.message === "string"
      ? details.message
      : typeof payload === "string"
        ? payload
      : `Request failed with status ${status}`;

  return new HttpClientError({
    message,
    status,
    details
  });
};

export const request = async <T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers
  };

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (options.auth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(normalizePath(path), {
      method,
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

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = response.status === 204 ? null : isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw toError(response.status, payload);
  }

  return payload as T;
};
