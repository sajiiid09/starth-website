import type { AdminPayment } from "@/features/admin/types";

export const dummyPayments: AdminPayment[] = [
  {
    id: "pay_3001",
    bookingId: "bkg_2002",
    customerId: "cus_9002",
    amountCents: 264000,
    currency: "USD",
    status: "REQUIRES_PAYMENT_METHOD",
    paymentMethodType: "card",
    providerRef: "pi_mock_3001",
    createdAt: "2026-01-30T08:40:00.000Z",
    updatedAt: "2026-01-30T08:40:00.000Z"
  },
  {
    id: "pay_3002",
    bookingId: "bkg_2003",
    customerId: "cus_9003",
    amountCents: 138000,
    currency: "USD",
    status: "REQUIRES_CONFIRMATION",
    paymentMethodType: "card",
    providerRef: "pi_mock_3002",
    createdAt: "2026-01-24T16:10:00.000Z",
    updatedAt: "2026-01-24T16:40:00.000Z"
  },
  {
    id: "pay_3003",
    bookingId: "bkg_2004",
    customerId: "cus_9004",
    amountCents: 216000,
    currency: "USD",
    status: "PROCESSING",
    paymentMethodType: "bank_transfer",
    providerRef: "pi_mock_3003",
    createdAt: "2026-02-01T22:00:00.000Z",
    updatedAt: "2026-02-01T22:05:00.000Z"
  },
  {
    id: "pay_3004",
    bookingId: "bkg_2001",
    customerId: "cus_9001",
    amountCents: 162000,
    currency: "USD",
    status: "SUCCEEDED",
    paymentMethodType: "card",
    providerRef: "pi_mock_3004",
    createdAt: "2025-11-03T11:00:00.000Z",
    updatedAt: "2025-11-03T11:01:00.000Z"
  },
  {
    id: "pay_3005",
    bookingId: "bkg_2007",
    customerId: "cus_9007",
    amountCents: 153000,
    currency: "USD",
    status: "CANCELED",
    paymentMethodType: "card",
    providerRef: "pi_mock_3005",
    createdAt: "2025-12-29T14:00:00.000Z",
    updatedAt: "2026-01-10T12:02:00.000Z"
  },
  {
    id: "pay_3006",
    bookingId: "bkg_2005",
    customerId: "cus_9005",
    amountCents: 117000,
    currency: "USD",
    status: "SUCCEEDED",
    paymentMethodType: "card",
    providerRef: "pi_mock_3006",
    createdAt: "2026-01-31T20:20:00.000Z",
    updatedAt: "2026-01-31T20:21:00.000Z"
  }
];
