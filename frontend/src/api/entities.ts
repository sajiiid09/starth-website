import { base44 } from "./base44Client";

type EntityRecord = Record<string, unknown>;
type EntityQuery = Record<string, unknown> | undefined;

export type Base44Entity<TRecord = EntityRecord> = {
  filter: (query?: EntityQuery) => Promise<TRecord[]>;
  get: (id: string) => Promise<TRecord | null>;
  create: (payload: EntityRecord) => Promise<TRecord>;
  update: (id: string, payload: EntityRecord) => Promise<TRecord>;
  delete: (id: string) => Promise<boolean>;
  search: (query?: EntityQuery) => Promise<TRecord[]>;
};

type Base44EntityMap = Record<string, Base44Entity>;

type Base44AuthClient = {
  me: (...args: unknown[]) => Promise<unknown>;
  login: (...args: unknown[]) => Promise<unknown>;
  logout: (...args: unknown[]) => Promise<unknown>;
  signUp: (...args: unknown[]) => Promise<unknown>;
};

const entities = (base44 as { entities: Base44EntityMap }).entities;

export const Venue = entities.Venue;
export const ServiceProvider = entities.ServiceProvider;
export const Event = entities.Event;
export const DFYLead = entities.DFYLead;
export const WaitlistSubscriber = entities.WaitlistSubscriber;
export const Plan = entities.Plan;
export const Conversation = entities.Conversation;
export const ConversationParticipant = entities.ConversationParticipant;
export const Message = entities.Message;
export const Booking = entities.Booking;
export const Review = entities.Review;
export const FeaturedPlacement = entities.FeaturedPlacement;
export const EventbriteSync = entities.EventbriteSync;
export const Organization = entities.Organization;
export const Document = entities.Document;
export const InsurancePolicy = entities.InsurancePolicy;
export const Service = entities.Service;
export const EventChecklist = entities.EventChecklist;
export const MarketingCampaign = entities.MarketingCampaign;
export const Sponsor = entities.Sponsor;
export const GeneratedCaption = entities.GeneratedCaption;
export const EventCollaborator = entities.EventCollaborator;
export const Favorite = entities.Favorite;
export const Reminder = entities.Reminder;
export const ContactSubmission = entities.ContactSubmission;
export const AuthUser = entities.AuthUser;
export const OTPVerification = entities.OTPVerification;
export const DemoRequest = entities.DemoRequest;

// auth sdk:
export const User = (base44 as { auth: Base44AuthClient }).auth;
