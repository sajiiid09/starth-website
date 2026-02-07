import React from "react";
import { useLocation } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PublicLayout from "@/components/layout/PublicLayout";

type LayoutProps = {
  children: React.ReactNode;
};

// Routes that use DashboardShell (sidebar navigation)
const dashboardRoutePatterns = [
  /^\/dashboard(\/|$)/,
  /^\/vendor(\/|$)/,
  /^\/admin(\/|$)/
];

// Routes that should NOT have header/footer (auth flows)
const authRoutePatterns = [
  /^\/app-entry(\/|$)/,
  /^\/appentry(\/|$)/,
  /^\/signin(\/|$)/,
  /^\/verifyemail(\/|$)/,
  /^\/resetpassword(\/|$)/,
  /^\/forgotpassword(\/|$)/
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  // Check route type in priority order
  const isDashboardRoute = dashboardRoutePatterns.some((pattern) =>
    pattern.test(pathname)
  );
  const isAuthRoute = authRoutePatterns.some((pattern) =>
    pattern.test(pathname)
  );

  // Dashboard routes get the DashboardShell
  if (isDashboardRoute) {
    return <DashboardShell>{children}</DashboardShell>;
  }

  // Auth routes get minimal layout (no header/footer)
  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-brand-light text-brand-dark font-sans antialiased">
        <main>{children}</main>
      </div>
    );
  }

  // All other routes get PublicLayout with header and footer
  return <PublicLayout>{children}</PublicLayout>;
}
