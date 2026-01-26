export type VenueShape = "rect" | "wide" | "long";

export type VenueData = {
  id: string;
  name: string;
  location: string;
  sqft: number;
  shape?: VenueShape;
  notes?: string;
  heroImage: string;
};

export const venues: VenueData[] = [
  {
    id: "harborview-hall",
    name: "Harborview Hall",
    location: "Seaport District",
    sqft: 12000,
    shape: "wide",
    notes: "Waterfront views, load-in dock on the north side.",
    heroImage: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1200&h=800&fit=crop"
  },
  {
    id: "cityline-gallery",
    name: "Cityline Gallery",
    location: "Downtown Arts Row",
    sqft: 8200,
    shape: "rect",
    notes: "Polished concrete, AV rigging points available.",
    heroImage: "/images/marketplace/venue-hall.webp"
  },
  {
    id: "northbridge-loft",
    name: "Northbridge Loft",
    location: "North End",
    sqft: 5600,
    shape: "long",
    notes: "Exposed brick, sound limit after 10pm.",
    heroImage: "/images/marketplace/venue-garden.webp"
  },
  {
    id: "riverside-pavilion",
    name: "Riverside Pavilion",
    location: "Riverside Park",
    sqft: 15000,
    shape: "wide",
    notes: "Indoor/outdoor flow, catering staging in annex.",
    heroImage: "/images/marketplace/venue-garden.webp"
  },
  {
    id: "heritage-studio",
    name: "Heritage Studio",
    location: "Old Town",
    sqft: 6400,
    shape: "rect",
    notes: "Historic interior, no open flames permitted.",
    heroImage: "/images/marketplace/venue-hall.webp"
  },
  {
    id: "summit-terrace",
    name: "Summit Terrace",
    location: "Uptown",
    sqft: 9800,
    shape: "wide",
    notes: "Rooftop access with elevator, wind considerations.",
    heroImage: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1200&h=800&fit=crop"
  },
  {
    id: "foundry-warehouse",
    name: "Foundry Warehouse",
    location: "Industrial Quarter",
    sqft: 18000,
    shape: "long",
    notes: "Pillars on 20-ft grid, bring pipe-and-drape.",
    heroImage: "/images/marketplace/venue-hall.webp"
  },
  {
    id: "lakeside-commons",
    name: "Lakeside Commons",
    location: "Lakefront",
    sqft: 10200,
    shape: "rect",
    notes: "Natural light, limited parking on weekdays.",
    heroImage: "/images/marketplace/venue-garden.webp"
  },
  {
    id: "orchard-house",
    name: "Orchard House",
    location: "West Village",
    sqft: 4800,
    shape: "long",
    notes: "Best for breakout sessions; low ceiling in rear wing.",
    heroImage: "/images/marketplace/venue-garden.webp"
  },
  {
    id: "granite-conservatory",
    name: "Granite Conservatory",
    location: "Civic Center",
    sqft: 13500,
    shape: "rect",
    notes: "Stone floors, excellent acoustics for talks.",
    heroImage: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1200&h=800&fit=crop"
  }
];
