/**
 * Marketplace API — fetches venues and service providers from the backend
 * and normalizes them to the MarketplaceItem shape used by the UI.
 */

import { request } from "@/api/httpClient";
import type { MarketplaceItem } from "@/data/dummyMarketplace";

// ---------------------------------------------------------------------------
// Backend response types
// ---------------------------------------------------------------------------

type VenueResponse = {
  id: string;
  name: string;
  description: string;
  city: string;
  address: string;
  capacity: number;
  amenities: string[];
  photos: string[];
  pricing_structure: Record<string, unknown>;
  avg_rating: number | null;
};

type ServiceEntry = {
  id: string;
  name?: string;
  category?: string;
  price_range?: string;
};

type ProviderResponse = {
  id: string;
  business_name: string;
  description: string;
  city: string;
  service_area: string[];
  photos: string[];
  services: ServiceEntry[];
  avg_rating: number | null;
};

type MarketplaceListResponse<T> = {
  data: T[];
  count: number;
};

// ---------------------------------------------------------------------------
// Default image for items without photos
// ---------------------------------------------------------------------------

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80";

const DEFAULT_GALLERY = [
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80",
];

// ---------------------------------------------------------------------------
// Normalizers — convert API shapes to MarketplaceItem
// ---------------------------------------------------------------------------

function formatPricing(pricing: Record<string, unknown>): string {
  if (!pricing || Object.keys(pricing).length === 0) return "Contact for pricing";
  const base = pricing.base_price ?? pricing.basePrice ?? pricing.price;
  if (typeof base === "number") return `From $${base.toLocaleString()}`;
  if (typeof base === "string") return base;
  return "Contact for pricing";
}

export function venueToMarketplaceItem(v: VenueResponse): MarketplaceItem {
  const heroImage = v.photos?.[0] ?? PLACEHOLDER_IMAGE;
  return {
    id: `venue-${v.id}`,
    title: v.name,
    category: "Venue",
    image: heroImage,
    images: v.photos?.length > 0 ? v.photos : [heroImage, ...DEFAULT_GALLERY],
    shortDescription: v.description?.slice(0, 140) ?? "",
    fullDescription: v.description ?? "",
    priceRange: formatPricing(v.pricing_structure),
    location: v.city ?? "",
    tags: v.amenities ?? [],
    whatsIncluded: [
      v.capacity ? `Capacity: ${v.capacity} guests` : null,
      v.address ? `Location: ${v.address}` : null,
      "On-site event support",
      "Flexible floor plan",
    ].filter(Boolean) as string[],
  };
}

export function providerToMarketplaceItem(sp: ProviderResponse): MarketplaceItem {
  const heroImage = sp.photos?.[0] ?? PLACEHOLDER_IMAGE;
  const primaryService = sp.services?.[0];

  return {
    id: `service-${sp.id}`,
    title: sp.business_name,
    category: primaryService?.category ?? "Service Provider",
    image: heroImage,
    images: sp.photos?.length > 0 ? sp.photos : [heroImage, ...DEFAULT_GALLERY],
    shortDescription: sp.description?.slice(0, 140) ?? "",
    fullDescription: sp.description ?? "",
    priceRange: primaryService?.price_range ?? "Contact for pricing",
    location: sp.city ?? "",
    tags: sp.service_area ?? [],
    whatsIncluded: sp.services?.map((s) => s.name ?? s.category ?? "Service").slice(0, 6) ?? [],
  };
}

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

export async function fetchMarketplaceVenues(): Promise<MarketplaceItem[]> {
  const res = await request<MarketplaceListResponse<VenueResponse>>(
    "GET",
    "/api/marketplace/venues"
  );
  const venues = res?.data ?? [];
  return venues.map(venueToMarketplaceItem);
}

export async function fetchMarketplaceServices(): Promise<MarketplaceItem[]> {
  const res = await request<MarketplaceListResponse<ProviderResponse>>(
    "GET",
    "/api/marketplace/services"
  );
  const providers = res?.data ?? [];
  return providers.map(providerToMarketplaceItem);
}

/** Fetch all marketplace items (venues + services). */
export async function fetchAllMarketplaceItems(): Promise<MarketplaceItem[]> {
  const [venues, services] = await Promise.all([
    fetchMarketplaceVenues().catch(() => []),
    fetchMarketplaceServices().catch(() => []),
  ]);
  return [...venues, ...services];
}

/** Fetch a single marketplace item by prefixed ID (e.g. "venue-uuid" or "service-uuid"). */
export async function fetchMarketplaceItemById(
  prefixedId: string
): Promise<MarketplaceItem | null> {
  if (prefixedId.startsWith("venue-")) {
    const id = prefixedId.replace("venue-", "");
    try {
      const v = await request<VenueResponse>("GET", `/api/venues/${id}`, { auth: true });
      const raw = (v as any)?.data ?? v;
      return venueToMarketplaceItem(raw);
    } catch {
      return null;
    }
  }

  if (prefixedId.startsWith("service-")) {
    const id = prefixedId.replace("service-", "");
    try {
      const sp = await request<ProviderResponse>("GET", `/api/service-providers/${id}`, {
        auth: true,
      });
      const raw = (sp as any)?.data ?? sp;
      return providerToMarketplaceItem(raw);
    } catch {
      return null;
    }
  }

  return null;
}
