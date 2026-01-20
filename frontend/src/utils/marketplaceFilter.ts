import type { MarketplaceItem } from "@/data/dummyMarketplace";

export type MarketplaceFilterState = {
  state: string;
  city: string;
  category: string;
  eventType: string;
};

export type MarketplaceSortOption = "relevance" | "price_low" | "price_high" | "rating";

type MarketplaceFilterInput = {
  items: MarketplaceItem[];
  searchQuery: string;
  filters: MarketplaceFilterState;
  sortBy: MarketplaceSortOption;
};

const normalize = (value: string) => value.trim().toLowerCase();

const parseLocation = (location?: string) => {
  if (!location) {
    return { city: "", state: "" };
  }

  const [cityPart, statePart] = location.split(",").map((part) => part.trim());
  return {
    city: cityPart ?? "",
    state: statePart ?? ""
  };
};

const parsePriceValue = (item: MarketplaceItem) => {
  const priceString = item.startingPrice || item.priceRange;
  if (!priceString) {
    return null;
  }

  const match = priceString.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
};

const matchesEventType = (item: MarketplaceItem, eventType: string) => {
  const normalizedEvent = normalize(eventType);
  if (!normalizedEvent) {
    return true;
  }

  const haystack = [
    item.title,
    item.shortDescription,
    item.fullDescription,
    item.category,
    item.location,
    item.tags?.join(" ")
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedEvent);
};

export const filterMarketplaceItems = ({
  items,
  searchQuery,
  filters,
  sortBy
}: MarketplaceFilterInput) => {
  const normalizedSearch = normalize(searchQuery);

  const filtered = items.filter((item) => {
    const { city, state } = parseLocation(item.location);

    const matchesSearch =
      !normalizedSearch ||
      [
        item.title,
        item.shortDescription,
        item.fullDescription,
        item.category,
        item.location,
        item.tags?.join(" ")
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesState = !filters.state || state === filters.state;
    const matchesCity = !filters.city || city === filters.city;
    const matchesEvent = matchesEventType(item, filters.eventType);

    return matchesSearch && matchesCategory && matchesState && matchesCity && matchesEvent;
  });

  const sorted = [...filtered];

  if (sortBy === "price_low") {
    sorted.sort((a, b) => (parsePriceValue(a) ?? 0) - (parsePriceValue(b) ?? 0));
  }

  if (sortBy === "price_high") {
    sorted.sort((a, b) => (parsePriceValue(b) ?? 0) - (parsePriceValue(a) ?? 0));
  }

  return sorted;
};

export const getFeaturedMarketplaceItems = (items: MarketplaceItem[]) => items.slice(0, 4);
