import type { AdminVendor } from "@/features/admin/types";

export const dummyVendors: AdminVendor[] = [
  {
    id: "vnd_1001",
    displayName: "Harborlight Loft",
    subtype: "VENUE_OWNER",
    verificationState: "APPROVED",
    contactName: "Ari Bennett",
    contactEmail: "ops@harborlightloft.com",
    contactPhone: "+1-415-555-0101",
    city: "San Francisco",
    state: "CA",
    createdAt: "2025-09-11T17:18:00.000Z",
    updatedAt: "2026-01-12T20:14:00.000Z",
    payoutEnabled: true,
    rating: 4.8,
    completedBookings: 61,
    venueDetails: {
      squareFeet: 8500,
      venueType: "Industrial Loft",
      address: "200 Embarcadero St, San Francisco, CA 94111",
      capacityNotes: "Ideal for 220 seated guests, up to 300 standing with mixed lounge layout."
    },
    submission: {
      submittedAt: "2025-09-11T17:18:00.000Z",
      submittedBy: "Ari Bennett",
      documents: ["Business license", "COI", "W-9"],
      lastUpdatedAt: "2026-01-12T20:14:00.000Z"
    }
  },
  {
    id: "vnd_1002",
    displayName: "Copper Fern Catering",
    subtype: "SERVICE_PROVIDER",
    verificationState: "PENDING",
    contactName: "Mina Doyle",
    contactEmail: "mina@copperfern.co",
    contactPhone: "+1-312-555-0102",
    city: "Chicago",
    state: "IL",
    createdAt: "2025-12-03T09:40:00.000Z",
    updatedAt: "2026-01-30T14:22:00.000Z",
    payoutEnabled: false,
    rating: 0,
    completedBookings: 0,
    serviceDetails: {
      categories: ["Catering", "Beverage Service", "Dessert Stations"],
      serviceAreas: ["Chicago", "Evanston", "Oak Park", "Naperville"]
    },
    submission: {
      submittedAt: "2025-12-03T09:40:00.000Z",
      submittedBy: "Mina Doyle",
      documents: ["Business license", "ServSafe certificate", "W-9"],
      lastUpdatedAt: "2026-01-30T14:22:00.000Z"
    }
  },
  {
    id: "vnd_1003",
    displayName: "Atlas Stageworks",
    subtype: "SERVICE_PROVIDER",
    verificationState: "NEEDS_CHANGES",
    contactName: "Jon Park",
    contactEmail: "hello@atlasstageworks.com",
    contactPhone: "+1-646-555-0103",
    city: "New York",
    state: "NY",
    createdAt: "2025-10-21T13:55:00.000Z",
    updatedAt: "2026-01-26T16:45:00.000Z",
    payoutEnabled: false,
    rating: 4.3,
    completedBookings: 12,
    serviceDetails: {
      categories: ["AV Production", "Stage Design", "Lighting"],
      serviceAreas: ["Manhattan", "Brooklyn", "Jersey City"]
    },
    submission: {
      submittedAt: "2025-10-21T13:55:00.000Z",
      submittedBy: "Jon Park",
      documents: ["Business license", "Insurance certificate"],
      lastUpdatedAt: "2026-01-26T16:45:00.000Z",
      note: "Please upload a renewed insurance certificate with valid expiration date."
    }
  },
  {
    id: "vnd_1004",
    displayName: "Juniper Hall",
    subtype: "VENUE_OWNER",
    verificationState: "DISABLED_PAYOUT",
    contactName: "Priya Shah",
    contactEmail: "finance@juniperhall.events",
    contactPhone: "+1-206-555-0104",
    city: "Seattle",
    state: "WA",
    createdAt: "2025-07-08T11:20:00.000Z",
    updatedAt: "2026-01-29T18:08:00.000Z",
    payoutEnabled: false,
    rating: 4.6,
    completedBookings: 44,
    venueDetails: {
      squareFeet: 10200,
      venueType: "Modern Ballroom",
      address: "98 Cedar Ave, Seattle, WA 98101",
      capacityNotes: "300 banquet style, 420 standing; strict sound limit after 10:00 PM."
    },
    submission: {
      submittedAt: "2025-07-08T11:20:00.000Z",
      submittedBy: "Priya Shah",
      documents: ["Business license", "COI", "W-9", "Void check"],
      lastUpdatedAt: "2026-01-29T18:08:00.000Z",
      note: "Payouts disabled due to banking mismatch under review."
    }
  },
  {
    id: "vnd_1005",
    displayName: "Bluebird AV Collective",
    subtype: "SERVICE_PROVIDER",
    verificationState: "APPROVED",
    contactName: "Evan Cole",
    contactEmail: "team@bluebirdav.io",
    contactPhone: "+1-512-555-0105",
    city: "Austin",
    state: "TX",
    createdAt: "2025-08-14T10:02:00.000Z",
    updatedAt: "2026-01-17T07:50:00.000Z",
    payoutEnabled: true,
    rating: 4.9,
    completedBookings: 83,
    serviceDetails: {
      categories: ["Live Audio", "LED Walls", "Hybrid Streaming"],
      serviceAreas: ["Austin", "Round Rock", "San Marcos"]
    },
    submission: {
      submittedAt: "2025-08-14T10:02:00.000Z",
      submittedBy: "Evan Cole",
      documents: ["Business license", "COI", "W-9"],
      lastUpdatedAt: "2026-01-17T07:50:00.000Z"
    }
  },
  {
    id: "vnd_1006",
    displayName: "Granite Ridge Pavilion",
    subtype: "VENUE_OWNER",
    verificationState: "PENDING",
    contactName: "Lena Morris",
    contactEmail: "admin@graniteridgepavilion.com",
    contactPhone: "+1-303-555-0106",
    city: "Denver",
    state: "CO",
    createdAt: "2026-01-18T12:28:00.000Z",
    updatedAt: "2026-01-31T09:31:00.000Z",
    payoutEnabled: false,
    rating: 0,
    completedBookings: 0,
    venueDetails: {
      squareFeet: 6200,
      venueType: "Mountain Pavilion",
      address: "14 Aspen Ridge Rd, Denver, CO 80203",
      capacityNotes: "180 seated or 260 standing; weather contingency tent available."
    },
    submission: {
      submittedAt: "2026-01-18T12:28:00.000Z",
      submittedBy: "Lena Morris",
      documents: ["Business license", "Temporary event permit"],
      lastUpdatedAt: "2026-01-31T09:31:00.000Z"
    }
  }
];
