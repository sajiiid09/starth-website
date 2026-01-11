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
          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            Calendar view coming soon.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorCalendar;
