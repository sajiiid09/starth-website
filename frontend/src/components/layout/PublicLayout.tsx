import React from "react";
import HomeNav from "@/components/home-v2/HomeNav";
import Footer from "@/components/shared/Footer";

type PublicLayoutProps = {
  children: React.ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-brand-light text-brand-dark font-sans antialiased flex flex-col">
      <HomeNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
