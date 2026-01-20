import {
  ClipboardList,
  Home,
  Inbox,
  Settings,
  Calendar,
  FileText,
  Building2,
  Briefcase
} from "lucide-react";
import type { VendorOnboardingStatus, VendorType } from "@/utils/session";

type VendorSidebarItem = {
  label: string;
  href: string;
  icon: typeof Home;
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
    { label: "Overview", href: "/vendor", icon: Home },
    {
      label: isApproved
        ? vendorType === "venue_owner"
          ? "Edit Venue Profile"
          : "Edit Service Profile"
        : vendorType === "venue_owner"
          ? "Venue Onboarding"
          : "Service Onboarding",
      href: onboardingPath,
      icon: vendorType === "venue_owner" ? Building2 : Briefcase
    },
    { label: profileLabel, href: "/vendor/profile", icon: ClipboardList },
    { label: "Submission Status", href: "/vendor/submission", icon: FileText },
    { label: "Settings", href: "/vendor/settings", icon: Settings }
  ];

  if (isApproved) {
    baseItems.splice(1, 0, {
      label: vendorType === "venue_owner" ? "Listings" : "Services",
      href: "/vendor/listings",
      icon: ClipboardList
    });
    baseItems.splice(2, 0, {
      label: "Inquiries",
      href: "/vendor/inquiries",
      icon: Inbox,
      badge: "5"
    });
    baseItems.splice(3, 0, {
      label: "Calendar",
      href: "/vendor/calendar",
      icon: Calendar
    });
  }

  return baseItems;
};
