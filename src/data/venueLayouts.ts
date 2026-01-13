import type { VenueData } from "@/data/venues";

export type LayoutMode = "optimized" | "max";

export type ZoneConfig = {
  stageAreaPct: number;
  seatingAreaPct: number;
  cateringAreaPct: number;
  avAreaPct: number;
};

export type LayoutInventory = {
  chairs: number;
  tables: number;
  stageModules: number;
  buffetStations: number;
  cocktailTables: number;
};

export type VenueLayout = {
  venueId: VenueData["id"];
  mode: LayoutMode;
  guestRangeRecommended: { min: number; max: number };
  zoneConfig: ZoneConfig;
  aisleFactor: number;
  comfortFactor: number;
  baselineInventory: LayoutInventory;
};

export const venueLayouts: VenueLayout[] = [
  {
    venueId: "harborview-hall",
    mode: "optimized",
    guestRangeRecommended: { min: 180, max: 320 },
    zoneConfig: { stageAreaPct: 14, seatingAreaPct: 56, cateringAreaPct: 18, avAreaPct: 12 },
    aisleFactor: 1.08,
    comfortFactor: 1.12,
    baselineInventory: { chairs: 280, tables: 28, stageModules: 6, buffetStations: 3, cocktailTables: 12 }
  },
  {
    venueId: "harborview-hall",
    mode: "max",
    guestRangeRecommended: { min: 260, max: 420 },
    zoneConfig: { stageAreaPct: 10, seatingAreaPct: 64, cateringAreaPct: 16, avAreaPct: 10 },
    aisleFactor: 0.98,
    comfortFactor: 0.94,
    baselineInventory: { chairs: 360, tables: 24, stageModules: 4, buffetStations: 2, cocktailTables: 8 }
  },
  {
    venueId: "cityline-gallery",
    mode: "optimized",
    guestRangeRecommended: { min: 110, max: 190 },
    zoneConfig: { stageAreaPct: 12, seatingAreaPct: 58, cateringAreaPct: 18, avAreaPct: 12 },
    aisleFactor: 1.06,
    comfortFactor: 1.1,
    baselineInventory: { chairs: 160, tables: 16, stageModules: 4, buffetStations: 2, cocktailTables: 6 }
  },
  {
    venueId: "cityline-gallery",
    mode: "max",
    guestRangeRecommended: { min: 160, max: 240 },
    zoneConfig: { stageAreaPct: 9, seatingAreaPct: 66, cateringAreaPct: 15, avAreaPct: 10 },
    aisleFactor: 0.97,
    comfortFactor: 0.92,
    baselineInventory: { chairs: 210, tables: 14, stageModules: 3, buffetStations: 2, cocktailTables: 4 }
  },
  {
    venueId: "northbridge-loft",
    mode: "optimized",
    guestRangeRecommended: { min: 70, max: 120 },
    zoneConfig: { stageAreaPct: 11, seatingAreaPct: 60, cateringAreaPct: 19, avAreaPct: 10 },
    aisleFactor: 1.05,
    comfortFactor: 1.08,
    baselineInventory: { chairs: 100, tables: 10, stageModules: 3, buffetStations: 2, cocktailTables: 5 }
  },
  {
    venueId: "northbridge-loft",
    mode: "max",
    guestRangeRecommended: { min: 95, max: 160 },
    zoneConfig: { stageAreaPct: 8, seatingAreaPct: 68, cateringAreaPct: 14, avAreaPct: 10 },
    aisleFactor: 0.96,
    comfortFactor: 0.9,
    baselineInventory: { chairs: 140, tables: 8, stageModules: 2, buffetStations: 1, cocktailTables: 4 }
  },
  {
    venueId: "riverside-pavilion",
    mode: "optimized",
    guestRangeRecommended: { min: 220, max: 360 },
    zoneConfig: { stageAreaPct: 13, seatingAreaPct: 55, cateringAreaPct: 20, avAreaPct: 12 },
    aisleFactor: 1.1,
    comfortFactor: 1.14,
    baselineInventory: { chairs: 320, tables: 32, stageModules: 7, buffetStations: 4, cocktailTables: 14 }
  },
  {
    venueId: "riverside-pavilion",
    mode: "max",
    guestRangeRecommended: { min: 300, max: 480 },
    zoneConfig: { stageAreaPct: 9, seatingAreaPct: 66, cateringAreaPct: 15, avAreaPct: 10 },
    aisleFactor: 0.98,
    comfortFactor: 0.93,
    baselineInventory: { chairs: 420, tables: 26, stageModules: 5, buffetStations: 3, cocktailTables: 10 }
  },
  {
    venueId: "heritage-studio",
    mode: "optimized",
    guestRangeRecommended: { min: 80, max: 140 },
    zoneConfig: { stageAreaPct: 12, seatingAreaPct: 58, cateringAreaPct: 18, avAreaPct: 12 },
    aisleFactor: 1.04,
    comfortFactor: 1.08,
    baselineInventory: { chairs: 120, tables: 12, stageModules: 3, buffetStations: 2, cocktailTables: 6 }
  },
  {
    venueId: "heritage-studio",
    mode: "max",
    guestRangeRecommended: { min: 110, max: 180 },
    zoneConfig: { stageAreaPct: 9, seatingAreaPct: 66, cateringAreaPct: 15, avAreaPct: 10 },
    aisleFactor: 0.96,
    comfortFactor: 0.91,
    baselineInventory: { chairs: 150, tables: 10, stageModules: 2, buffetStations: 1, cocktailTables: 4 }
  },
  {
    venueId: "summit-terrace",
    mode: "optimized",
    guestRangeRecommended: { min: 150, max: 240 },
    zoneConfig: { stageAreaPct: 12, seatingAreaPct: 57, cateringAreaPct: 19, avAreaPct: 12 },
    aisleFactor: 1.07,
    comfortFactor: 1.1,
    baselineInventory: { chairs: 210, tables: 20, stageModules: 4, buffetStations: 3, cocktailTables: 8 }
  },
  {
    venueId: "summit-terrace",
    mode: "max",
    guestRangeRecommended: { min: 200, max: 310 },
    zoneConfig: { stageAreaPct: 9, seatingAreaPct: 66, cateringAreaPct: 15, avAreaPct: 10 },
    aisleFactor: 0.97,
    comfortFactor: 0.93,
    baselineInventory: { chairs: 260, tables: 16, stageModules: 3, buffetStations: 2, cocktailTables: 6 }
  },
  {
    venueId: "foundry-warehouse",
    mode: "optimized",
    guestRangeRecommended: { min: 260, max: 420 },
    zoneConfig: { stageAreaPct: 15, seatingAreaPct: 54, cateringAreaPct: 19, avAreaPct: 12 },
    aisleFactor: 1.12,
    comfortFactor: 1.15,
    baselineInventory: { chairs: 360, tables: 34, stageModules: 8, buffetStations: 4, cocktailTables: 12 }
  },
  {
    venueId: "foundry-warehouse",
    mode: "max",
    guestRangeRecommended: { min: 340, max: 520 },
    zoneConfig: { stageAreaPct: 10, seatingAreaPct: 65, cateringAreaPct: 15, avAreaPct: 10 },
    aisleFactor: 0.98,
    comfortFactor: 0.92,
    baselineInventory: { chairs: 460, tables: 28, stageModules: 5, buffetStations: 3, cocktailTables: 10 }
  },
  {
    venueId: "lakeside-commons",
    mode: "optimized",
    guestRangeRecommended: { min: 150, max: 250 },
    zoneConfig: { stageAreaPct: 12, seatingAreaPct: 57, cateringAreaPct: 19, avAreaPct: 12 },
    aisleFactor: 1.06,
    comfortFactor: 1.09,
    baselineInventory: { chairs: 220, tables: 20, stageModules: 4, buffetStations: 3, cocktailTables: 8 }
  },
  {
    venueId: "lakeside-commons",
    mode: "max",
    guestRangeRecommended: { min: 200, max: 300 },
    zoneConfig: { stageAreaPct: 9, seatingAreaPct: 66, cateringAreaPct: 15, avAreaPct: 10 },
    aisleFactor: 0.97,
    comfortFactor: 0.93,
    baselineInventory: { chairs: 280, tables: 16, stageModules: 3, buffetStations: 2, cocktailTables: 6 }
  },
  {
    venueId: "orchard-house",
    mode: "optimized",
    guestRangeRecommended: { min: 60, max: 110 },
    zoneConfig: { stageAreaPct: 10, seatingAreaPct: 60, cateringAreaPct: 20, avAreaPct: 10 },
    aisleFactor: 1.04,
    comfortFactor: 1.07,
    baselineInventory: { chairs: 90, tables: 9, stageModules: 2, buffetStations: 2, cocktailTables: 4 }
  },
  {
    venueId: "orchard-house",
    mode: "max",
    guestRangeRecommended: { min: 85, max: 140 },
    zoneConfig: { stageAreaPct: 8, seatingAreaPct: 68, cateringAreaPct: 14, avAreaPct: 10 },
    aisleFactor: 0.95,
    comfortFactor: 0.9,
    baselineInventory: { chairs: 120, tables: 7, stageModules: 2, buffetStations: 1, cocktailTables: 3 }
  },
  {
    venueId: "granite-conservatory",
    mode: "optimized",
    guestRangeRecommended: { min: 200, max: 340 },
    zoneConfig: { stageAreaPct: 13, seatingAreaPct: 55, cateringAreaPct: 20, avAreaPct: 12 },
    aisleFactor: 1.08,
    comfortFactor: 1.12,
    baselineInventory: { chairs: 300, tables: 28, stageModules: 6, buffetStations: 3, cocktailTables: 10 }
  },
  {
    venueId: "granite-conservatory",
    mode: "max",
    guestRangeRecommended: { min: 280, max: 420 },
    zoneConfig: { stageAreaPct: 10, seatingAreaPct: 64, cateringAreaPct: 16, avAreaPct: 10 },
    aisleFactor: 0.98,
    comfortFactor: 0.93,
    baselineInventory: { chairs: 380, tables: 22, stageModules: 4, buffetStations: 2, cocktailTables: 8 }
  }
];

export const getVenueLayouts = (venueId: VenueData["id"]) =>
  venueLayouts.filter((layout) => layout.venueId === venueId);
