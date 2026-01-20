import React from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getVendorOnboardingPath,
  setVendorOnboardingStatus,
  setVendorType,
  type VendorType
} from "@/utils/session";

const vendorOptions = [
  {
    id: "venue_owner",
    title: "Venue Owner",
    description: "Own or manage event spaces.",
    icon: Users
  },
  {
    id: "service_provider",
    title: "Service Provider",
    description: "Catering, AV, staffing, and more.",
    icon: Briefcase
  }
] as const;

const VendorTypeSelect: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Vendor setup
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">
          Choose your vendor type
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          We’ll tailor your onboarding based on what you offer.
        </p>
      </div>

      <div className="grid gap-4">
        {vendorOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-4 rounded-2xl border border-white/60 bg-white/90 px-5 py-4 text-left shadow-card",
                "transition duration-200 ease-smooth hover:-translate-y-0.5 hover:border-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40"
              )}
              onClick={() => {
                const chosenType = option.id as VendorType;
                setVendorType(chosenType);
                setVendorOnboardingStatus("draft");
                navigate(getVendorOnboardingPath(chosenType));
              }}
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-light">
                <Icon className="h-5 w-5 text-brand-teal" />
              </span>
              <span className="flex-1">
                <span className="block text-base font-semibold text-brand-dark">
                  {option.title}
                </span>
                <span className="block text-sm text-brand-dark/70">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VendorTypeSelect;
