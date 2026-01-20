import React from "react";
import { AlertTriangle, Layers, ShieldCheck, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminDashboardHome: React.FC = () => {
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
        {[
          { label: "Total users", value: "1,248", icon: Users },
          { label: "Active vendors", value: "312", icon: ShieldCheck },
          { label: "Templates", value: "24", icon: Layers },
          { label: "Pending approvals", value: "6", icon: AlertTriangle }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-none shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <Icon className="h-4 w-4 text-brand-teal" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-gray-900">{stat.value}</p>
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
            {["New vendor application", "Template update", "Listing flagged"].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3"
              >
                <span className="text-sm font-medium text-gray-800">{item}</span>
                <Button variant="outline" className="rounded-full text-xs">
                  Review
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardHome;
