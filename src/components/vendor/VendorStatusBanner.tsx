import React from "react";
import { cn } from "@/lib/utils";
import { getSessionState, type VendorOnboardingStatus } from "@/utils/session";

type VendorStatusBannerProps = {
  status?: VendorOnboardingStatus;
  className?: string;
};

const statusCopy: Record<VendorOnboardingStatus, { title: string; body: string }> = {
  draft: {
    title: "Draft profile",
    body: "Complete onboarding to get verified and start receiving leads."
  },
  submitted: {
    title: "Submitted",
    body: "Your profile is under review. We’ll notify you within 24 hours."
  },
  pending: {
    title: "Pending approval",
    body: "Our team is reviewing your submission now."
  },
  needs_changes: {
    title: "Needs changes",
    body: "Please add pricing and availability before we can approve."
  },
  approved: {
    title: "Verified vendor",
    body: "You’re approved. Publish listings and respond to new inquiries."
  }
};

const statusTone: Record<VendorOnboardingStatus, string> = {
  draft: "bg-brand-cream/60 text-brand-dark border-brand-dark/10",
  submitted: "bg-brand-blue/30 text-brand-dark border-brand-dark/10",
  pending: "bg-brand-blue/30 text-brand-dark border-brand-dark/10",
  needs_changes: "bg-brand-coral/20 text-brand-dark border-brand-coral/40",
  approved: "bg-brand-teal/15 text-brand-teal border-brand-teal/30"
};

const VendorStatusBanner: React.FC<VendorStatusBannerProps> = ({ status, className }) => {
  const resolvedStatus = status ?? getSessionState().vendorOnboardingStatus;
  const copy = statusCopy[resolvedStatus];

  return (
    <div
      className={cn(
        "rounded-2xl border px-5 py-4 text-sm shadow-soft",
        statusTone[resolvedStatus],
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em]">
        {copy.title}
      </p>
      <p className="mt-2">{copy.body}</p>
    </div>
  );
};

export default VendorStatusBanner;
