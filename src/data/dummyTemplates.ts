export type TemplateTimelineItem = {
  time: string;
  title: string;
  description: string;
};

export type TemplateVendorItem = {
  category: string;
  name: string;
  note: string;
};

export type TemplateBudget = {
  total: string;
  breakdown: Array<{ label: string; amount: string }>;
};

export type DummyTemplate = {
  id: string;
  title: string;
  image: string;
  description: string;
  fullDetails: string;
  timeline?: TemplateTimelineItem[];
  vendors?: TemplateVendorItem[];
  budget?: TemplateBudget;
  stats?: Array<{ label: string; value: string }>;
};

export const dummyTemplates: DummyTemplate[] = [
  {
    id: "wedding-gala",
    title: "Modern Wedding Gala",
    image: "/images/templates/template-wedding-gala.webp",
    description: "A timeless ceremony-to-reception flow with elevated guest moments.",
    fullDetails:
      "A modern wedding blueprint built for seamless transitions, curated guest experiences, and a refined aesthetic from ceremony to late-night celebration.",
    stats: [
      { label: "Guest Count", value: "180" },
      { label: "Duration", value: "8 hours" },
      { label: "Format", value: "Indoor/Outdoor" }
    ],
    timeline: [
      {
        time: "2:00 PM",
        title: "Guest Arrival",
        description: "Signature welcome drinks and ambient lounge seating."
      },
      {
        time: "3:00 PM",
        title: "Ceremony",
        description: "Live string trio with custom floral arch moment."
      },
      {
        time: "5:00 PM",
        title: "Cocktail Hour",
        description: "Passed hors d'oeuvres and photo activations."
      },
      {
        time: "6:30 PM",
        title: "Reception",
        description: "Dinner service, speeches, and first dance."
      }
    ],
    vendors: [
      {
        category: "Venue",
        name: "The Glass Conservatory",
        note: "Natural light, garden access, skyline views."
      },
      {
        category: "Catering",
        name: "Saffron & Sage",
        note: "Seasonal plated dinner with vegan pairing."
      },
      {
        category: "Entertainment",
        name: "Nova Sound Collective",
        note: "Live band + DJ handoff."
      }
    ],
    budget: {
      total: "$68,500",
      breakdown: [
        { label: "Venue & rentals", amount: "$24,000" },
        { label: "Food & beverage", amount: "$22,500" },
        { label: "Production", amount: "$12,000" },
        { label: "Decor & florals", amount: "$10,000" }
      ]
    }
  },
  {
    id: "executive-retreat",
    title: "Executive Offsite Retreat",
    image: "/images/templates/template-retreat.webp",
    description: "A two-day leadership reset focused on alignment and recharge.",
    fullDetails:
      "Designed for high-impact leadership teams, this retreat blueprint balances strategic planning sessions with wellness-forward experiences.",
    stats: [
      { label: "Attendees", value: "24" },
      { label: "Duration", value: "2 days" },
      { label: "Location", value: "Resort" }
    ],
    timeline: [
      {
        time: "Day 1 · 9:00 AM",
        title: "Vision Workshop",
        description: "Facilitated strategy session with breakout rooms."
      },
      {
        time: "Day 1 · 12:30 PM",
        title: "Wellness Lunch",
        description: "Farm-to-table menu and guided mindfulness."
      },
      {
        time: "Day 1 · 4:00 PM",
        title: "Outdoor Activity",
        description: "Guided trail walk and fireside reflection."
      },
      {
        time: "Day 2 · 10:00 AM",
        title: "Roadmap Alignment",
        description: "OKR planning and next-quarter commitments."
      }
    ],
    vendors: [
      {
        category: "Venue",
        name: "Lagoon Ridge Resort",
        note: "Private villas and meeting suites."
      },
      {
        category: "Facilitation",
        name: "Catalyst Labs",
        note: "Leadership coaching and strategic facilitation."
      },
      {
        category: "Wellness",
        name: "Breathe Studio",
        note: "Meditation and breathwork sessions."
      }
    ],
    budget: {
      total: "$42,000",
      breakdown: [
        { label: "Lodging", amount: "$18,000" },
        { label: "Programming", amount: "$12,000" },
        { label: "Food & beverage", amount: "$8,000" },
        { label: "Transportation", amount: "$4,000" }
      ]
    }
  },
  {
    id: "product-launch",
    title: "Product Launch Night",
    image: "/images/templates/template-launch.webp",
    description: "A cinematic reveal experience with press and VIP guests.",
    fullDetails:
      "Crafted for tech and consumer product launches, this blueprint blends immersive storytelling with a high-energy reveal moment.",
    stats: [
      { label: "Guests", value: "150" },
      { label: "Format", value: "Evening Event" },
      { label: "Press", value: "20 outlets" }
    ],
    timeline: [
      {
        time: "6:00 PM",
        title: "Press Preview",
        description: "Private demo stations and media interviews."
      },
      {
        time: "7:30 PM",
        title: "Main Reveal",
        description: "Stage reveal with light show and keynote."
      },
      {
        time: "8:15 PM",
        title: "Experience Zones",
        description: "Interactive product labs and photo moments."
      },
      {
        time: "9:30 PM",
        title: "Afterparty",
        description: "DJ set, desserts, and networking."
      }
    ],
    vendors: [
      {
        category: "Production",
        name: "Signal Stageworks",
        note: "LED wall, sound, and lighting design."
      },
      {
        category: "PR",
        name: "Brightline Media",
        note: "Press outreach and guest list curation."
      },
      {
        category: "Catering",
        name: "Urban Tasting",
        note: "Global tapas and cocktail program."
      }
    ],
    budget: {
      total: "$58,000",
      breakdown: [
        { label: "Production", amount: "$22,000" },
        { label: "Venue", amount: "$15,000" },
        { label: "Food & beverage", amount: "$12,000" },
        { label: "Marketing", amount: "$9,000" }
      ]
    }
  },
  {
    id: "fundraiser",
    title: "Nonprofit Fundraiser Gala",
    image: "/images/templates/template-fundraiser.webp",
    description: "A donor-first gala with auction strategy baked in.",
    fullDetails:
      "Built for high-impact fundraising, this blueprint focuses on storytelling, donor engagement, and seamless auction flow.",
    stats: [
      { label: "Guests", value: "320" },
      { label: "Target", value: "$250k" },
      { label: "Format", value: "Black tie" }
    ],
    timeline: [
      {
        time: "5:30 PM",
        title: "Sponsor Reception",
        description: "VIP cocktail reception with honoree preview."
      },
      {
        time: "6:30 PM",
        title: "Dinner & Program",
        description: "Keynote, impact video, and live appeal."
      },
      {
        time: "8:00 PM",
        title: "Live Auction",
        description: "Auctioneer-led bidding with highlight items."
      },
      {
        time: "9:00 PM",
        title: "Celebration",
        description: "Live music and donor appreciation lounge."
      }
    ],
    vendors: [
      {
        category: "Auction",
        name: "CharityBid Pro",
        note: "Hybrid live + silent auction management."
      },
      {
        category: "AV",
        name: "Beacon Events",
        note: "Stage, lighting, and livestream support."
      },
      {
        category: "Catering",
        name: "Harbor Club",
        note: "Elevated plated service."
      }
    ],
    budget: {
      total: "$95,000",
      breakdown: [
        { label: "Venue & production", amount: "$40,000" },
        { label: "Food & beverage", amount: "$28,000" },
        { label: "Entertainment", amount: "$12,000" },
        { label: "Program & decor", amount: "$15,000" }
      ]
    }
  },
  {
    id: "memorial",
    title: "Celebration of Life",
    image: "/images/templates/template-memorial.webp",
    description: "A warm, intimate memorial gathering with thoughtful touches.",
    fullDetails:
      "A calming, respectful blueprint that prioritizes guest comfort, memory sharing, and meaningful rituals.",
    stats: [
      { label: "Guests", value: "80" },
      { label: "Format", value: "Half-day" },
      { label: "Setting", value: "Garden" }
    ],
    timeline: [
      {
        time: "1:00 PM",
        title: "Arrival & Reflection",
        description: "Memory wall and welcome refreshments."
      },
      {
        time: "2:00 PM",
        title: "Program",
        description: "Eulogies, slideshow, and live music."
      },
      {
        time: "3:30 PM",
        title: "Reception",
        description: "Light bites and shared stories."
      }
    ],
    vendors: [
      {
        category: "Venue",
        name: "Willow Gardens",
        note: "Private garden with covered pavilion."
      },
      {
        category: "Floral",
        name: "Everlight Studio",
        note: "Soft arrangements and memory table."
      },
      {
        category: "Music",
        name: "Aria Strings",
        note: "Ambient live string duo."
      }
    ],
    budget: {
      total: "$18,500",
      breakdown: [
        { label: "Venue & rentals", amount: "$7,500" },
        { label: "Catering", amount: "$5,000" },
        { label: "Floral & decor", amount: "$4,000" },
        { label: "Music", amount: "$2,000" }
      ]
    }
  },
  {
    id: "campus-lecture",
    title: "Campus Lecture Series",
    image: "/images/templates/template-conference.webp",
    description: "A repeatable lecture format for academic audiences.",
    fullDetails:
      "Optimized for universities and speaker series, this blueprint covers AV, guest flow, and post-event engagement.",
    stats: [
      { label: "Attendees", value: "220" },
      { label: "Format", value: "Evening" },
      { label: "Series", value: "4 talks" }
    ],
    timeline: [
      {
        time: "5:30 PM",
        title: "Doors Open",
        description: "Check-in, seating guidance, and program handouts."
      },
      {
        time: "6:00 PM",
        title: "Keynote",
        description: "45-minute lecture with live Q&A."
      },
      {
        time: "7:00 PM",
        title: "Reception",
        description: "Faculty networking and refreshments."
      }
    ],
    vendors: [
      {
        category: "AV",
        name: "Campus Tech Services",
        note: "Recording and livestreaming support."
      },
      {
        category: "Catering",
        name: "Scholars Cafe",
        note: "Coffee bar and light bites."
      },
      {
        category: "Print",
        name: "Ink & Ivory",
        note: "Program guides and signage."
      }
    ],
    budget: {
      total: "$12,000",
      breakdown: [
        { label: "AV", amount: "$4,500" },
        { label: "Speaker fees", amount: "$3,500" },
        { label: "Catering", amount: "$2,000" },
        { label: "Marketing", amount: "$2,000" }
      ]
    }
  }
];
