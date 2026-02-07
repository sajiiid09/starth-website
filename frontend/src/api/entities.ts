import { request } from "./httpClient";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EntityRecord = Record<string, any>;
type EntityQuery = Record<string, any> | undefined;

/** Standard backend response wrapper for lists. */
type ListApiResponse<T> = { success?: boolean; data: T[]; total?: number };

/** Standard backend response wrapper for single items. */
type ItemApiResponse<T> = { success?: boolean; data: T };

export type Entity<TRecord = EntityRecord> = {
  filter: (query?: EntityQuery, sort?: string, limit?: number) => Promise<TRecord[]>;
  get: (id: string) => Promise<TRecord | null>;
  create: (payload: EntityRecord) => Promise<TRecord>;
  update: (id: string, payload: EntityRecord) => Promise<TRecord>;
  delete: (id: string) => Promise<boolean>;
  search: (query?: EntityQuery) => Promise<TRecord[]>;
};

// ---------------------------------------------------------------------------
// Entity factory
// ---------------------------------------------------------------------------

/**
 * Creates a typed entity accessor that maps CRUD operations to REST endpoints.
 *
 * API contract (per entity):
 *   GET    /api/{resource}             → list / filter  (query params from `query`)
 *   GET    /api/{resource}/:id         → get single
 *   POST   /api/{resource}             → create
 *   PUT    /api/{resource}/:id         → update
 *   DELETE /api/{resource}/:id         → delete
 *   GET    /api/{resource}/search      → search  (query params from `query`)
 */
function createEntity<TRecord = EntityRecord>(resource: string): Entity<TRecord> {
  const basePath = `/api/${resource}`;

  return {
    async filter(query?: EntityQuery, sort?: string, limit?: number): Promise<TRecord[]> {
      const merged: Record<string, string> = {};
      if (query) {
        for (const [key, value] of Object.entries(query)) {
          merged[key] = typeof value === "string" ? value : JSON.stringify(value);
        }
      }
      if (sort) {
        merged._sort = sort;
      }
      if (limit !== undefined) {
        merged._limit = String(limit);
      }
      const qs = Object.keys(merged).length > 0 ? `?${new URLSearchParams(merged)}` : "";
      const response = await request<ListApiResponse<TRecord>>("GET", `${basePath}${qs}`, { auth: true });
      return response.data ?? (response as any);
    },

    async get(id: string): Promise<TRecord | null> {
      const response = await request<ItemApiResponse<TRecord>>("GET", `${basePath}/${id}`, { auth: true });
      return response.data ?? (response as any);
    },

    async create(payload: EntityRecord): Promise<TRecord> {
      const response = await request<ItemApiResponse<TRecord>>("POST", basePath, { body: payload, auth: true });
      return response.data ?? (response as any);
    },

    async update(id: string, payload: EntityRecord): Promise<TRecord> {
      const response = await request<ItemApiResponse<TRecord>>("PUT", `${basePath}/${id}`, { body: payload, auth: true });
      return response.data ?? (response as any);
    },

    async delete(id: string): Promise<boolean> {
      await request<void>("DELETE", `${basePath}/${id}`, { auth: true });
      return true;
    },

    async search(query?: EntityQuery): Promise<TRecord[]> {
      const params = query ? `?${new URLSearchParams(query as Record<string, string>)}` : "";
      const response = await request<ListApiResponse<TRecord>>("GET", `${basePath}/search${params}`, { auth: true });
      return response.data ?? (response as any);
    },
  };
}

// ---------------------------------------------------------------------------
// Entity exports
// ---------------------------------------------------------------------------
// Each entity maps to a pluralized REST resource path.
// Consumer code continues to use: Venue.filter(), Event.create(), etc.

export const Venue = createEntity("venues");
export const ServiceProvider = createEntity("service-providers");
export const Event = createEntity("events");
export const DFYLead = createEntity("dfy-leads");
export const WaitlistSubscriber = createEntity("waitlist-subscribers");
export const Plan = createEntity("plans");
export const Conversation = createEntity("conversations");
export const ConversationParticipant = createEntity("conversation-participants");
export const Message = createEntity("messages");
export const Booking = createEntity("bookings");
export const Review = createEntity("reviews");
export const FeaturedPlacement = createEntity("featured-placements");
export const EventbriteSync = createEntity("eventbrite-syncs");
export const Organization = createEntity("organizations");
export const Document = createEntity("documents");
export const InsurancePolicy = createEntity("insurance-policies");
export const Service = createEntity("services");
export const EventChecklist = createEntity("event-checklists");
export const MarketingCampaign = createEntity("marketing-campaigns");
export const Sponsor = createEntity("sponsors");
export const GeneratedCaption = createEntity("generated-captions");
export const EventCollaborator = createEntity("event-collaborators");
export const Favorite = createEntity("favorites");
export const Reminder = createEntity("reminders");
export const ContactSubmission = createEntity("contact-submissions");
export const AuthUser = createEntity("auth-users");
export const DemoRequest = createEntity("demo-requests");
export const Template = createEntity("templates");

// ---------------------------------------------------------------------------
// Auth (User) — special entity with auth-specific methods
// ---------------------------------------------------------------------------

export const User = {
  async me(): Promise<any> {
    return request<any>("GET", "/api/auth/me", { auth: true });
  },

  async list(): Promise<any[]> {
    return request<any[]>("GET", "/api/auth-users", { auth: true });
  },

  async login(credentials?: Record<string, any>): Promise<any> {
    return request<any>("POST", "/api/auth/login", { body: credentials ?? {} });
  },

  async logout(): Promise<void> {
    return request<void>("POST", "/api/auth/logout", { auth: true });
  },

  async signUp(payload: Record<string, any>): Promise<any> {
    return request<any>("POST", "/api/auth/signup", { body: payload });
  },

  async updateMyUserData(payload: Record<string, any>): Promise<any> {
    return request<any>("PUT", "/api/auth/me", { body: payload, auth: true });
  },
};
