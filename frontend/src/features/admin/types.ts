export type VendorSubtype = "VENUE_OWNER" | "SERVICE_PROVIDER";

export type AdminVendorVerificationState =
  | "PENDING"
  | "APPROVED"
  | "NEEDS_CHANGES"
  | "DISABLED_PAYOUT";

export type AdminBookingLifecycleState =
  | "CREATED"
  | "VENDOR_APPROVED"
  | "COUNTERED"
  | "READY_FOR_PAYMENT"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELED";

export type AdminPaymentStatus =
  | "REQUIRES_PAYMENT_METHOD"
  | "REQUIRES_CONFIRMATION"
  | "PROCESSING"
  | "SUCCEEDED"
  | "CANCELED";

export type AdminPayoutType = "RESERVATION" | "FINAL";

export type AdminPayoutStatus =
  | "REQUESTED"
  | "PENDING_ADMIN_APPROVAL"
  | "APPROVED"
  | "HELD"
  | "PAID"
  | "REVERSED";

export type AdminDisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";

export type AdminVendor = {
  id: string;
  displayName: string;
  subtype: VendorSubtype;
  verificationState: AdminVendorVerificationState;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  payoutEnabled: boolean;
  rating: number;
  completedBookings: number;
};

export type AdminBooking = {
  id: string;
  vendorId: string;
  customerId: string;
  eventName: string;
  state: AdminBookingLifecycleState;
  venueCity: string;
  startsAt: string;
  endsAt: string;
  totalAmountCents: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminPayment = {
  id: string;
  bookingId: string;
  customerId: string;
  amountCents: number;
  currency: string;
  status: AdminPaymentStatus;
  paymentMethodType: "card" | "bank_transfer";
  externalRef: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminPayout = {
  id: string;
  vendorId: string;
  bookingId: string;
  paymentId: string;
  type: AdminPayoutType;
  status: AdminPayoutStatus;
  amountCents: number;
  currency: string;
  requestedAt: string;
  updatedAt: string;
};

export type AdminAuditLog = {
  id: string;
  actor: string;
  action: string;
  resourceType: "VENDOR" | "BOOKING" | "PAYMENT" | "PAYOUT" | "DISPUTE";
  resourceId: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
};

export type AdminDispute = {
  id: string;
  bookingId: string;
  vendorId: string;
  reason: string;
  status: AdminDisputeStatus;
  createdAt: string;
  updatedAt: string;
};

export type VendorListFilters = {
  verificationState?: AdminVendorVerificationState;
  subtype?: VendorSubtype;
  query?: string;
};

export type UpdateVendorVerificationInput = {
  vendorId: string;
  note?: string;
};

export type UpdatePayoutStatusInput = {
  payoutId: string;
  note?: string;
};

export type ResolveDisputeInput = {
  disputeId: string;
  resolution: "RESOLVED" | "REJECTED";
  note?: string;
};

export type AdminService = {
  listVendors: (filters?: VendorListFilters) => Promise<AdminVendor[]>;
  approveVendor: (input: UpdateVendorVerificationInput) => Promise<AdminVendor>;
  requestVendorChanges: (input: UpdateVendorVerificationInput) => Promise<AdminVendor>;
  disableVendorPayout: (input: UpdateVendorVerificationInput) => Promise<AdminVendor>;
  listBookings: () => Promise<AdminBooking[]>;
  listPayments: () => Promise<AdminPayment[]>;
  listPayouts: () => Promise<AdminPayout[]>;
  approvePayout: (input: UpdatePayoutStatusInput) => Promise<AdminPayout>;
  holdPayout: (input: UpdatePayoutStatusInput) => Promise<AdminPayout>;
  listAuditLogs: () => Promise<AdminAuditLog[]>;
  listDisputes: () => Promise<AdminDispute[]>;
  resolveDispute: (input: ResolveDisputeInput) => Promise<AdminDispute>;
};
