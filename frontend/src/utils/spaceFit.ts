import type { VenueData } from "@/data/venues";
import type { LayoutMode } from "@/data/venueLayouts";

export type InventoryMix = {
  tables: number;
  chairs: number;
  stageModules: number;
  buffetStations: number;
};

export type FitStatus = "FIT" | "TIGHT" | "OVER";

export type AdjustmentSuggestion =
  | { type: "reduce-guest-count"; suggestedGuestCount: number }
  | { type: "reduce-stage-modules"; suggestedStageModules: number }
  | { type: "reduce-tables"; suggestedTables: number }
  | { type: "switch-mode"; suggestedMode: LayoutMode };

const SQFT_PER_GUEST: Record<LayoutMode, number> = {
  optimized: 13.5,
  max: 9.5
};

const INVENTORY_FOOTPRINT = {
  stageModule: 120,
  buffetStation: 60,
  table: 25
};

const roundToNearest = (value: number, step: number) =>
  Math.max(step, Math.round(value / step) * step);

export const estimateRequiredSqft = (
  guestCount: number,
  mode: LayoutMode,
  inventoryMix?: Partial<InventoryMix>
) => {
  const perGuest = SQFT_PER_GUEST[mode];
  const base = guestCount * perGuest;
  const stageModules = inventoryMix?.stageModules ?? 0;
  const buffetStations = inventoryMix?.buffetStations ?? 0;
  const tables = inventoryMix?.tables ?? 0;

  const inventoryFootprint =
    stageModules * INVENTORY_FOOTPRINT.stageModule +
    buffetStations * INVENTORY_FOOTPRINT.buffetStation +
    tables * INVENTORY_FOOTPRINT.table;

  return Math.round(base + inventoryFootprint);
};

export const computeFitStatus = (
  venueSqft: number,
  requiredSqft: number
): FitStatus => {
  if (requiredSqft <= venueSqft) {
    return "FIT";
  }

  if (requiredSqft <= venueSqft * 1.08) {
    return "TIGHT";
  }

  return "OVER";
};

export const suggestAdjustments = ({
  venueSqft,
  guestCount,
  mode,
  inventoryMix
}: {
  venueSqft: number;
  guestCount: number;
  mode: LayoutMode;
  inventoryMix?: Partial<InventoryMix>;
}): AdjustmentSuggestion[] => {
  const suggestions: AdjustmentSuggestion[] = [];
  const perGuest = SQFT_PER_GUEST[mode];
  const maxGuests = Math.floor(venueSqft / perGuest);

  if (guestCount > maxGuests) {
    suggestions.push({
      type: "reduce-guest-count",
      suggestedGuestCount: roundToNearest(maxGuests, 5)
    });
  }

  if ((inventoryMix?.stageModules ?? 0) > 2) {
    suggestions.push({
      type: "reduce-stage-modules",
      suggestedStageModules: Math.max(2, inventoryMix?.stageModules ? inventoryMix.stageModules - 2 : 2)
    });
  }

  if ((inventoryMix?.tables ?? 0) > 10) {
    suggestions.push({
      type: "reduce-tables",
      suggestedTables: Math.max(10, inventoryMix?.tables ? inventoryMix.tables - 4 : 10)
    });
  }

  if (mode === "optimized") {
    suggestions.push({ type: "switch-mode", suggestedMode: "max" });
  }

  return suggestions;
};

export const suggestAlternativeVenues = (
  venues: VenueData[],
  requiredSqft: number
) =>
  venues
    .filter((venue) => venue.sqft >= requiredSqft)
    .sort((a, b) => a.sqft - b.sqft)
    .slice(0, 3);
