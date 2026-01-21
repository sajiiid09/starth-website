import React from "react";
import { useLocation } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PublicLayout from "@/components/layout/PublicLayout";

type LayoutProps = {
  children: React.ReactNode;
};

const dashboardRoutePatterns = [/^\/dashboard(\/|$)/, /^\/vendor(\/|$)/, /^\/admin(\/|$)/];
const authRoutePatterns = [/^\/app-entry(\/|$)/, /^\/appentry(\/|$)/, /^\/signin(\/|$)/];
const footerDenyPatterns = [...dashboardRoutePatterns, ...authRoutePatterns];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isDashboardRoute = dashboardRoutePatterns.some((pattern) =>
    pattern.test(location.pathname)
  );
  const isAuthRoute = authRoutePatterns.some((pattern) =>
    pattern.test(location.pathname)
  );
  const shouldUsePublicLayout = !footerDenyPatterns.some((pattern) =>
    pattern.test(location.pathname)
  );

  if (isDashboardRoute) {
    return <DashboardShell>{children}</DashboardShell>;
  }

  if (shouldUsePublicLayout) {
    return <PublicLayout>{children}</PublicLayout>;
  }

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-brand-light text-brand-dark font-sans antialiased">
        <main>{children}</main>
      </div>
    );
  }

  return <PublicLayout>{children}</PublicLayout>;
}
