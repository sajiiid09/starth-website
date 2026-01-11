import {
  ClipboardList,
  Home,
  Inbox,
  Settings,
  Calendar
} from "lucide-react";

export const sidebarVendor = [
  { label: "Dashboard Home", href: "/vendor", icon: Home },
  { label: "Listings", href: "/vendor/listings", icon: ClipboardList },
  { label: "Inquiries", href: "/vendor/inquiries", icon: Inbox, badge: "5" },
  { label: "Calendar", href: "/vendor/calendar", icon: Calendar },
  { label: "Settings", href: "/vendor/settings", icon: Settings }
];
