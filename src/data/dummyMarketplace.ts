export type MarketplaceItem = {
  id: string;
  title: string;
  category: string;
  image: string;
  images: string[];
  shortDescription: string;
  fullDescription: string;
  priceRange?: string;
  startingPrice?: string;
  location?: string;
  tags?: string[];
  whatsIncluded?: string[];
};

const defaultMarketplaceGallery = [
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80"
];

const baseMarketplaceItems: Omit<MarketplaceItem, "images">[] = [
  {
    id: "glasshouse-venue",
    title: "Glasshouse Rooftop Venue",
    category: "Venue",
    image: "https://images.unsplash.com/photo-1519671482502-9759101d4561?auto=format&fit=crop&q=80&w=1000",
    shortDescription: "Sunset-ready rooftop with skyline views and flexible layouts.",
    fullDescription:
      "Host up to 180 guests in a modern rooftop venue with floor-to-ceiling glass, built-in AV, and a dedicated event concierge to guide the night.",
    priceRange: "$3,500 - $6,000",
    location: "San Francisco, CA",
    tags: ["Rooftop", "City views", "Built-in AV", "corporate", "social"],
    whatsIncluded: [
      "On-site event coordinator",
      "Flexible floor plan",
      "Basic lighting and sound",
      "Preferred vendor list"
    ]
  },
  {
    id: "artisan-catering",
    title: "Artisan Catering Collective",
    category: "Catering",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1000",
    shortDescription: "Seasonal menus crafted for plated dinners or passed bites.",
    fullDescription:
      "A boutique culinary team offering seasonal tasting menus, signature cocktails, and full-service staffing tailored to elevated event experiences.",
    startingPrice: "$120 per guest",
    location: "Austin, TX",
    tags: ["Seasonal menus", "Full service", "Custom cocktails", "wedding", "social"],
    whatsIncluded: [
      "Menu customization",
      "Service staff",
      "Custom beverage program",
      "Dietary accommodations"
    ]
  },
  {
    id: "lumen-av",
    title: "Lumen AV Experience",
    category: "AV & Production",
    image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=1000",
    shortDescription: "Cinematic lighting and sound packages for immersive events.",
    fullDescription:
      "Professional AV production team offering lighting design, stage builds, and livestream support. Ideal for corporate events and launches.",
    priceRange: "$4,000 - $12,000",
    location: "New York, NY",
    tags: ["Lighting", "Stage build", "Livestream", "conference", "corporate"],
    whatsIncluded: [
      "Lighting design",
      "Sound engineering",
      "Stage management",
      "Livestream setup"
    ]
  },
  {
    id: "evergreen-floral",
    title: "Evergreen Floral Studio",
    category: "Decor",
    image: "https://images.unsplash.com/photo-1490750967868-58cb75069ed6?auto=format&fit=crop&q=80&w=1000",
    shortDescription: "Luxury floral installations and tablescape styling.",
    fullDescription:
      "Custom floral concepts with full installation and strike. Perfect for weddings, galas, and brand activations needing standout visuals.",
    startingPrice: "$2,500",
    location: "Los Angeles, CA",
    tags: ["Floral installations", "Tablescapes", "Luxury", "wedding"],
    whatsIncluded: [
      "Concept design",
      "On-site installation",
      "Tablescape styling",
      "Breakdown and strike"
    ]
  },
  {
    id: "solstice-photo",
    title: "Solstice Photo & Film",
    category: "Photography",
    image: "https://images.unsplash.com/photo-1520854222959-137851d89642?auto=format&fit=crop&q=80&w=1000",
    shortDescription: "Editorial-style coverage with highlight reels included.",
    fullDescription:
      "A photo + film team delivering editorial storytelling, same-week previews, and highlight films designed for social sharing.",
    startingPrice: "$3,200",
    location: "Chicago, IL",
    tags: ["Photo", "Video", "Editorial", "social"],
    whatsIncluded: [
      "8-hour coverage",
      "Highlight film",
      "Same-week previews",
      "Digital gallery"
    ]
  }
];

export const dummyMarketplaceItems: MarketplaceItem[] = baseMarketplaceItems.map((item) => ({
  ...item,
  images: [item.image, ...defaultMarketplaceGallery]
}));
