import type { AdminAuditLog } from "@/features/admin/types";

export const dummyAuditLogs: AdminAuditLog[] = [
  {
    id: "aud_6001",
    actor: "admin:sierra.woods",
    action: "VENDOR_APPROVED",
    resourceType: "VENDOR",
    resourceId: "vnd_1001",
    timestamp: "2026-01-12T20:14:00.000Z",
    ip: "98.214.121.44",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6_1)",
    metadata: { note: "Tax documentation verified" }
  },
  {
    id: "aud_6002",
    actor: "admin:noah.kim",
    action: "VENDOR_CHANGES_REQUESTED",
    resourceType: "VENDOR",
    resourceId: "vnd_1003",
    timestamp: "2026-01-26T16:45:00.000Z",
    ip: "73.55.82.13",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    metadata: { note: "Insurance certificate expired" }
  },
  {
    id: "aud_6003",
    actor: "admin:olivia.ramirez",
    action: "PAYOUT_HELD",
    resourceType: "PAYOUT",
    resourceId: "pot_4006",
    timestamp: "2026-01-28T06:45:00.000Z",
    ip: "104.132.17.90",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
    metadata: { riskFlag: "mismatched_tax_id" }
  },
  {
    id: "aud_6004",
    actor: "admin:sierra.woods",
    action: "PAYOUT_APPROVED",
    resourceType: "PAYOUT",
    resourceId: "pot_4004",
    timestamp: "2026-02-01T08:22:00.000Z",
    ip: "98.214.121.44",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6_1)"
  },
  {
    id: "aud_6005",
    actor: "system:risk-engine",
    action: "DISPUTE_OPENED",
    resourceType: "DISPUTE",
    resourceId: "dsp_5002",
    timestamp: "2026-01-31T03:05:00.000Z",
    ip: "10.0.0.8",
    userAgent: "risk-engine/2.1.0"
  }
];
