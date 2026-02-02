import {
  Users,
  Home,
  LayoutTemplate,
  Settings,
  Shield,
  Landmark,
  CalendarRange,
  CreditCard,
  HandCoins
} from "lucide-react";

export const sidebarAdmin = [
  { label: "Dashboard Home", href: "/admin", icon: Home },
  { label: "Finance Overview", href: "/admin/finance", icon: Landmark },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarRange },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Payouts", href: "/admin/payouts", icon: HandCoins },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Vendors", href: "/admin/vendors", icon: Shield },
  { label: "Templates", href: "/admin/templates", icon: LayoutTemplate },
  { label: "Settings", href: "/admin/settings", icon: Settings }
];
