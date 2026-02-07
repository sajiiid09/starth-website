import React, { useEffect, useState } from "react";
import { Warning, Stack, ShieldCheck, Users, SpinnerGap } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminService } from "@/features/admin/services/adminService";
import { request } from "@/api/httpClient";

type OverviewCounts = {
  users: number;
  venues: number;
  service_providers: number;
  events: number;
};

type PendingVendor = {
  id: string;
  name: string;
  type: "venue" | "service_provider";
  city: string;
};

const AdminDashboardHome: React.FC = () => {
  const [counts, setCounts] = useState<OverviewCounts | null>(null);
  const [templateCount, setTemplateCount] = useState<number>(0);
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch finance overview (includes user/vendor/event counts)
        const overview = await adminService.getFinanceOverview() as any;
        const c = overview?.counts as OverviewCounts | undefined;
        if (c) {
          setCounts(c);
        }

        // Fetch template count
        try {
          const templatesRes = await request<any>("GET", "/api/templates", { auth: true });
          const templates = templatesRes?.data ?? templatesRes ?? [];
          setTemplateCount(Array.isArray(templates) ? templates.length : 0);
        } catch {
          setTemplateCount(0);
        }

        // Fetch pending vendors for moderation queue
        try {
          const vendorsRes = await adminService.listVendors({ status: "PENDING" }) as any;
          const pending: PendingVendor[] = [];

          const venues = vendorsRes?.venues ?? [];
          for (const v of venues) {
            pending.push({ id: v.id, name: v.name, type: "venue", city: v.city ?? "" });
          }

          const providers = vendorsRes?.service_providers ?? [];
          for (const sp of providers) {
            pending.push({ id: sp.id, name: sp.business_name, type: "service_provider", city: sp.city ?? "" });
          }

          setPendingVendors(pending);
        } catch {
          setPendingVendors([]);
        }
      } catch (err) {
        console.error("Failed to load admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const totalVendors = (counts?.venues ?? 0) + (counts?.service_providers ?? 0);

  const stats = [
    { label: "Total users", value: counts?.users ?? 0, icon: Users },
    { label: "Active vendors", value: totalVendors, icon: ShieldCheck },
    { label: "Templates", value: templateCount, icon: Stack },
    { label: "Pending approvals", value: pendingVendors.length, icon: Warning },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <SpinnerGap className="size-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Admin Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">System overview</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor activity, approvals, and platform performance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-none shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <Icon className="size-4 text-brand-teal" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-none shadow-soft">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Moderation queue</h2>
          <p className="mt-2 text-sm text-gray-600">
            Review vendor onboarding and template submissions.
          </p>
          <div className="mt-6 grid gap-3">
            {pendingVendors.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">
                No pending approvals right now.
              </p>
            ) : (
              pendingVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-800">{vendor.name}</span>
                    <span className="ml-2 text-xs text-gray-400">
                      {vendor.type === "venue" ? "Venue" : "Service Provider"}
                      {vendor.city ? ` — ${vendor.city}` : ""}
                    </span>
                  </div>
                  <Button variant="outline" className="rounded-full text-xs">
                    Review
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardHome;
