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
  | "CANCELED"
  | "CORRECTED";

export type AdminPayoutType = "RESERVATION" | "FINAL";

export type AdminPayoutStatus =
  | "REQUESTED"
  | "PENDING_ADMIN_APPROVAL"
  | "APPROVED"
  | "HELD"
  | "PAID"
  | "REVERSED";

export type AdminDisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";
export type AdminResourceType = "VENDOR" | "BOOKING" | "PAYMENT" | "PAYOUT" | "DISPUTE";

export type VendorVenueOwnerDetails = {
  squareFeet: number;
  venueType: string;
  address: string;
  capacityNotes: string;
};

export type VendorServiceProviderDetails = {
  categories: string[];
  serviceAreas: string[];
};

export type VendorVerificationSubmissionMetadata = {
  submittedAt: string;
  submittedBy: string;
  documents: string[];
  lastUpdatedAt: string;
  note?: string;
};

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
  venueDetails?: VendorVenueOwnerDetails;
  serviceDetails?: VendorServiceProviderDetails;
  submission: VendorVerificationSubmissionMetadata;
};

export type BookingMilestone = {
  id: string;
  label: string;
  description: string;
  timestamp: string;
};

export type AdminBooking = {
  id: string;
  vendorId: string;
  vendorName: string;
  customerId: string;
  organizerName: string;
  eventName: string;
  state: AdminBookingLifecycleState;
  venueCity: string;
  startsAt: string;
  endsAt: string;
  totalAmountCents: number;
  cancellationReason?: string;
  canceledAt?: string;
  milestones: BookingMilestone[];
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
  providerRef: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminPayout = {
  id: string;
  vendorId: string;
  vendorName: string;
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
  resourceType: AdminResourceType;
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
  status?: AdminVendorVerificationState;
  q?: string;
};

export type BookingListFilters = {
  status?: AdminBookingLifecycleState;
  q?: string;
};

export type PaymentListFilters = {
  status?: AdminPaymentStatus;
  q?: string;
};

export type PayoutListFilters = {
  status?: AdminPayoutStatus;
  q?: string;
};

export type AuditLogFilters = {
  q?: string;
  action?: string;
  resourceType?: AdminResourceType;
};

export type DisputeListFilters = {
  status?: AdminDisputeStatus;
};

export type ApprovePayoutInput = {
  confirm: true;
};

export type FinanceOverview = {
  totalHeldFundsCents: number;
  totalPaidOutCents: number;
  pendingPayoutsCount: number;
  activeBookingsThisMonth: number;
  recentActivity: AdminAuditLog[];
};

export type FinanceLedgerEntry = {
  id: string;
  label: string;
  category: "HELD" | "RELEASED" | "PAYMENT" | "REVERSAL";
  amountCents: number;
  occurredAt: string;
};

export type BookingFinanceSummary = {
  bookingId: string;
  bookingTotalCents: number;
  payment: AdminPayment | null;
  payouts: AdminPayout[];
  heldFundsCents: number;
  releasedFundsCents: number;
  reversedFundsCents: number;
  ledger: FinanceLedgerEntry[];
};

export type ResolveDisputeInput = {
  disputeId: string;
  resolution: "RESOLVED" | "REJECTED";
  note?: string;
};

export type AdminService = {
  listVendors: (filters?: VendorListFilters) => Promise<AdminVendor[]>;
  getVendor: (vendorId: string) => Promise<AdminVendor>;
  approveVendor: (vendorId: string) => Promise<AdminVendor>;
  needsChangesVendor: (vendorId: string, note: string) => Promise<AdminVendor>;
  disableVendorPayout: (vendorId: string, reason?: string) => Promise<AdminVendor>;

  listBookings: (filters?: BookingListFilters) => Promise<AdminBooking[]>;
  getBooking: (bookingId: string) => Promise<AdminBooking>;
  listPayments: (filters?: PaymentListFilters) => Promise<AdminPayment[]>;
  listPayouts: (filters?: PayoutListFilters) => Promise<AdminPayout[]>;
  approvePayout: (payoutId: string, input: ApprovePayoutInput) => Promise<AdminPayout>;
  holdPayout: (payoutId: string, reason?: string) => Promise<AdminPayout>;
  reversePayout: (payoutId: string, reason?: string) => Promise<AdminPayout>;
  getFinanceOverview: () => Promise<FinanceOverview>;
  getBookingFinanceSummary: (bookingId: string) => Promise<BookingFinanceSummary>;

  listAuditLogs: (filters?: AuditLogFilters) => Promise<AdminAuditLog[]>;
  listDisputes: (filters?: DisputeListFilters) => Promise<AdminDispute[]>;
  getDispute: (disputeId: string) => Promise<AdminDispute>;
  updateDisputeStatus: (disputeId: string, status: AdminDisputeStatus) => Promise<AdminDispute>;
  holdPayoutsForBooking: (bookingId: string, reason?: string) => Promise<AdminPayout[]>;
  opsResetDummyData: () => Promise<{ resetAt: string }>;
  opsReconcileDummyPayments: () => Promise<{ paymentId: string; status: AdminPaymentStatus }>;

  resolveDispute: (input: ResolveDisputeInput) => Promise<AdminDispute>;
};
