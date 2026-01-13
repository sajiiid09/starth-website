import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const VendorCalendar: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Calendar
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Availability</h1>
        <p className="mt-2 text-sm text-gray-600">
          Block off dates and manage upcoming bookings.
        </p>
      </div>

      <Card className="border-none shadow-soft">
        <CardContent className="p-6">
          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Availability snapshot</p>
            <p className="mt-2 text-xs text-gray-500">
              Upcoming hold dates and confirmed holds will appear here.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { date: "Mar 12–14", label: "Corporate retreat hold" },
                { date: "Apr 03", label: "Tasting walkthrough" },
                { date: "Apr 18–19", label: "Wedding weekend block" },
                { date: "May 02", label: "Site inspection" }
              ].map((item) => (
                <div
                  key={item.date}
                  className="rounded-lg border border-gray-200 bg-white/70 p-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    {item.date}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorCalendar;
