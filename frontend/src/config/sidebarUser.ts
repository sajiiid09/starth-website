import {
  Calendar,
  Tray,
  SquaresFour,
  Gear,
  Sparkle,
  Storefront
} from "@phosphor-icons/react";

export const sidebarUser = [
  { label: "AI Planner", href: "/dashboard/ai-planner", icon: Sparkle },
  { label: "Events", href: "/dashboard/events", icon: Calendar },
  { label: "Templates", href: "/dashboard/templates", icon: SquaresFour },
  { label: "Marketplace", href: "/dashboard/marketplace", icon: Storefront },
  { label: "Inbox", href: "/dashboard/messages", icon: Tray, badge: "3" },
  { label: "Settings", href: "/dashboard/settings", icon: Gear }
];
