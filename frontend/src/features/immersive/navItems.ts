import { Calendar, Tray, SquaresFour, Gear, Sparkle, Storefront, type Icon } from "@phosphor-icons/react";

export type NavItem = {
  id: string;
  label: string;
  icon: Icon;
  to: string;
  aliases?: string[];
  badge?: string;
};

export const organizerNavItems: NavItem[] = [
  {
    id: "ai-planner",
    label: "AI Planner",
    icon: Sparkle,
    to: "/dashboard/ai-planner",
    aliases: ["/dashboard/plan-with-ai", "/dashboard"]
  },
  {
    id: "events",
    label: "Events",
    icon: Calendar,
    to: "/dashboard/events"
  },
  {
    id: "templates",
    label: "Templates",
    icon: SquaresFour,
    to: "/dashboard/templates"
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: Storefront,
    to: "/dashboard/marketplace"
  },
  {
    id: "inbox",
    label: "Inbox",
    icon: Tray,
    to: "/dashboard/messages",
    badge: "3"
  },
  {
    id: "settings",
    label: "Settings",
    icon: Gear,
    to: "/dashboard/settings"
  }
];

export const isNavItemActive = (item: NavItem, pathname: string) => {
  if (pathname === item.to) {
    return true;
  }

  if (!item.aliases) {
    return false;
  }

  return item.aliases.includes(pathname);
};
