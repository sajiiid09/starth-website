
// Mock data
const mockVenues = [
  {
    id: "1",
    name: "The Grand Hall",
    city: "New York",
    state: "NY",
    featured: true,
    rating: 4.8,
    description: "A magnificent hall for grand events.",
    capacity_max: 500,
    rate_card_json: { base_rate: 5000 },
    amenities: ["WiFi", "Parking", "Catering"],
    status: "active",
    tags: ["wedding", "corporate"],
    insurance_verified: true,
    images: [{ url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=2098&ixlib=rb-4.0.3" }]
  },
  {
    id: "2",
    name: "Sunset Rooftop",
    city: "Los Angeles",
    state: "CA",
    featured: false,
    rating: 4.5,
    description: "Beautiful rooftop with city views.",
    capacity_max: 100,
    rate_card_json: { hourly_rate: 200 },
    amenities: ["Bar", "Audio/Visual"],
    status: "active",
    tags: ["party", "social"],
    insurance_verified: false,
    images: [{ url: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80&w=1974&ixlib=rb-4.0.3" }]
  }
];

const mockServices = [
    {
        id: "s1",
        name: "Premium Catering",
        category: "Catering",
        city: "New York",
        state: "NY",
        description: "Top-notch catering for all events.",
        featured: true,
        status: "active",
        images: [{ url: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3" }]
    }
]

const mockUser = {
  id: "user123",
  email: "demo@example.com",
  full_name: "Demo User",
  roles: ["organizer"]
};

const mockDemoRequests = [
    {
        id: "dr1",
        email: "demo@example.com",
        status: "approved"
    }
]

// Generic mock entity with CRUD methods
const createMockEntity = (name, data = []) => ({
  filter: async (query) => {
    // Simple filter simulation
    return data.filter(item => {
        if (!query) return true;
        // Basic exact match for properties
        return Object.entries(query).every(([key, value]) => {
            if (item[key] === undefined) return false;
            return item[key] === value;
        });
    });
  },
  get: async (id) => data.find(item => item.id === id) || null,
  create: async (payload) => ({ id: Math.random().toString(36).substr(2, 9), ...payload }),
  update: async (id, payload) => ({ id, ...payload }),
  delete: async (id) => true,
  search: async () => data // minimal search mock
});

export const createMockClient = (config) => {
  console.log("Initializing Mock Base44 Client", config);
  
  return {
    entities: {
      Venue: createMockEntity('Venue', mockVenues),
      ServiceProvider: createMockEntity('ServiceProvider', mockServices),
      Event: createMockEntity('Event'),
      DFYLead: createMockEntity('DFYLead'),
      WaitlistSubscriber: createMockEntity('WaitlistSubscriber'),
      Plan: createMockEntity('Plan'),
      Conversation: createMockEntity('Conversation'),
      ConversationParticipant: createMockEntity('ConversationParticipant'),
      Message: createMockEntity('Message'),
      Booking: createMockEntity('Booking'),
      Review: createMockEntity('Review'),
      FeaturedPlacement: createMockEntity('FeaturedPlacement'),
      EventbriteSync: createMockEntity('EventbriteSync'),
      Organization: createMockEntity('Organization'),
      Document: createMockEntity('Document'),
      InsurancePolicy: createMockEntity('InsurancePolicy'),
      Service: createMockEntity('Service', mockServices),
      EventChecklist: createMockEntity('EventChecklist'),
      MarketingCampaign: createMockEntity('MarketingCampaign'),
      Sponsor: createMockEntity('Sponsor'),
      GeneratedCaption: createMockEntity('GeneratedCaption'),
      EventCollaborator: createMockEntity('EventCollaborator'),
      Favorite: createMockEntity('Favorite'),
      Reminder: createMockEntity('Reminder'),
      ContactSubmission: createMockEntity('ContactSubmission'),
      AuthUser: createMockEntity('AuthUser'),
      OTPVerification: createMockEntity('OTPVerification'),
      DemoRequest: createMockEntity('DemoRequest', mockDemoRequests),
    },
    auth: {
      me: async () => {
         // Default to not logged in to see public pages
         return null; 
      },
      login: async () => mockUser,
      logout: async () => {},
      signUp: async () => mockUser
    },
    integrations: {
        Core: {
            InvokeLLM: async () => "Mock LLM Response",
            SendEmail: async () => console.log("Mock Email Sent"),
            UploadFile: async () => ({ url: "https://via.placeholder.com/150" }),
            GenerateImage: async () => ({ url: "https://via.placeholder.com/150" }),
            ExtractDataFromUploadedFile: async () => ({}),
            CreateFileSignedUrl: async () => ({ signedUrl: "https://via.placeholder.com/150" }),
            UploadPrivateFile: async () => ({ url: "https://via.placeholder.com/150" })
        }
    }
  };
};
