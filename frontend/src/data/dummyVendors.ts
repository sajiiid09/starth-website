export type PublicVendorType = "venue_owner" | "service_provider";

export type PublicVendor = {
  id: string;
  name: string;
  vendorType: PublicVendorType;
  location: string;
  heroImage: string;
  description: string;
  categories?: string[];
  areas?: string[];
  sqft?: number;
  guestRange?: string;
};

export const dummyVendors: PublicVendor[] = [
  {
    id: "venue-aurora-loft",
    name: "Aurora Loft Studios",
    vendorType: "venue_owner",
    location: "Brooklyn, NY",
    heroImage: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop",
    description: "Sun-drenched industrial lofts for immersive brand moments.",
    sqft: 8200,
    guestRange: "80-240 guests"
  },
  {
    id: "venue-harborline",
    name: "Harborline Hall",
    vendorType: "venue_owner",
    location: "Boston, MA",
    heroImage: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop",
    description: "Historic waterfront venue with modern production-ready suites.",
    sqft: 12000,
    guestRange: "120-400 guests"
  },
  {
    id: "venue-vista",
    name: "Vista Pavilion",
    vendorType: "venue_owner",
    location: "Los Angeles, CA",
    heroImage: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop",
    description: "Flexible open-plan venue designed for experiential showcases.",
    sqft: 15000,
    guestRange: "150-500 guests"
  },
  {
    id: "venue-rosewood",
    name: "Rosewood Courtyard",
    vendorType: "venue_owner",
    location: "Charleston, SC",
    heroImage: "/images/templates/template-wedding-gala.webp",
    description: "Garden terraces with indoor-outdoor flow and ceremony vignettes.",
    sqft: 9200,
    guestRange: "90-260 guests"
  },
  {
    id: "venue-summit",
    name: "Summit Gallery",
    vendorType: "venue_owner",
    location: "Denver, CO",
    heroImage: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&h=600&fit=crop",
    description: "Modern gallery space with curated lighting and staging support.",
    sqft: 6800,
    guestRange: "60-180 guests"
  },
  {
    id: "venue-hudson",
    name: "Hudson Exchange",
    vendorType: "venue_owner",
    location: "Jersey City, NJ",
    heroImage: "/images/templates/template-fundraiser.webp",
    description: "Versatile warehouse venue built for fundraisers and launches.",
    sqft: 14000,
    guestRange: "140-520 guests"
  },
  {
    id: "vendor-citrine",
    name: "Citrine Culinary",
    vendorType: "service_provider",
    location: "Miami, FL",
    heroImage: "/images/marketplace/vendor-catering.webp",
    description: "Coastal menus with polished, full-service execution.",
    categories: ["Catering", "Private Dining", "Chef Stations"],
    areas: ["South Florida", "Palm Beach", "Fort Lauderdale"]
  },
  {
    id: "vendor-moonlit-av",
    name: "Moonlit AV",
    vendorType: "service_provider",
    location: "Nashville, TN",
    heroImage: "/images/marketplace/vendor-av.webp",
    description: "Lighting, sound, and stage design tailored for immersive events.",
    categories: ["AV Production", "Lighting", "Stage Design"],
    areas: ["Tennessee", "Kentucky", "Georgia"]
  },
  {
    id: "vendor-bloom-beam",
    name: "Bloom & Beam",
    vendorType: "service_provider",
    location: "Seattle, WA",
    heroImage: "/images/marketplace/vendor-floral.webp",
    description: "Modern floral installations and layered tablescapes.",
    categories: ["Floral Design", "Tablescapes", "Installations"],
    areas: ["Seattle", "Bellevue", "Tacoma"]
  },
  {
    id: "vendor-velvet-frame",
    name: "Velvet Frame Studio",
    vendorType: "service_provider",
    location: "Denver, CO",
    heroImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=600&fit=crop",
    description: "Editorial storytelling with highlight reels and fast turnaround.",
    categories: ["Photography", "Video Recaps", "Content Capture"],
    areas: ["Colorado", "Utah", "New Mexico"]
  },
  {
    id: "vendor-harmony-talent",
    name: "Harmony Talent",
    vendorType: "service_provider",
    location: "Chicago, IL",
    heroImage: "/images/marketplace/vendor-av.webp",
    description: "Curated live acts, DJs, and program direction for every vibe.",
    categories: ["Entertainment", "DJ", "Programming"],
    areas: ["Illinois", "Wisconsin", "Indiana"]
  },
  {
    id: "vendor-cedar-lane",
    name: "Cedar Lane Styling",
    vendorType: "service_provider",
    location: "Austin, TX",
    heroImage: "/images/marketplace/vendor-floral.webp",
    description: "Brand-forward decor styling with modular lounge builds.",
    categories: ["Decor", "Furniture", "Installation"],
    areas: ["Texas", "Oklahoma", "Louisiana"]
  },
  {
    id: "vendor-silverline",
    name: "Silverline Hospitality",
    vendorType: "service_provider",
    location: "San Francisco, CA",
    heroImage: "/images/marketplace/vendor-catering.webp",
    description: "Hospitality staffing and concierge-level guest flow design.",
    categories: ["Event Staffing", "Concierge", "Guest Services"],
    areas: ["Bay Area", "Sacramento", "Monterey"]
  },
  {
    id: "vendor-northwind",
    name: "Northwind Transport",
    vendorType: "service_provider",
    location: "Portland, OR",
    heroImage: "/images/marketplace/vendor-av.webp",
    description: "Luxury shuttle logistics and VIP travel coordination.",
    categories: ["Transportation", "Shuttles", "VIP Logistics"],
    areas: ["Oregon", "Washington", "Idaho"]
  },
  {
    id: "vendor-saffron",
    name: "Saffron Studio",
    vendorType: "service_provider",
    location: "Atlanta, GA",
    heroImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    description: "Creative direction, set builds, and on-site content teams.",
    categories: ["Content", "Creative Direction", "Set Design"],
    areas: ["Georgia", "South Carolina", "Alabama"]
  }
];
