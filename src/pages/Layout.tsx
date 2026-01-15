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
  const isDashboardRoute = 
    location.pathname.startsWith("/dashboard") ||
    location.pathname === "/vendor" ||
    location.pathname.startsWith("/vendor/") ||
    location.pathname === "/admin" ||
    location.pathname.startsWith("/admin/");
  const isAppEntry = currentPageName === "AppEntry" || location.pathname.startsWith("/appentry");

  if (isDashboardRoute) {
    return <DashboardShell>{children}</DashboardShell>;
  }

  return (
    <div
      className={`min-h-screen bg-brand-light text-brand-dark font-sans antialiased ${
        isAppEntry ? "" : "flex flex-col"
      }`}
    >
      {!isAppEntry && <HomeNav />}
      <main className={isAppEntry ? "" : "flex-1"}>{children}</main>
      {!isAppEntry && <Footer />}
    </div>
  );
}
