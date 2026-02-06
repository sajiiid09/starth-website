import {
  ClipboardText,
  House,
  EnvelopeSimple,
  Gear,
  CalendarBlank,
  FileText,
  Buildings,
  Briefcase
} from "@phosphor-icons/react";
import type { VendorOnboardingStatus, VendorType } from "@/utils/session";

type VendorSidebarItem = {
  label: string;
  href: string;
  icon: typeof House;
  badge?: string;
};

export const getSidebarVendor = ({
  vendorType,
  status
}: {
  vendorType: VendorType | null;
  status: VendorOnboardingStatus;
}): VendorSidebarItem[] => {
  const isApproved = status === "approved";
  const onboardingPath =
    vendorType === "venue_owner"
      ? "/vendor/onboarding/venue"
      : vendorType === "service_provider"
        ? "/vendor/onboarding/service"
        : "/vendor/onboarding/select";
  const profileLabel =
    vendorType === "venue_owner" ? "My Venue / Profile" : "My Services / Profile";

  const baseItems: VendorSidebarItem[] = [
    { label: "Overview", href: "/vendor", icon: House },
    {
      label: isApproved
        ? vendorType === "venue_owner"
          ? "Edit Venue Profile"
          : "Edit Service Profile"
        : vendorType === "venue_owner"
          ? "Venue Onboarding"
          : "Service Onboarding",
      href: onboardingPath,
      icon: vendorType === "venue_owner" ? Buildings : Briefcase
    },
    { label: profileLabel, href: "/vendor/profile", icon: ClipboardText },
    { label: "Submission Status", href: "/vendor/submission", icon: FileText },
    { label: "Settings", href: "/vendor/settings", icon: Gear }
  ];

  if (isApproved) {
    baseItems.splice(1, 0, {
      label: vendorType === "venue_owner" ? "Listings" : "Services",
      href: "/vendor/listings",
      icon: ClipboardText
    });
    baseItems.splice(2, 0, {
      label: "Inquiries",
      href: "/vendor/inquiries",
      icon: EnvelopeSimple,
      badge: "5"
    });
    baseItems.splice(3, 0, {
      label: "Calendar",
      href: "/vendor/calendar",
      icon: CalendarBlank
    });
  }

  return baseItems;
};
