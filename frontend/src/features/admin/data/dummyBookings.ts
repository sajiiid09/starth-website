import type { AdminBooking } from "@/features/admin/types";

export const dummyBookings: AdminBooking[] = [
  {
    id: "bkg_2001",
    vendorId: "vnd_1001",
    vendorName: "Harborlight Loft",
    customerId: "cus_9001",
    organizerName: "Fintech Forward",
    eventName: "Fintech Growth Summit",
    state: "COMPLETED",
    venueCity: "San Francisco",
    startsAt: "2025-12-10T16:00:00.000Z",
    endsAt: "2025-12-10T23:30:00.000Z",
    totalAmountCents: 540000,
    milestones: [
      {
        id: "mil_2001_1",
        label: "Booking created",
        description: "Organizer submitted event requirements.",
        timestamp: "2025-11-02T18:10:00.000Z"
      },
      {
        id: "mil_2001_2",
        label: "Vendor approved",
        description: "Vendor accepted terms and pricing.",
        timestamp: "2025-11-03T09:20:00.000Z"
      },
      {
        id: "mil_2001_3",
        label: "Reservation paid",
        description: "Initial payment captured successfully.",
        timestamp: "2025-11-03T11:01:00.000Z"
      },
      {
        id: "mil_2001_4",
        label: "Event completed",
        description: "Event completed without incidents.",
        timestamp: "2025-12-11T01:40:00.000Z"
      }
    ],
    createdAt: "2025-11-02T18:10:00.000Z",
    updatedAt: "2025-12-11T01:40:00.000Z"
  },
  {
    id: "bkg_2002",
    vendorId: "vnd_1002",
    vendorName: "Copper Fern Catering",
    customerId: "cus_9002",
    organizerName: "Nora & Ellis Wedding",
    eventName: "Northside Wedding Reception",
    state: "READY_FOR_PAYMENT",
    venueCity: "Chicago",
    startsAt: "2026-03-21T19:00:00.000Z",
    endsAt: "2026-03-22T02:00:00.000Z",
    totalAmountCents: 880000,
    milestones: [
      {
        id: "mil_2002_1",
        label: "Booking created",
        description: "Organizer requested catering and staffing.",
        timestamp: "2026-01-28T12:00:00.000Z"
      },
      {
        id: "mil_2002_2",
        label: "Vendor approved",
        description: "Vendor approved custom menu quote.",
        timestamp: "2026-01-30T08:34:00.000Z"
      }
    ],
    createdAt: "2026-01-28T12:00:00.000Z",
    updatedAt: "2026-01-30T08:34:00.000Z"
  },
  {
    id: "bkg_2003",
    vendorId: "vnd_1003",
    vendorName: "Atlas Stageworks",
    customerId: "cus_9003",
    organizerName: "Prism Labs",
    eventName: "Product Launch Night",
    state: "COUNTERED",
    venueCity: "New York",
    startsAt: "2026-02-20T22:00:00.000Z",
    endsAt: "2026-02-21T03:00:00.000Z",
    totalAmountCents: 460000,
    milestones: [
      {
        id: "mil_2003_1",
        label: "Booking created",
        description: "Organizer requested stage build and streaming.",
        timestamp: "2026-01-21T09:12:00.000Z"
      },
      {
        id: "mil_2003_2",
        label: "Counter offer submitted",
        description: "Vendor countered with revised crew hours.",
        timestamp: "2026-01-24T16:02:00.000Z"
      }
    ],
    createdAt: "2026-01-21T09:12:00.000Z",
    updatedAt: "2026-01-24T16:02:00.000Z"
  },
  {
    id: "bkg_2004",
    vendorId: "vnd_1004",
    vendorName: "Juniper Hall",
    customerId: "cus_9004",
    organizerName: "Asteria Health",
    eventName: "Healthcare Leadership Offsite",
    state: "ACTIVE",
    venueCity: "Seattle",
    startsAt: "2026-02-02T17:30:00.000Z",
    endsAt: "2026-02-03T00:30:00.000Z",
    totalAmountCents: 720000,
    milestones: [
      {
        id: "mil_2004_1",
        label: "Booking created",
        description: "Organizer secured venue with breakout rooms.",
        timestamp: "2025-12-22T13:35:00.000Z"
      },
      {
        id: "mil_2004_2",
        label: "Ready for payment",
        description: "Contract accepted and invoice issued.",
        timestamp: "2026-01-30T17:50:00.000Z"
      },
      {
        id: "mil_2004_3",
        label: "Event active",
        description: "Event currently in progress.",
        timestamp: "2026-02-02T17:32:00.000Z"
      }
    ],
    createdAt: "2025-12-22T13:35:00.000Z",
    updatedAt: "2026-02-02T17:32:00.000Z"
  },
  {
    id: "bkg_2005",
    vendorId: "vnd_1005",
    vendorName: "Bluebird AV Collective",
    customerId: "cus_9005",
    organizerName: "ScaleUp Ventures",
    eventName: "Startup Demo Day",
    state: "VENDOR_APPROVED",
    venueCity: "Austin",
    startsAt: "2026-02-26T18:00:00.000Z",
    endsAt: "2026-02-27T00:00:00.000Z",
    totalAmountCents: 390000,
    milestones: [
      {
        id: "mil_2005_1",
        label: "Booking created",
        description: "Organizer requested full AV package.",
        timestamp: "2026-01-29T19:18:00.000Z"
      },
      {
        id: "mil_2005_2",
        label: "Vendor approved",
        description: "Vendor approved package and timeline.",
        timestamp: "2026-01-31T20:50:00.000Z"
      }
    ],
    createdAt: "2026-01-29T19:18:00.000Z",
    updatedAt: "2026-01-31T20:50:00.000Z"
  },
  {
    id: "bkg_2006",
    vendorId: "vnd_1006",
    vendorName: "Granite Ridge Pavilion",
    customerId: "cus_9006",
    organizerName: "Mountain Education Fund",
    eventName: "Mountain Education Gala",
    state: "CREATED",
    venueCity: "Denver",
    startsAt: "2026-04-11T23:00:00.000Z",
    endsAt: "2026-04-12T04:00:00.000Z",
    totalAmountCents: 610000,
    milestones: [
      {
        id: "mil_2006_1",
        label: "Booking created",
        description: "Initial request submitted.",
        timestamp: "2026-01-31T07:45:00.000Z"
      }
    ],
    createdAt: "2026-01-31T07:45:00.000Z",
    updatedAt: "2026-01-31T07:45:00.000Z"
  },
  {
    id: "bkg_2007",
    vendorId: "vnd_1001",
    vendorName: "Harborlight Loft",
    customerId: "cus_9007",
    organizerName: "West Harbor Brands",
    eventName: "Summer Brand Retreat",
    state: "CANCELED",
    venueCity: "San Francisco",
    startsAt: "2026-01-15T20:00:00.000Z",
    endsAt: "2026-01-16T03:00:00.000Z",
    totalAmountCents: 510000,
    cancellationReason: "Organizer canceled due to severe weather advisory.",
    canceledAt: "2026-01-10T12:00:00.000Z",
    milestones: [
      {
        id: "mil_2007_1",
        label: "Booking created",
        description: "Organizer reserved venue for retreat.",
        timestamp: "2025-12-28T10:42:00.000Z"
      },
      {
        id: "mil_2007_2",
        label: "Booking canceled",
        description: "Canceled ahead of event date.",
        timestamp: "2026-01-10T12:00:00.000Z"
      }
    ],
    createdAt: "2025-12-28T10:42:00.000Z",
    updatedAt: "2026-01-10T12:00:00.000Z"
  }
];
