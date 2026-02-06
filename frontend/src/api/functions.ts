import { request } from "./httpClient";
import { setAccessToken, setRefreshToken } from "./authStorage";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AuthLoginResponse = {
  success: boolean;
  user: { roles?: string[] };
  access_token?: string;
  refresh_token?: string;
};

type AuthRegisterResponse = {
  success: boolean;
  user?: unknown;
  access_token?: string;
  refresh_token?: string;
};

// ---------------------------------------------------------------------------
// Auth functions
// ---------------------------------------------------------------------------

export async function authLogin(
  ...args: unknown[]
): Promise<{ data: AuthLoginResponse }> {
  const payload = args[0] ?? {};
  const data = await request<AuthLoginResponse>("POST", "/api/auth/login", {
    body: payload,
  });
  // Persist tokens so httpClient attaches them to subsequent requests
  if (data.access_token) {
    setAccessToken(data.access_token);
  }
  if (data.refresh_token) {
    setRefreshToken(data.refresh_token);
  }
  return { data };
}

export async function authRegister(
  ...args: unknown[]
): Promise<{ data: AuthRegisterResponse }> {
  const payload = args[0] ?? {};
  const data = await request<AuthRegisterResponse>("POST", "/api/auth/register", {
    body: payload,
  });
  // Persist tokens so the user is immediately logged in after registration
  if (data.access_token) {
    setAccessToken(data.access_token);
  }
  if (data.refresh_token) {
    setRefreshToken(data.refresh_token);
  }
  return { data };
}

// ---------------------------------------------------------------------------
// Email / password management
// ---------------------------------------------------------------------------

export async function verifyEmail(
  ...args: unknown[]
): Promise<{ data: { success: boolean; already_verified?: boolean; message?: string; email?: string } }> {
  const payload = args[0] ?? {};
  const data = await request<{ success: boolean; already_verified?: boolean; message?: string; email?: string }>(
    "POST",
    "/api/auth/verify-email",
    { body: payload }
  );
  return { data };
}

export async function forgotPassword(
  ...args: unknown[]
): Promise<{ data: { success: boolean } }> {
  const payload = args[0] ?? {};
  const data = await request<{ success: boolean }>(
    "POST",
    "/api/auth/forgot-password",
    { body: payload }
  );
  return { data };
}

export async function resetPassword(
  ...args: unknown[]
): Promise<{ data: { success: boolean } }> {
  const payload = args[0] ?? {};
  const data = await request<{ success: boolean }>(
    "POST",
    "/api/auth/reset-password",
    { body: payload }
  );
  return { data };
}

// ---------------------------------------------------------------------------
// Planner / AI functions (delegated to backend)
// ---------------------------------------------------------------------------

export async function generateEventPlan(
  ...args: unknown[]
): Promise<{ data: { plan: unknown; success: boolean } }> {
  const payload = args[0] ?? {};
  const data = await request<{ plan: unknown; success: boolean }>(
    "POST",
    "/api/planner/generate",
    { body: payload, auth: true }
  );
  return { data };
}

// ---------------------------------------------------------------------------
// Google Places (delegated to backend)
// ---------------------------------------------------------------------------

export async function getGooglePlacePhotos(
  ...args: unknown[]
): Promise<{ data: { photos: unknown[] } }> {
  const payload = args[0] ?? {};
  const data = await request<{ photos: unknown[] }>(
    "POST",
    "/api/integrations/google-place-photos",
    { body: payload, auth: true }
  );
  return { data };
}

// ---------------------------------------------------------------------------
// Plan sharing
// ---------------------------------------------------------------------------

export async function sharePlan(
  ...args: unknown[]
): Promise<{ data: { success: boolean } }> {
  const payload = args[0] ?? {};
  const data = await request<{ success: boolean }>(
    "POST",
    "/api/plans/share",
    { body: payload, auth: true }
  );
  return { data };
}
