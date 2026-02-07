import type { AdminDispute } from "@/features/admin/types";

export const dummyDisputes: AdminDispute[] = [
  {
    id: "dsp_5001",
    bookingId: "bkg_2001",
    vendorId: "vnd_1001",
    reason: "Guest count exceeded contracted occupancy by 48 attendees.",
    status: "RESOLVED",
    createdAt: "2025-12-12T07:22:00.000Z",
    updatedAt: "2025-12-15T13:55:00.000Z"
  },
  {
    id: "dsp_5002",
    bookingId: "bkg_2004",
    vendorId: "vnd_1004",
    reason: "Chargeback filed after event due to alleged AV failure.",
    status: "UNDER_REVIEW",
    createdAt: "2026-01-31T03:05:00.000Z",
    updatedAt: "2026-02-01T19:40:00.000Z"
  },
  {
    id: "dsp_5003",
    bookingId: "bkg_2007",
    vendorId: "vnd_1001",
    reason: "Cancellation fee disputed due to weather emergency claim.",
    status: "OPEN",
    createdAt: "2026-01-11T15:10:00.000Z",
    updatedAt: "2026-01-11T15:10:00.000Z"
  }
];
