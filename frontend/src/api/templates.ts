/**
 * Template API adapter — maps backend Template model to the DummyTemplate UI shape.
 *
 * Backend Template fields:
 *   id, name, description, event_type, template_data (JSONB), budget_min, budget_max,
 *   guest_count, is_featured, times_used, average_rating, created_at
 *
 * The `template_data` JSONB is expected to contain rich UI data:
 *   image, images, fullDetails, venueId, defaultGuestCount, recommendedMode,
 *   maxGuestCount, timeline, vendors, budget, stats
 */

import { Template } from "./entities";
import type { DummyTemplate } from "@/data/dummyTemplates";

// ---------------------------------------------------------------------------
// Types for the raw backend response
// ---------------------------------------------------------------------------

type RawTemplate = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Fallback images for templates without hero images
// ---------------------------------------------------------------------------

const FALLBACK_IMAGES: Record<string, string> = {
  wedding: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1000",
  corporate: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1000",
  birthday: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1000",
  conference: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000",
  engagement: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80&w=1000",
  default: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000",
};

function getFallbackImage(eventType?: string): string {
  if (!eventType) return FALLBACK_IMAGES.default;
  return FALLBACK_IMAGES[eventType.toLowerCase()] ?? FALLBACK_IMAGES.default;
}

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

function buildPriceRange(budgetMin?: number, budgetMax?: number): string {
  if (budgetMin && budgetMax) return `${formatCurrency(budgetMin)} – ${formatCurrency(budgetMax)}`;
  if (budgetMax) return `Up to ${formatCurrency(budgetMax)}`;
  if (budgetMin) return `From ${formatCurrency(budgetMin)}`;
  return "";
}

// ---------------------------------------------------------------------------
// Adapter: backend Template → DummyTemplate (UI shape)
// ---------------------------------------------------------------------------

export function apiTemplateToUI(raw: RawTemplate): DummyTemplate {
  const data = (raw.template_data ?? raw.data ?? {}) as Record<string, unknown>;

  const id = String(raw.id ?? "");
  const name = (raw.name ?? data.name ?? "Untitled Template") as string;
  const description = (raw.description ?? data.description ?? "") as string;
  const eventType = (raw.event_type ?? data.event_type ?? "") as string;
  const guestCount = (raw.guest_count ?? data.guest_count) as number | undefined;
  const budgetMin = Number(raw.budget_min) || undefined;
  const budgetMax = Number(raw.budget_max) || undefined;

  // UI-specific fields from template_data
  const image = (data.image as string) || getFallbackImage(eventType);
  const images = (data.images as string[]) || undefined;
  const fullDetails = (data.fullDetails as string) || description;
  const venueId = (data.venueId as string) || undefined;
  const defaultGuestCount = (data.defaultGuestCount as number) || guestCount || undefined;
  const recommendedMode = (data.recommendedMode as "optimized" | "max") || "optimized";
  const maxGuestCount = (data.maxGuestCount as number) || undefined;

  // Timeline: backend stores { time, activity }, UI expects { time, title, description }
  const rawTimeline = (data.timeline as Record<string, unknown>[]) || [];
  const timeline = rawTimeline.map((item) => ({
    time: (item.time as string) || "",
    title: (item.title as string) || (item.activity as string) || "",
    description: (item.description as string) || "",
  }));

  // Vendors
  const vendors = (data.vendors as Array<{ category: string; name: string; note: string }>) || [];

  // Budget: backend stores { total, breakdown } or { budget_breakdown: {...} }
  const budgetObj = data.budget as Record<string, unknown> | undefined;
  const budgetBreakdown = data.budget_breakdown as Record<string, number> | undefined;
  let budget: DummyTemplate["budget"] | undefined;

  if (budgetObj) {
    budget = {
      total: (budgetObj.total as string) || buildPriceRange(budgetMin, budgetMax),
      breakdown: (budgetObj.breakdown as Array<{ label: string; amount: string }>) || [],
    };
  } else if (budgetBreakdown) {
    const totalValue = Object.values(budgetBreakdown).reduce((sum, v) => sum + (v || 0), 0);
    budget = {
      total: formatCurrency(totalValue),
      breakdown: Object.entries(budgetBreakdown).map(([label, amount]) => ({
        label: label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        amount: formatCurrency(amount),
      })),
    };
  }

  // Stats
  const stats = (data.stats as Array<{ label: string; value: string }>) || undefined;

  return {
    id,
    title: name,
    image,
    description,
    fullDetails,
    images,
    venueId,
    defaultGuestCount,
    recommendedMode,
    maxGuestCount,
    timeline: timeline.length > 0 ? timeline : undefined,
    vendors: vendors.length > 0 ? vendors : undefined,
    budget,
    stats,
  };
}

// ---------------------------------------------------------------------------
// API fetchers
// ---------------------------------------------------------------------------

export async function fetchAllTemplates(): Promise<DummyTemplate[]> {
  try {
    const raw = await Template.filter();
    const list = Array.isArray(raw) ? raw : [];
    return list.map(apiTemplateToUI);
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return [];
  }
}

export async function fetchTemplateById(id: string): Promise<DummyTemplate | null> {
  try {
    const raw = await Template.get(id);
    if (!raw) return null;
    return apiTemplateToUI(raw as RawTemplate);
  } catch (error) {
    console.error(`Failed to fetch template ${id}:`, error);
    return null;
  }
}
