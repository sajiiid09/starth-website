import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const listings = [
  { name: "Lumen AV Experience", status: "Active", views: "124" },
  { name: "Premium Lighting Package", status: "Draft", views: "32" }
];

const VendorListings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Listings
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Your listings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Keep pricing and availability up to date for better booking rates.
        </p>
      </div>

      <div className="grid gap-4">
        {listings.map((listing) => (
          <Card key={listing.name} className="border-none shadow-soft">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-base font-semibold text-gray-900">{listing.name}</p>
                <p className="text-sm text-gray-500">{listing.views} views this week</p>
              </div>
              <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-teal">
                {listing.status}
              </span>
            </CardContent>
          </Card>
        ))}
        {listings.length === 0 && (
          <Card className="border-dashed shadow-none">
            <CardContent className="p-6 text-center text-sm text-gray-500">
              No listings yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VendorListings;
