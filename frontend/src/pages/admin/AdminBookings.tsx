import React from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import type { AdminBookingLifecycleState } from "@/features/admin/types";

const statusFilters: { label: string; value?: AdminBookingLifecycleState }[] = [
  { label: "All" },
  { label: "Created", value: "CREATED" },
  { label: "Ready for payment", value: "READY_FOR_PAYMENT" },
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Canceled", value: "CANCELED" }
];

const statusClass: Record<AdminBookingLifecycleState, string> = {
  CREATED: "bg-slate-100 text-slate-700 border-slate-200",
  VENDOR_APPROVED: "bg-blue-100 text-blue-700 border-blue-200",
  COUNTERED: "bg-violet-100 text-violet-700 border-violet-200",
  READY_FOR_PAYMENT: "bg-amber-100 text-amber-700 border-amber-200",
  ACTIVE: "bg-cyan-100 text-cyan-700 border-cyan-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELED: "bg-red-100 text-red-700 border-red-200"
};

const statusLabel = (state: AdminBookingLifecycleState) => state.replace(/_/g, " ").toLowerCase();

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value / 100);

const TableSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="grid grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, col) => (
            <Skeleton key={col} className="h-8 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
};

const AdminBookings: React.FC = () => {
  const [status, setStatus] = React.useState<AdminBookingLifecycleState | undefined>(undefined);
  const [query, setQuery] = React.useState("");

  const { data, isLoading, error, refetch } = useAdminQuery(
    () => adminService.listBookings({ status, q: query || undefined }),
    [status, query]
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">Finance</p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Bookings overview</h1>
        <p className="mt-2 text-sm text-gray-600">Monitor booking lifecycle and drill into finance summary.</p>
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

          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search bookings"
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {isLoading && <TableSkeleton />}

          {!isLoading && error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              Failed to load bookings. {error.message}
              <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !error && (!data || data.length === 0) && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-600">
              No bookings found for this filter.
            </div>
          )}

          {!isLoading && !error && data && data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    <TableCell>{booking.organizerName}</TableCell>
                    <TableCell>{booking.vendorName}</TableCell>
                    <TableCell>{formatDate(booking.startsAt)}</TableCell>
                    <TableCell>{currency(booking.totalAmountCents)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusClass[booking.state]}>
                        {statusLabel(booking.state)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/bookings/${booking.id}`}>View</Link>
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

export default AdminBookings;
