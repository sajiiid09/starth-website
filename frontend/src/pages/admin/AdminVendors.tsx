import React from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminQuery } from "@/features/admin/hooks/useAdminQuery";
import { adminService } from "@/features/admin/services/adminService";
import type { AdminVendor, AdminVendorVerificationState } from "@/features/admin/types";

type VendorTab = "PENDING" | "APPROVED" | "NEEDS_CHANGES" | "DISABLED_PAYOUT" | "ALL";

const tabItems: { label: string; value: VendorTab }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Needs Changes", value: "NEEDS_CHANGES" },
  { label: "Disabled Payout", value: "DISABLED_PAYOUT" },
  { label: "All", value: "ALL" }
];

const formatSubtype = (subtype: AdminVendor["subtype"]) =>
  subtype === "VENUE_OWNER" ? "Venue Owner" : "Service Provider";

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

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

const VendorTableSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid grid-cols-5 gap-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
};

const AdminVendors: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<VendorTab>("PENDING");
  const [searchQuery, setSearchQuery] = React.useState("");

  const statusFilter = activeTab === "ALL" ? undefined : activeTab;

  const { data, isLoading, error, refetch } = useAdminQuery(
    () => adminService.listVendors({ status: statusFilter }),
    [statusFilter]
  );

  const filteredVendors = React.useMemo(() => {
    const vendors = data ?? [];
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return vendors;
    }

    return vendors.filter((vendor) =>
      [vendor.displayName, vendor.contactName, vendor.contactEmail, vendor.city, vendor.state]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [data, searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">Vendors</p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Vendor verification</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review onboarding submissions and control payout eligibility.
        </p>
      </div>

      <Card className="border-none shadow-soft">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as VendorTab)}>
              <TabsList className="flex h-auto flex-wrap gap-1 bg-gray-100 p-1">
                {tabItems.map((item) => (
                  <TabsTrigger key={item.value} value={item.value} className="text-xs sm:text-sm">
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="relative w-full lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search vendors"
                className="pl-9"
              />
            </div>
          </div>

          {isLoading && <VendorTableSkeleton />}

          {!isLoading && error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              <p>Unable to load vendor queue. {error.message}</p>
              <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
                Try again
              </Button>
            </div>
          )}

          {!isLoading && !error && filteredVendors.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
              <h2 className="text-base font-semibold text-gray-900">
                {activeTab === "PENDING" ? "No pending vendors" : "No vendors found"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">Try adjusting your filter or search query.</p>
            </div>
          )}

          {!isLoading && !error && filteredVendors.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor name</TableHead>
                  <TableHead>Subtype</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium text-gray-900">{vendor.displayName}</TableCell>
                    <TableCell>{formatSubtype(vendor.subtype)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusClassByState[vendor.verificationState]}>
                        {formatStatus(vendor.verificationState)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(vendor.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/admin/vendors/${vendor.id}`}>View</Link>
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

export default AdminVendors;
