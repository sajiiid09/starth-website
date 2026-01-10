import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const inquiries = [
  {
    event: "Summit 2025",
    client: "Nova Agency",
    status: "New"
  },
  {
    event: "Product Reveal",
    client: "Beacon Labs",
    status: "Responded"
  }
];

const VendorInquiries: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Inquiries
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Inbound leads</h1>
        <p className="mt-2 text-sm text-gray-600">
          Respond quickly to win high-intent bookings.
        </p>
      </div>

      <div className="grid gap-4">
        {inquiries.map((inquiry) => (
          <Card key={inquiry.event} className="border-none shadow-soft">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-base font-semibold text-gray-900">{inquiry.event}</p>
                <p className="text-sm text-gray-500">{inquiry.client}</p>
              </div>
              <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-teal">
                {inquiry.status}
              </span>
            </CardContent>
          </Card>
        ))}
        {inquiries.length === 0 && (
          <Card className="border-dashed shadow-none">
            <CardContent className="p-6 text-center text-sm text-gray-500">
              No inquiries right now.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VendorInquiries;
