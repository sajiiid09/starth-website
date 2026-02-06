import React from "react";
import { ChartBar, CaretRight, ChatCircle, Megaphone } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import VendorStatusBanner from "@/components/vendor/VendorStatusBanner";
import { getSessionState, getVendorOnboardingPath } from "@/utils/session";
import { cn } from "@/lib/utils";

const inquiries = [
  { name: "Luna Tech Summit", note: "Requesting AV + lighting quote", time: "1h ago" },
  { name: "Horizon Gala", note: "Needs catering partner", time: "4h ago" }
];

const VendorDashboardHome: React.FC = () => {
  const session = getSessionState();
  const isVerified = session.vendorOnboardingStatus === "approved";
  const nextStepCopy = isVerified
    ? {
        title: "See matched opportunities",
        description: "Review curated event opportunities that match your offering.",
        action: "View opportunities",
        href: "/vendor/inquiries"
      }
    : session.vendorOnboardingStatus === "submitted" ||
        session.vendorOnboardingStatus === "pending"
      ? {
          title: "View submission",
          description: "Track your verification review and next steps.",
          action: "View submission",
          href: "/vendor/submission"
        }
      : {
          title: "Complete onboarding",
          description: "Finish your profile so we can verify your vendor account.",
          action: "Complete onboarding",
          href: getVendorOnboardingPath(session.vendorType)
        };

  return (
    <div className="space-y-8">
      <VendorStatusBanner />
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Vendor Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Performance snapshot</h1>
        <p className="mt-2 text-sm text-gray-600">
          Keep tabs on listings, inquiries, and conversion momentum.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "New inquiries", value: "8", icon: ChatCircle },
          { label: "Listing views", value: "312", icon: ChartBar },
          { label: "Active campaigns", value: "2", icon: Megaphone }
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{nextStepCopy.title}</p>
              <p className="mt-2 text-sm text-gray-600">{nextStepCopy.description}</p>
            </div>
            <a href={nextStepCopy.href}>
              <Button
                className={cn(
                  "rounded-full",
                  isVerified ? "bg-brand-teal text-brand-light" : "bg-brand-dark text-brand-light"
                )}
              >
                {nextStepCopy.action}
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {isVerified && (
        <Card className="border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Matched opportunities</h2>
              <a href="/vendor/inquiries" className="text-sm text-brand-teal">
                View all
              </a>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { title: "Nimbus Leadership Summit", date: "Oct 12", budget: "$18k" },
                { title: "Pacific Brand Launch", date: "Oct 28", budget: "$32k" }
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-500">{item.budget}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">New inquiries</h2>
              <a href="/vendor/inquiries" className="text-sm text-brand-teal">
                View all
              </a>
            </div>
            <div className="mt-4 space-y-4">
              {inquiries.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.note}</p>
                  </div>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
              ))}
              {inquiries.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                  No inquiries right now.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Quick actions</h2>
            <div className="mt-4 grid gap-3">
              <Button
                className="w-full justify-between rounded-full bg-brand-teal text-brand-light hover:bg-brand-teal/90"
                disabled={!isVerified}
                title={isVerified ? "" : "Available after verification"}
              >
                Create listing
                <CaretRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between rounded-full"
                disabled={!isVerified}
                title={isVerified ? "" : "Available after verification"}
              >
                Update availability
                <CaretRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between rounded-full"
                disabled={!isVerified}
                title={isVerified ? "" : "Available after verification"}
              >
                View messages
                <CaretRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboardHome;
