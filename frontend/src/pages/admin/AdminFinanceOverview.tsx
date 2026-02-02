import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminQuery } from "@/features/admin/hooks/useAdminQuery";
import { adminService } from "@/features/admin/services/adminService";

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
    hour: "numeric",
    minute: "2-digit"
  });

const actionLabel = (action: string) => action.replace(/_/g, " ").toLowerCase();

const FinanceOverviewSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
};

const AdminFinanceOverview: React.FC = () => {
  const { data, isLoading, error, refetch } = useAdminQuery(() => adminService.getFinanceOverview(), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">Finance</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900">Finance overview</h1>
          <p className="mt-2 text-sm text-gray-600">Track held funds, payout release, and controlled payout risk.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/bookings">Bookings</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/payouts">Payout queue</Link>
          </Button>
        </div>
      </div>

      {isLoading && <FinanceOverviewSkeleton />}

      {!isLoading && error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            <p>Unable to load finance overview. {error.message}</p>
            <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-none shadow-soft">
              <CardContent className="p-6">
                <p className="text-sm text-gray-500">Total held funds</p>
                <p className="mt-2 text-2xl font-semibold text-amber-700">{currency(data.totalHeldFundsCents)}</p>
                <p className="mt-1 text-xs text-gray-500">Funds not yet released to vendors.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-soft">
              <CardContent className="p-6">
                <p className="text-sm text-gray-500">Total paid out</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-700">{currency(data.totalPaidOutCents)}</p>
                <p className="mt-1 text-xs text-gray-500">Released funds completed to vendors.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-soft">
              <CardContent className="p-6">
                <p className="text-sm text-gray-500">Pending payouts</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{data.pendingPayoutsCount}</p>
                <p className="mt-1 text-xs text-gray-500">Awaiting admin approval.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-soft">
              <CardContent className="p-6">
                <p className="text-sm text-gray-500">Active this month</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{data.activeBookingsThisMonth}</p>
                <p className="mt-1 text-xs text-gray-500">Bookings currently active this month.</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-soft">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Recent activity</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin/payouts">
                  Open payout queue
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentActivity.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                  No recent activity yet.
                </div>
              ) : (
                data.recentActivity.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{actionLabel(entry.action)}</p>
                      <p className="text-xs text-gray-600">
                        {entry.actor} · {entry.resourceType} {entry.resourceId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{entry.resourceType}</Badge>
                      <span className="text-xs text-gray-500">{dateTime(entry.timestamp)}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminFinanceOverview;
