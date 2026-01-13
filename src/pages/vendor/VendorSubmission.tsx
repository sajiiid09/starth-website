import React from "react";
import VendorStatusBanner from "@/components/vendor/VendorStatusBanner";
import { getSessionState } from "@/utils/session";
import { Card, CardContent } from "@/components/ui/card";

const VendorSubmission: React.FC = () => {
  const session = getSessionState();

  return (
    <div className="space-y-8">
      <VendorStatusBanner />

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Submission status
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Review progress</h1>
        <p className="mt-2 text-sm text-gray-600">
          Track approval progress and next steps for verification.
        </p>
      </div>

      <Card className="border-none shadow-soft">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900">Current status</p>
            <span className="text-xs text-gray-500 uppercase tracking-[0.2em]">
              {session.vendorOnboardingStatus}
            </span>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-600">
            We review submissions in the order received. You’ll get an email when
            verification is complete.
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Submitted
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-900">Demo queue</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Estimated review
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-900">24 hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorSubmission;
