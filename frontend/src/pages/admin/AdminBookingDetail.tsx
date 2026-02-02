import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type {
  AdminBookingLifecycleState,
  AdminPayout,
  FinanceLedgerEntry
} from "@/features/admin/types";

const statusClass: Record<AdminBookingLifecycleState, string> = {
  CREATED: "bg-slate-100 text-slate-700 border-slate-200",
  VENDOR_APPROVED: "bg-blue-100 text-blue-700 border-blue-200",
  COUNTERED: "bg-violet-100 text-violet-700 border-violet-200",
  READY_FOR_PAYMENT: "bg-amber-100 text-amber-700 border-amber-200",
  ACTIVE: "bg-cyan-100 text-cyan-700 border-cyan-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELED: "bg-red-100 text-red-700 border-red-200"
};

const payoutClass: Record<AdminPayout["status"], string> = {
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

const LedgerBadge: React.FC<{ category: FinanceLedgerEntry["category"] }> = ({ category }) => {
  if (category === "HELD") return <Badge variant="outline" className="bg-amber-100 text-amber-700">Held</Badge>;
  if (category === "RELEASED") return <Badge variant="outline" className="bg-emerald-100 text-emerald-700">Released</Badge>;
  if (category === "REVERSAL") return <Badge variant="outline" className="bg-red-100 text-red-700">Reversal</Badge>;
  return <Badge variant="outline" className="bg-slate-100 text-slate-700">Payment</Badge>;
};

const AdminBookingDetail: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();

  const { data, isLoading, error, refetch } = useAdminQuery(
    async () => {
      if (!bookingId) {
        throw new Error("Missing booking ID");
      }
      const [booking, finance] = await Promise.all([
        adminService.getBooking(bookingId),
        adminService.getBookingFinanceSummary(bookingId)
      ]);
      return { booking, finance };
    },
    [bookingId],
    { enabled: Boolean(bookingId) }
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-red-700">
        <p>Unable to load booking details. {error?.message}</p>
        <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const { booking, finance } = data;

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" className="-ml-3 mb-2 w-fit">
          <Link to="/admin/bookings">
            <ArrowLeft className="h-4 w-4" />
            Back to bookings
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-gray-900">{booking.id}</h1>
          <Badge variant="outline" className={statusClass[booking.state]}>
            {statusLabel(booking.state)}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {booking.eventName} · {booking.organizerName} with {booking.vendorName}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Timeline & milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {booking.milestones.map((item) => (
                <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-3">
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-600">{item.description}</p>
                  <p className="mt-1 text-xs text-gray-500">{dateTime(item.timestamp)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Payment and payout schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">Payment status</p>
                {finance.payment ? (
                  <div className="mt-2 text-sm text-gray-700">
                    <p>
                      {finance.payment.id} · {statusLabel(finance.payment.status)} · {currency(finance.payment.amountCents)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Provider ref: {finance.payment.providerRef} · Updated {dateTime(finance.payment.updatedAt)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-600">No payment captured yet.</p>
                )}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payout ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finance.payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>{payout.id}</TableCell>
                      <TableCell>{payout.type.toLowerCase()}</TableCell>
                      <TableCell>{currency(payout.amountCents)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={payoutClass[payout.status]}>
                          {statusLabel(payout.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{dateTime(payout.requestedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {booking.state === "CANCELED" && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg text-red-800">Cancellation details</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-red-700">
                <p>{booking.cancellationReason ?? "No reason provided."}</p>
                {booking.canceledAt && <p className="mt-2">Canceled at {dateTime(booking.canceledAt)}</p>}
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="border-none shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Finance summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs uppercase tracking-wide text-amber-700">Held</p>
              <p className="text-xl font-semibold text-amber-800">{currency(finance.heldFundsCents)}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs uppercase tracking-wide text-emerald-700">Released</p>
              <p className="text-xl font-semibold text-emerald-800">{currency(finance.releasedFundsCents)}</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-xs uppercase tracking-wide text-red-700">Reversed</p>
              <p className="text-xl font-semibold text-red-800">{currency(finance.reversedFundsCents)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-600">Booking total</p>
              <p className="text-xl font-semibold text-gray-900">{currency(finance.bookingTotalCents)}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">Ledger</p>
              <div className="mt-2 space-y-2">
                {finance.ledger.length === 0 ? (
                  <p className="text-xs text-gray-500">No ledger entries yet.</p>
                ) : (
                  finance.ledger.map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-gray-200 bg-white p-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-gray-800">{entry.label}</p>
                        <LedgerBadge category={entry.category} />
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
                        {currency(entry.amountCents)} · {dateTime(entry.occurredAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBookingDetail;
