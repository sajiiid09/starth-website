import React from "react";
import { useLocation } from "react-router-dom";
import HomeNav from "@/components/home-v2/HomeNav";
import Footer from "@/components/shared/Footer";
import DashboardShell from "@/components/dashboard/DashboardShell";

type LayoutProps = {
  children: React.ReactNode;
  currentPageName: string;
};

export default function Layout({ children, currentPageName }: LayoutProps) {
  const location = useLocation();
  const isDashboardRoute = ["/dashboard", "/vendor", "/admin"].some((path) =>
    location.pathname.startsWith(path)
  );
  const isAppEntry = currentPageName === "AppEntry" || location.pathname.startsWith("/appentry");

  if (isDashboardRoute) {
    return <DashboardShell>{children}</DashboardShell>;
  }

  return (
    <div className="min-h-screen bg-brand-light text-brand-dark">
      {!isAppEntry && <HomeNav />}
      <main className={isAppEntry ? "" : ""}>{children}</main>
      {!isAppEntry && <Footer />}
    </div>
  );
}
