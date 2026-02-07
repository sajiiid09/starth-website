import React from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Warning, ArrowLeft } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
import { useAdminQuery } from "@/features/admin/hooks/useAdminQuery";
import { useAdminMutation } from "@/features/admin/hooks/useAdminMutation";
import { isAdminReadOnly } from "@/features/admin/config";
import { adminService } from "@/features/admin/services/adminService";
import type { AdminDisputeStatus, AdminPayout } from "@/features/admin/types";

const statusClass: Record<AdminDisputeStatus, string> = {
  OPEN: "bg-red-100 text-red-700 border-red-200",
  UNDER_REVIEW: "bg-amber-100 text-amber-700 border-amber-200",
  RESOLVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-slate-100 text-slate-700 border-slate-200"
};

const payoutClass: Record<AdminPayout["status"], string> = {
  REQUESTED: "bg-amber-100 text-amber-700 border-amber-200",
  PENDING_ADMIN_APPROVAL: "bg-amber-100 text-amber-700 border-amber-200",
  HELD: "bg-orange-100 text-orange-700 border-orange-200",
  APPROVED: "bg-blue-100 text-blue-700 border-blue-200",
  PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REVERSED: "bg-red-100 text-red-700 border-red-200"
};

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value / 100);

const DisputeDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
};

const AdminDisputeDetail: React.FC = () => {
  const { disputeId } = useParams<{ disputeId: string }>();
  const [holdDialogOpen, setHoldDialogOpen] = React.useState(false);
  const [holdReason, setHoldReason] = React.useState("");

  const { data, isLoading, error, refetch } = useAdminQuery(
    async () => {
      if (!disputeId) {
        throw new Error("Missing dispute ID");
      }
      const dispute = await adminService.getDispute(disputeId);
      const [booking, payouts, logs] = await Promise.all([
        adminService.getBooking(dispute.bookingId),
        adminService.listPayouts({ q: dispute.bookingId }),
        adminService.listAuditLogs({ q: dispute.bookingId })
      ]);
      const relatedPayouts = payouts.filter((item) => item.bookingId === dispute.bookingId);
      const timeline = [
        {
          id: `${dispute.id}_created`,
          timestamp: dispute.createdAt,
          label: "Dispute opened",
          description: dispute.reason
        },
        ...logs
          .filter(
            (item) =>
              (item.resourceType === "DISPUTE" && item.resourceId === dispute.id) ||
              (item.resourceType === "BOOKING" && item.resourceId === dispute.bookingId)
          )
          .map((entry) => ({
            id: entry.id,
            timestamp: entry.timestamp,
            label: entry.action.replace(/_/g, " ").toLowerCase(),
            description: entry.actor
          }))
      ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      return {
        dispute,
        booking,
        payouts: relatedPayouts,
        timeline
      };
    },
    [disputeId],
    { enabled: Boolean(disputeId) }
  );

  const underReviewMutation = useAdminMutation<string, unknown>((id) =>
    adminService.updateDisputeStatus(id, "UNDER_REVIEW")
  );

  const resolveMutation = useAdminMutation<string, unknown>((id) =>
    adminService.updateDisputeStatus(id, "RESOLVED")
  );

  const holdPayoutsMutation = useAdminMutation<{ bookingId: string; reason?: string }, unknown>(
    ({ bookingId, reason }) => adminService.holdPayoutsForBooking(bookingId, reason)
  );

  const isBusy = underReviewMutation.isLoading || resolveMutation.isLoading || holdPayoutsMutation.isLoading;

  const handleUnderReview = async () => {
    if (!data || isAdminReadOnly) return;
    try {
      await underReviewMutation.mutate(data.dispute.id);
      toast.success("Dispute marked under review");
      await refetch();
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : "Failed to update dispute");
    }
  };

  const handleResolve = async () => {
    if (!data || isAdminReadOnly) return;
    try {
      await resolveMutation.mutate(data.dispute.id);
      toast.success("Dispute resolved");
      await refetch();
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : "Failed to resolve dispute");
    }
  };

  const handleHoldPayouts = async () => {
    if (!data || isAdminReadOnly) return;
    try {
      await holdPayoutsMutation.mutate({
        bookingId: data.dispute.bookingId,
        reason: holdReason.trim() || "Held due to dispute review"
      });
      toast.success("Related payouts moved to held");
      setHoldDialogOpen(false);
      setHoldReason("");
      await refetch();
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : "Failed to hold payouts");
    }
  };

  if (isLoading) {
    return <DisputeDetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-red-700">
        Failed to load dispute details. {error?.message}
        <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const { dispute, booking, payouts, timeline } = data;

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" className="-ml-3 mb-2 w-fit">
          <Link to="/admin/disputes">
            <ArrowLeft className="size-4" />
            Back to disputes
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-gray-900">{dispute.id}</h1>
          <Badge variant="outline" className={statusClass[dispute.status]}>
            {dispute.status.toLowerCase().replace(/_/g, " ")}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-gray-600">{dispute.reason}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Dispute timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {timeline.map((item) => (
                <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-3">
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-600">{item.description}</p>
                  <p className="mt-1 text-xs text-gray-500">{dateTime(item.timestamp)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Related booking summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-semibold text-gray-900">Booking:</span> {booking.id}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Event:</span> {booking.eventName}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Organizer:</span> {booking.organizerName}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Vendor:</span> {booking.vendorName}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Total:</span> {currency(booking.totalAmountCents)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Related payouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {payouts.length === 0 ? (
                <p className="text-sm text-gray-600">No payouts for this booking yet.</p>
              ) : (
                payouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{payout.id} · {payout.type.toLowerCase()}</p>
                      <p className="text-xs text-gray-600">{currency(payout.amountCents)} · {dateTime(payout.requestedAt)}</p>
                    </div>
                    <Badge variant="outline" className={payoutClass[payout.status]}>
                      {payout.status.toLowerCase().replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => void handleUnderReview()}
              disabled={isBusy || isAdminReadOnly}
            >
              Mark under review
            </Button>
            <Button
              className="w-full"
              onClick={() => void handleResolve()}
              disabled={isBusy || isAdminReadOnly}
            >
              Resolve dispute
            </Button>
            <Button
              className="w-full"
              variant="destructive"
              onClick={() => setHoldDialogOpen(true)}
              disabled={isBusy || isAdminReadOnly}
            >
              Hold related payouts
            </Button>
            <p className="text-xs text-gray-500">
              Holding payouts applies a risk freeze to non-paid payouts for this booking.
            </p>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={holdDialogOpen} onOpenChange={setHoldDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Warning className="size-4 text-red-600" />
              Hold all related payouts?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action places reservation/final payouts for this booking into a held state.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={holdReason}
            onChange={(event) => setHoldReason(event.target.value)}
            placeholder="Optional reason shown in audit logs"
            rows={4}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleHoldPayouts()} disabled={isAdminReadOnly}>
              Hold payouts
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDisputeDetail;
