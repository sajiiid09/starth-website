import {
  Users,
  House,
  SquaresFour,
  Gear,
  ShieldCheck,
  Bank,
  Calendar,
  CreditCard,
  Coins,
  Scroll,
  Scales,
  Wrench
} from "@phosphor-icons/react";
import { hasAdminOpsTools } from "@/features/admin/config";

const baseItems = [
  { label: "Dashboard Home", href: "/admin", icon: House },
  { label: "Finance Overview", href: "/admin/finance", icon: Bank },
  { label: "Bookings", href: "/admin/bookings", icon: Calendar },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Payouts", href: "/admin/payouts", icon: Coins },
  { label: "Disputes", href: "/admin/disputes", icon: Scales },
  { label: "Audit Logs", href: "/admin/audit", icon: Scroll },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Vendors", href: "/admin/vendors", icon: ShieldCheck },
  { label: "Templates", href: "/admin/templates", icon: SquaresFour },
  { label: "Settings", href: "/admin/settings", icon: Gear }
];

export const sidebarAdmin = hasAdminOpsTools
  ? [...baseItems, { label: "Ops Tools", href: "/admin/ops", icon: Wrench }]
  : baseItems;
