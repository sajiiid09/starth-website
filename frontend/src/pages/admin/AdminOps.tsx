import React from "react";
import { toast } from "sonner";
import { AlertTriangle, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  hasAdminOpsTools,
  isAdminReadOnly,
  isDemoOpsEnabled,
  isReconciliationOpsEnabled
} from "@/features/admin/config";
import { useAdminMutation } from "@/features/admin/hooks/useAdminMutation";
import { adminService } from "@/features/admin/services/adminService";
import type { AdminPaymentStatus } from "@/features/admin/types";

const AdminOps: React.FC = () => {
  const [seedOpen, setSeedOpen] = React.useState(false);
  const [reconcileOpen, setReconcileOpen] = React.useState(false);

  const seedMutation = useAdminMutation<void, { resetAt: string }>(() => adminService.opsResetDummyData());
  const reconcileMutation = useAdminMutation<void, { paymentId: string; status: AdminPaymentStatus }>(() =>
    adminService.opsReconcileDummyPayments()
  );

  const handleSeed = async () => {
    try {
      const result = await seedMutation.mutate(undefined);
      toast.success(`Demo data reset at ${new Date(result.resetAt).toLocaleTimeString()}`);
      setSeedOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to seed demo data");
    }
  };

  const handleReconcile = async () => {
    try {
      const result = await reconcileMutation.mutate(undefined);
      toast.success(`Reconciled ${result.paymentId} → ${result.status.toLowerCase()}`);
      setReconcileOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to run reconciliation");
    }
  };

  if (!hasAdminOpsTools) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">Control Plane</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900">Ops tools</h1>
          <p className="mt-2 text-sm text-gray-600">Ops tools are disabled by feature flags.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">Control Plane</p>
        <h1 className="mt-3 flex items-center gap-2 text-3xl font-semibold text-gray-900">
          <Wrench className="h-7 w-7" />
          Ops tools
        </h1>
        <p className="mt-2 text-sm text-gray-600">Use with caution. These operations mutate in-memory dummy finance state.</p>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg text-amber-900">High-impact actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-amber-900">
          <p>These tools are for demo/support workflows only.</p>
          <p>Each action requires confirmation and writes to audit logs.</p>
          {isAdminReadOnly && (
            <p className="font-semibold">Read-only mode is enabled. All ops actions are disabled.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {isDemoOpsEnabled && (
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Seed demo data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>Resets vendors, bookings, payments, payouts, disputes, and logs to default dummy snapshots.</p>
              <Button
                variant="destructive"
                onClick={() => setSeedOpen(true)}
                disabled={seedMutation.isLoading || isAdminReadOnly}
              >
                Seed demo data
              </Button>
            </CardContent>
          </Card>
        )}

        {isReconciliationOpsEnabled && (
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Run reconciliation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>Simulates reconciliation by correcting one random payment and writing a reconciliation audit event.</p>
              <Button
                variant="outline"
                onClick={() => setReconcileOpen(true)}
                disabled={reconcileMutation.isLoading || isAdminReadOnly}
              >
                Run reconciliation
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={seedOpen} onOpenChange={setSeedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Reset all demo datasets?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will overwrite all in-memory dummy admin state for the current session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleSeed()}>Confirm reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={reconcileOpen} onOpenChange={setReconcileOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Run reconciliation now?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This simulates a reconciliation correction on one payment for demo purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleReconcile()}>Run reconciliation</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminOps;
