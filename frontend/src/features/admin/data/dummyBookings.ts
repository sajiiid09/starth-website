import type { AdminBooking } from "@/features/admin/types";

export const dummyBookings: AdminBooking[] = [
  {
    id: "bkg_2001",
    vendorId: "vnd_1001",
    customerId: "cus_9001",
    eventName: "Fintech Growth Summit",
    state: "COMPLETED",
    venueCity: "San Francisco",
    startsAt: "2025-12-10T16:00:00.000Z",
    endsAt: "2025-12-10T23:30:00.000Z",
    totalAmountCents: 540000,
    createdAt: "2025-11-02T18:10:00.000Z",
    updatedAt: "2025-12-11T01:40:00.000Z"
  },
  {
    id: "bkg_2002",
    vendorId: "vnd_1002",
    customerId: "cus_9002",
    eventName: "Northside Wedding Reception",
    state: "READY_FOR_PAYMENT",
    venueCity: "Chicago",
    startsAt: "2026-03-21T19:00:00.000Z",
    endsAt: "2026-03-22T02:00:00.000Z",
    totalAmountCents: 880000,
    createdAt: "2026-01-28T12:00:00.000Z",
    updatedAt: "2026-01-30T08:34:00.000Z"
  },
  {
    id: "bkg_2003",
    vendorId: "vnd_1003",
    customerId: "cus_9003",
    eventName: "Product Launch Night",
    state: "COUNTERED",
    venueCity: "New York",
    startsAt: "2026-02-20T22:00:00.000Z",
    endsAt: "2026-02-21T03:00:00.000Z",
    totalAmountCents: 460000,
    createdAt: "2026-01-21T09:12:00.000Z",
    updatedAt: "2026-01-24T16:02:00.000Z"
  },
  {
    id: "bkg_2004",
    vendorId: "vnd_1004",
    customerId: "cus_9004",
    eventName: "Healthcare Leadership Offsite",
    state: "ACTIVE",
    venueCity: "Seattle",
    startsAt: "2026-02-02T17:30:00.000Z",
    endsAt: "2026-02-03T00:30:00.000Z",
    totalAmountCents: 720000,
    createdAt: "2025-12-22T13:35:00.000Z",
    updatedAt: "2026-02-02T17:32:00.000Z"
  },
  {
    id: "bkg_2005",
    vendorId: "vnd_1005",
    customerId: "cus_9005",
    eventName: "Startup Demo Day",
    state: "VENDOR_APPROVED",
    venueCity: "Austin",
    startsAt: "2026-02-26T18:00:00.000Z",
    endsAt: "2026-02-27T00:00:00.000Z",
    totalAmountCents: 390000,
    createdAt: "2026-01-29T19:18:00.000Z",
    updatedAt: "2026-01-31T20:50:00.000Z"
  },
  {
    id: "bkg_2006",
    vendorId: "vnd_1006",
    customerId: "cus_9006",
    eventName: "Mountain Education Gala",
    state: "CREATED",
    venueCity: "Denver",
    startsAt: "2026-04-11T23:00:00.000Z",
    endsAt: "2026-04-12T04:00:00.000Z",
    totalAmountCents: 610000,
    createdAt: "2026-01-31T07:45:00.000Z",
    updatedAt: "2026-01-31T07:45:00.000Z"
  },
  {
    id: "bkg_2007",
    vendorId: "vnd_1001",
    customerId: "cus_9007",
    eventName: "Summer Brand Retreat",
    state: "CANCELED",
    venueCity: "San Francisco",
    startsAt: "2026-01-15T20:00:00.000Z",
    endsAt: "2026-01-16T03:00:00.000Z",
    totalAmountCents: 510000,
    createdAt: "2025-12-28T10:42:00.000Z",
    updatedAt: "2026-01-10T12:00:00.000Z"
  }
];
