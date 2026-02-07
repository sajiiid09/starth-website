import React from "react";
import { toast } from "sonner";
import { MagnifyingGlass, Warning } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useAdminQuery } from "@/features/admin/hooks/useAdminQuery";
import { useAdminMutation } from "@/features/admin/hooks/useAdminMutation";
import { isAdminReadOnly } from "@/features/admin/config";
import { adminService } from "@/features/admin/services/adminService";
import type { AdminPayout, AdminPayoutStatus } from "@/features/admin/types";

type PayoutTab = "PENDING" | "HELD" | "APPROVED_PAID";

const tabItems: { label: string; value: PayoutTab }[] = [
  { label: "Pending admin approval", value: "PENDING" },
  { label: "Held", value: "HELD" },
  { label: "Approved / paid", value: "APPROVED_PAID" }
];

const statusClass: Record<AdminPayoutStatus, string> = {
  REQUESTED: "bg-amber-100 text-amber-700 border-amber-200",
  PENDING_ADMIN_APPROVAL: "bg-amber-100 text-amber-700 border-amber-200",
  HELD: "bg-orange-100 text-orange-700 border-orange-200",
  APPROVED: "bg-blue-100 text-blue-700 border-blue-200",
  PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REVERSED: "bg-red-100 text-red-700 border-red-200"
};

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value / 100);

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });

const statusLabel = (value: string) => value.replace(/_/g, " ").toLowerCase();

const isPendingStatus = (status: AdminPayoutStatus) => status === "REQUESTED" || status === "PENDING_ADMIN_APPROVAL";

const tabFilter = (tab: PayoutTab, status: AdminPayoutStatus) => {
  if (tab === "PENDING") return isPendingStatus(status);
  if (tab === "HELD") return status === "HELD";
  return status === "APPROVED" || status === "PAID";
};

const TableSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="grid grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, col) => (
            <Skeleton key={col} className="h-8 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
};

const AdminPayouts: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<PayoutTab>("PENDING");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<AdminPayout | null>(null);
  const [holdOpen, setHoldOpen] = React.useState(false);
  const [reverseOpen, setReverseOpen] = React.useState(false);
  const [holdReason, setHoldReason] = React.useState("");
  const [reverseReason, setReverseReason] = React.useState("");
  const [approveOpen, setApproveOpen] = React.useState(false);

  const { data, isLoading, error, refetch } = useAdminQuery(
    () => adminService.listPayouts({ q: query || undefined }),
    [query]
  );

  const approveMutation = useAdminMutation<string, AdminPayout>((payoutId) =>
    adminService.approvePayout(payoutId, { confirm: true })
  );

  const holdMutation = useAdminMutation<{ payoutId: string; reason?: string }, AdminPayout>(({ payoutId, reason }) =>
    adminService.holdPayout(payoutId, reason)
  );

  const reverseMutation = useAdminMutation<{ payoutId: string; reason?: string }, AdminPayout>(
    ({ payoutId, reason }) => adminService.reversePayout(payoutId, reason)
  );

  const filtered = React.useMemo(() => {
    const payouts = data ?? [];
    return payouts.filter((item) => tabFilter(activeTab, item.status));
  }, [data, activeTab]);

  const isBusy = approveMutation.isLoading || holdMutation.isLoading || reverseMutation.isLoading;

  const handleApprove = async () => {
    if (!selected) return;
    if (isAdminReadOnly) return;
    try {
      await approveMutation.mutate(selected.id);
      toast.success("Payout approved");
      setApproveOpen(false);
      setSelected(null);
      await refetch();
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : "Failed to approve payout");
    }
  };

  const handleHold = async () => {
    if (!selected) return;
    if (isAdminReadOnly) return;
    try {
      await holdMutation.mutate({
        payoutId: selected.id,
        reason: holdReason.trim() || undefined
      });
      toast.success("Payout moved to held state");
      setHoldOpen(false);
      setHoldReason("");
      setSelected(null);
      await refetch();
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : "Failed to hold payout");
    }
  };

  const handleReverse = async () => {
    if (!selected) return;
    if (isAdminReadOnly) return;
    try {
      await reverseMutation.mutate({
        payoutId: selected.id,
        reason: reverseReason.trim() || undefined
      });
      toast.success("Payout reversed");
      setReverseOpen(false);
      setReverseReason("");
      setSelected(null);
      await refetch();
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : "Failed to reverse payout");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">Finance</p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Payout queue</h1>
        <p className="mt-2 text-sm text-gray-600">
          Controlled payouts: hold funds until approved, then release reservation or final payout.
        </p>
      </div>

      <Card className="border-none shadow-soft">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PayoutTab)}>
              <TabsList className="flex h-auto flex-wrap gap-1 bg-gray-100 p-1">
                {tabItems.map((item) => (
                  <TabsTrigger key={item.value} value={item.value} className="text-xs sm:text-sm">
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="relative w-full lg:w-80">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by payout, vendor, booking"
                className="pl-9"
              />
            </div>
          </div>

          {isLoading && <TableSkeleton />}

          {!isLoading && error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              Failed to load payout queue. {error.message}
              <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-600">
              No payouts in this queue.
            </div>
          )}

          {!isLoading && !error && filtered.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payout ID</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-medium">{payout.id}</TableCell>
                    <TableCell>{payout.vendorName}</TableCell>
                    <TableCell>{payout.bookingId}</TableCell>
                    <TableCell>{payout.type.toLowerCase()}</TableCell>
                    <TableCell>{currency(payout.amountCents)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusClass[payout.status]}>
                        {statusLabel(payout.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{dateTime(payout.requestedAt)}</TableCell>
                    <TableCell className="text-right">
                      {isPendingStatus(payout.status) ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelected(payout);
                              setApproveOpen(true);
                            }}
                            disabled={isBusy || isAdminReadOnly}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelected(payout);
                              setHoldOpen(true);
                            }}
                            disabled={isBusy || isAdminReadOnly}
                          >
                            Hold
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelected(payout);
                              setReverseOpen(true);
                            }}
                            disabled={isBusy || isAdminReadOnly}
                          >
                            Reverse
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">No actions</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve payout release?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move funds from held to released for the vendor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleApprove()} disabled={isAdminReadOnly}>
              Approve payout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={holdOpen} onOpenChange={setHoldOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hold payout</DialogTitle>
            <DialogDescription>Add an optional reason for audit history and risk review.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={holdReason}
            onChange={(event) => setHoldReason(event.target.value)}
            placeholder="Optional reason"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setHoldOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleHold()} disabled={holdMutation.isLoading || isAdminReadOnly}>
              Hold payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={reverseOpen} onOpenChange={setReverseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Warning className="size-4 text-red-600" />
              Reverse payout?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Reversal is a dangerous action. Add context for why funds should not be released.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={reverseReason}
            onChange={(event) => setReverseReason(event.target.value)}
            placeholder="Optional reversal reason"
            rows={4}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleReverse()} disabled={isAdminReadOnly}>
              Reverse payout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPayouts;
