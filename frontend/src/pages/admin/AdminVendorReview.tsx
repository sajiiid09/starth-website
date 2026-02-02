import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useAdminQuery } from "@/features/admin/hooks/useAdminQuery";
import { useAdminMutation } from "@/features/admin/hooks/useAdminMutation";
import { adminService } from "@/features/admin/services/adminService";
import type { AdminVendor, AdminVendorVerificationState } from "@/features/admin/types";

const formatStatus = (state: AdminVendorVerificationState) => {
  if (state === "NEEDS_CHANGES") return "Needs changes";
  if (state === "DISABLED_PAYOUT") return "Disabled payout";
  return state.charAt(0) + state.slice(1).toLowerCase();
};

const statusClassByState: Record<AdminVendorVerificationState, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  NEEDS_CHANGES: "bg-orange-100 text-orange-700 border-orange-200",
  DISABLED_PAYOUT: "bg-red-100 text-red-700 border-red-200"
};

const formatSubtype = (subtype: AdminVendor["subtype"]) =>
  subtype === "VENUE_OWNER" ? "Venue Owner" : "Service Provider";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });

const LoadingView: React.FC = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
};

type MutationContext = {
  rollback: () => void;
};

const AdminVendorReview: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();

  const [vendor, setVendor] = React.useState<AdminVendor | null>(null);
  const [needsChangesOpen, setNeedsChangesOpen] = React.useState(false);
  const [disableOpen, setDisableOpen] = React.useState(false);
  const [needsChangesNote, setNeedsChangesNote] = React.useState("");
  const [disableReason, setDisableReason] = React.useState("");

  const { data, isLoading, error, refetch } = useAdminQuery(
    () => adminService.getVendor(vendorId ?? ""),
    [vendorId],
    { enabled: Boolean(vendorId) }
  );

  React.useEffect(() => {
    if (data) {
      setVendor(data);
      setNeedsChangesNote(data.submission.note ?? "");
    }
  }, [data]);

  const makeOptimisticUpdate = React.useCallback(
    (state: AdminVendorVerificationState, payoutEnabled: boolean, note?: string): MutationContext | void => {
      if (!vendor) {
        return;
      }

      const previous = vendor;
      const now = new Date().toISOString();

      setVendor({
        ...vendor,
        verificationState: state,
        payoutEnabled,
        updatedAt: now,
        submission: {
          ...vendor.submission,
          lastUpdatedAt: now,
          note: note ?? vendor.submission.note
        }
      });

      return {
        rollback: () => setVendor(previous)
      };
    },
    [vendor]
  );

  const approveMutation = useAdminMutation<string, AdminVendor, MutationContext>(
    (id) => adminService.approveVendor(id),
    {
      onMutate: () => makeOptimisticUpdate("APPROVED", true),
      onSuccess: (result) => {
        setVendor(result);
        toast.success("Vendor approved");
      },
      onError: (mutationError) => {
        toast.error(mutationError.message || "Unable to approve vendor");
      }
    }
  );

  const needsChangesMutation = useAdminMutation<{ id: string; note: string }, AdminVendor, MutationContext>(
    ({ id, note }) => adminService.needsChangesVendor(id, note),
    {
      onMutate: (input) => makeOptimisticUpdate("NEEDS_CHANGES", false, input.note),
      onSuccess: (result) => {
        setVendor(result);
        setNeedsChangesOpen(false);
        toast.success("Marked as needs changes");
      },
      onError: (mutationError) => {
        toast.error(mutationError.message || "Unable to update vendor");
      }
    }
  );

  const disableMutation = useAdminMutation<{ id: string; reason?: string }, AdminVendor, MutationContext>(
    ({ id, reason }) => adminService.disableVendorPayout(id, reason),
    {
      onMutate: (input) => makeOptimisticUpdate("DISABLED_PAYOUT", false, input.reason),
      onSuccess: (result) => {
        setVendor(result);
        setDisableOpen(false);
        toast.success("Payout eligibility disabled");
      },
      onError: (mutationError) => {
        toast.error(mutationError.message || "Unable to disable payouts");
      }
    }
  );

  const isActionLoading =
    approveMutation.isLoading || needsChangesMutation.isLoading || disableMutation.isLoading;

  const handleApprove = async () => {
    if (!vendorId) return;
    try {
      await approveMutation.mutate(vendorId);
    } catch {
      // handled by hook callbacks
    }
  };

  const handleNeedsChanges = async () => {
    if (!vendorId) return;

    const note = needsChangesNote.trim();
    if (!note) {
      toast.error("Add a note for requested changes");
      return;
    }

    try {
      await needsChangesMutation.mutate({ id: vendorId, note });
    } catch {
      // handled by hook callbacks
    }
  };

  const handleDisablePayout = async () => {
    if (!vendorId) return;

    try {
      await disableMutation.mutate({
        id: vendorId,
        reason: disableReason.trim() || undefined
      });
    } catch {
      // handled by hook callbacks
    }
  };

  if (!vendorId) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        Missing vendor ID.
      </div>
    );
  }

  if (isLoading && !vendor) {
    return <LoadingView />;
  }

  if (error && !vendor) {
    return (
      <div className="space-y-4 rounded-xl border border-red-100 bg-red-50 p-6 text-red-700">
        <p>Unable to load vendor review. {error.message}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void refetch()}>
            Try again
          </Button>
          <Button variant="ghost" onClick={() => navigate("/admin/vendors")}>
            Back to vendors
          </Button>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-600">Vendor not found.</p>
        <Button asChild variant="outline">
          <Link to="/admin/vendors">Back to vendors</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" className="mb-2 -ml-3 w-fit">
            <Link to="/admin/vendors">
              <ArrowLeft className="h-4 w-4" />
              Back to queue
            </Link>
          </Button>
          <h1 className="text-3xl font-semibold text-gray-900">{vendor.displayName}</h1>
          <p className="mt-1 text-sm text-gray-600">Review submission and verification controls</p>
        </div>
        <Badge variant="outline" className={statusClassByState[vendor.verificationState]}>
          {formatStatus(vendor.verificationState)}
        </Badge>
      </div>

      <Card className="border-none shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Basic info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Subtype:</span> {formatSubtype(vendor.subtype)}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Contact:</span> {vendor.contactName}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Email:</span> {vendor.contactEmail}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Phone:</span> {vendor.contactPhone}
          </p>
          <p className="text-sm text-gray-700 sm:col-span-2">
            <span className="font-semibold text-gray-900">Location:</span> {vendor.city}, {vendor.state}
          </p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Subtype details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {vendor.subtype === "VENUE_OWNER" && vendor.venueDetails && (
            <>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Square feet:</span> {vendor.venueDetails.squareFeet.toLocaleString()}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Venue type:</span> {vendor.venueDetails.venueType}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Address:</span> {vendor.venueDetails.address}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Capacity notes:</span> {vendor.venueDetails.capacityNotes}
              </p>
            </>
          )}

          {vendor.subtype === "SERVICE_PROVIDER" && vendor.serviceDetails && (
            <>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Categories:</span> {vendor.serviceDetails.categories.join(", ")}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Service areas:</span> {vendor.serviceDetails.serviceAreas.join(", ")}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Verification submission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Submitted:</span> {formatDate(vendor.submission.submittedAt)}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Submitted by:</span> {vendor.submission.submittedBy}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Documents:</span> {vendor.submission.documents.join(", ")}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Last updated:</span> {formatDate(vendor.submission.lastUpdatedAt)}
          </p>
          {vendor.submission.note && (
            <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Last reviewer note:</span> {vendor.submission.note}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Review actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => void handleApprove()} disabled={isActionLoading}>
            Approve
          </Button>
          <Button variant="outline" onClick={() => setNeedsChangesOpen(true)} disabled={isActionLoading}>
            Needs changes
          </Button>
          <Button variant="destructive" onClick={() => setDisableOpen(true)} disabled={isActionLoading}>
            Disable payout
          </Button>
        </CardContent>
      </Card>

      <Dialog open={needsChangesOpen} onOpenChange={setNeedsChangesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request changes</DialogTitle>
            <DialogDescription>
              Add clear feedback so the vendor can update their verification submission.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={needsChangesNote}
            onChange={(event) => setNeedsChangesNote(event.target.value)}
            placeholder="Example: Please upload a valid insurance certificate through Dec 2026."
            rows={5}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNeedsChangesOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleNeedsChanges()} disabled={needsChangesMutation.isLoading}>
              Submit note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={disableOpen} onOpenChange={setDisableOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Disable payout eligibility?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This is an emergency control. The vendor can keep operating but payouts stay blocked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={disableReason}
            onChange={(event) => setDisableReason(event.target.value)}
            placeholder="Optional reason for audit history"
            rows={4}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDisablePayout()}>
              Disable payout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminVendorReview;
