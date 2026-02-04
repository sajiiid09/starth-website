import { Calendar, Home, MessageSquare, Settings, Sparkles, type LucideIcon } from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  to: string;
  aliases?: string[];
};

export const organizerNavItems: NavItem[] = [
  {
    id: "dashboard-home",
    label: "Dashboard Home",
    icon: Home,
    to: "/dashboard",
    aliases: ["/dashboard/home"]
  },
  {
    id: "events",
    label: "Events",
    icon: Calendar,
    to: "/dashboard/events"
  },
  {
    id: "ai-planner",
    label: "AI Planner",
    icon: Sparkles,
    to: "/dashboard/ai-planner",
    aliases: ["/dashboard/plan-with-ai"]
  },
  {
    id: "messages",
    label: "Messages",
    icon: MessageSquare,
    to: "/dashboard/messages"
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
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
