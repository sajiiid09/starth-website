import React from "react";
import VendorStatusBanner from "@/components/vendor/VendorStatusBanner";
import { getSessionState } from "@/utils/session";
import { Card, CardContent } from "@/components/ui/card";

const VendorProfile: React.FC = () => {
  const session = getSessionState();
  const draft = session.vendorProfileDraft;

  return (
    <div className="space-y-8">
      <VendorStatusBanner />

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Profile preview
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Vendor profile</h1>
        <p className="mt-2 text-sm text-gray-600">
          Preview the details organizers will see once you are verified.
        </p>
      </div>

      <Card className="border-none shadow-soft">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900">Business details</p>
            <span className="text-xs text-gray-500">Draft data</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.keys(draft).length > 0 ? (
              Object.entries(draft).map(([key, value]) => (
                <div key={key} className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                    {key}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {String(value)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                No draft data yet. Complete onboarding to populate your profile.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorProfile;
