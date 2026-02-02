import type { AdminPayout } from "@/features/admin/types";

export const dummyPayouts: AdminPayout[] = [
  {
    id: "pot_4001",
    vendorId: "vnd_1001",
    bookingId: "bkg_2001",
    paymentId: "pay_3004",
    type: "RESERVATION",
    status: "PAID",
    amountCents: 145800,
    currency: "USD",
    requestedAt: "2025-11-03T13:10:00.000Z",
    updatedAt: "2025-11-04T08:15:00.000Z"
  },
  {
    id: "pot_4002",
    vendorId: "vnd_1004",
    bookingId: "bkg_2004",
    paymentId: "pay_3003",
    type: "RESERVATION",
    status: "PENDING_ADMIN_APPROVAL",
    amountCents: 194400,
    currency: "USD",
    requestedAt: "2026-02-01T23:15:00.000Z",
    updatedAt: "2026-02-01T23:15:00.000Z"
  },
  {
    id: "pot_4003",
    vendorId: "vnd_1002",
    bookingId: "bkg_2002",
    paymentId: "pay_3001",
    type: "FINAL",
    status: "REQUESTED",
    amountCents: 563200,
    currency: "USD",
    requestedAt: "2026-01-31T10:02:00.000Z",
    updatedAt: "2026-01-31T10:02:00.000Z"
  },
  {
    id: "pot_4004",
    vendorId: "vnd_1005",
    bookingId: "bkg_2005",
    paymentId: "pay_3002",
    type: "RESERVATION",
    status: "APPROVED",
    amountCents: 105300,
    currency: "USD",
    requestedAt: "2026-01-31T21:00:00.000Z",
    updatedAt: "2026-02-01T08:22:00.000Z"
  },
  {
    id: "pot_4005",
    vendorId: "vnd_1004",
    bookingId: "bkg_2007",
    paymentId: "pay_3005",
    type: "FINAL",
    status: "REVERSED",
    amountCents: 137700,
    currency: "USD",
    requestedAt: "2026-01-08T14:11:00.000Z",
    updatedAt: "2026-01-12T09:35:00.000Z"
  },
  {
    id: "pot_4006",
    vendorId: "vnd_1003",
    bookingId: "bkg_2003",
    paymentId: "pay_3002",
    type: "RESERVATION",
    status: "HELD",
    amountCents: 124200,
    currency: "USD",
    requestedAt: "2026-01-25T19:30:00.000Z",
    updatedAt: "2026-01-28T06:45:00.000Z"
  }
];
