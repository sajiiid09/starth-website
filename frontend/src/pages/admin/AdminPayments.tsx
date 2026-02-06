import React from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
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
import type { AdminPaymentStatus } from "@/features/admin/types";

const paymentStatusFilters: { label: string; value?: AdminPaymentStatus }[] = [
  { label: "All" },
  { label: "Needs method", value: "REQUIRES_PAYMENT_METHOD" },
  { label: "Needs confirmation", value: "REQUIRES_CONFIRMATION" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Succeeded", value: "SUCCEEDED" },
  { label: "Corrected", value: "CORRECTED" },
  { label: "Canceled", value: "CANCELED" }
];

const statusClass: Record<AdminPaymentStatus, string> = {
  REQUIRES_PAYMENT_METHOD: "bg-slate-100 text-slate-700 border-slate-200",
  REQUIRES_CONFIRMATION: "bg-amber-100 text-amber-700 border-amber-200",
  PROCESSING: "bg-blue-100 text-blue-700 border-blue-200",
  SUCCEEDED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CORRECTED: "bg-purple-100 text-purple-700 border-purple-200",
  CANCELED: "bg-red-100 text-red-700 border-red-200"
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

const AdminPayments: React.FC = () => {
  const [status, setStatus] = React.useState<AdminPaymentStatus | undefined>(undefined);
  const [query, setQuery] = React.useState("");

  const { data, isLoading, error, refetch } = useAdminQuery(
    () => adminService.listPayments({ status, q: query || undefined }),
    [status, query]
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">Finance</p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Payments</h1>
        <p className="mt-2 text-sm text-gray-600">Track payment intent health before funds are released.</p>
      </div>

      <Card className="border-none shadow-soft">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap gap-2">
            {paymentStatusFilters.map((item) => {
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
            <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by payment, booking, provider ref"
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {isLoading && <TableSkeleton />}

          {!isLoading && error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              Failed to load payments. {error.message}
              <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !error && (!data || data.length === 0) && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-600">
              No payments found.
            </div>
          )}

          {!isLoading && !error && data && data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Provider ref</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>{payment.bookingId}</TableCell>
                    <TableCell>{currency(payment.amountCents)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusClass[payment.status]}>
                        {statusLabel(payment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{dateTime(payment.createdAt)}</TableCell>
                    <TableCell className="font-mono text-xs">{payment.providerRef}</TableCell>
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

export default AdminPayments;
