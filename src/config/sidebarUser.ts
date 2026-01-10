import {
  Calendar,
  Home,
  MessageSquare,
  PlusCircle,
  Settings
} from "lucide-react";

export const sidebarUser = [
  { label: "Dashboard Home", href: "/dashboard", icon: Home },
  { label: "Events", href: "/dashboard/events", icon: Calendar },
  { label: "Create Event", href: "/dashboard/create", icon: PlusCircle },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare, badge: "3" },
  { label: "Settings", href: "/dashboard/settings", icon: Settings }
];
