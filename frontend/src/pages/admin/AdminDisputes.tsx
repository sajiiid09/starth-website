import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useAdminQuery } from "@/features/admin/hooks/useAdminQuery";
import { adminService } from "@/features/admin/services/adminService";
import type { AdminDisputeStatus } from "@/features/admin/types";

const statusFilters: { label: string; value?: AdminDisputeStatus }[] = [
  { label: "All" },
  { label: "Open", value: "OPEN" },
  { label: "Under review", value: "UNDER_REVIEW" },
  { label: "Resolved", value: "RESOLVED" }
];

const statusClass: Record<AdminDisputeStatus, string> = {
  OPEN: "bg-red-100 text-red-700 border-red-200",
  UNDER_REVIEW: "bg-amber-100 text-amber-700 border-amber-200",
  RESOLVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-slate-100 text-slate-700 border-slate-200"
};

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });

const TableSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((__, col) => (
            <Skeleton key={col} className="h-8 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
};

const AdminDisputes: React.FC = () => {
  const [status, setStatus] = React.useState<AdminDisputeStatus | undefined>(undefined);

  const { data, isLoading, error, refetch } = useAdminQuery(
    () => adminService.listDisputes({ status }),
    [status]
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">Control Plane</p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Disputes</h1>
        <p className="mt-2 text-sm text-gray-600">Resolve disputes and hold related payouts when risk signals appear.</p>
      </div>

      <Card className="border-none shadow-soft">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((item) => {
              const active = item.value === status || (!item.value && !status);
              return (
                <Button
                  key={item.label}
                  variant={active ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus(item.value)}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>

          {isLoading && <TableSkeleton />}

          {!isLoading && error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              Failed to load disputes. {error.message}
              <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !error && (!data || data.length === 0) && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-600">
              No disputes found.
            </div>
          )}

          {!isLoading && !error && data && data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Vendor ID</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell>
                      <Badge variant="outline" className={statusClass[dispute.status]}>
                        {dispute.status.toLowerCase().replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{dispute.bookingId}</TableCell>
                    <TableCell>{dispute.vendorId}</TableCell>
                    <TableCell className="max-w-[380px] truncate" title={dispute.reason}>
                      {dispute.reason}
                    </TableCell>
                    <TableCell>{dateTime(dispute.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/disputes/${dispute.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDisputes;
