import {
  Users,
  Home,
  LayoutTemplate,
  Settings,
  Shield
} from "lucide-react";

export const sidebarAdmin = [
  { label: "Dashboard Home", href: "/admin", icon: Home },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Vendors", href: "/admin/vendors", icon: Shield },
  { label: "Templates", href: "/admin/templates", icon: LayoutTemplate },
  { label: "Settings", href: "/admin/settings", icon: Settings }
];
