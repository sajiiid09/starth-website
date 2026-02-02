import {
  Users,
  Home,
  LayoutTemplate,
  Settings,
  Shield,
  Landmark,
  CalendarRange,
  CreditCard,
  HandCoins,
  ScrollText,
  Scale,
  Wrench
} from "lucide-react";
import { hasAdminOpsTools } from "@/features/admin/config";

const baseItems = [
  { label: "Dashboard Home", href: "/admin", icon: Home },
  { label: "Finance Overview", href: "/admin/finance", icon: Landmark },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarRange },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Payouts", href: "/admin/payouts", icon: HandCoins },
  { label: "Disputes", href: "/admin/disputes", icon: Scale },
  { label: "Audit Logs", href: "/admin/audit", icon: ScrollText },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Vendors", href: "/admin/vendors", icon: Shield },
  { label: "Templates", href: "/admin/templates", icon: LayoutTemplate },
  { label: "Settings", href: "/admin/settings", icon: Settings }
];

export const sidebarAdmin = hasAdminOpsTools
  ? [...baseItems, { label: "Ops Tools", href: "/admin/ops", icon: Wrench }]
  : baseItems;
