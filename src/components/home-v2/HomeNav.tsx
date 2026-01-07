import React from "react";
import Container from "@/components/home-v2/primitives/Container";
import PillButton from "@/components/home-v2/primitives/PillButton";

const HomeNav: React.FC = () => {
  return (
    <nav className="border-b border-brand-dark/10 bg-brand-light" data-theme="light">
      <Container className="flex min-h-[72px] items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold uppercase tracking-caps text-brand-dark">
            Strathwell
          </span>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <PillButton variant="ghost" size="sm">
            Platform
          </PillButton>
          <PillButton variant="ghost" size="sm">
            Solutions
          </PillButton>
          <PillButton variant="secondary" size="sm">
            Book demo
          </PillButton>
        </div>
      </Container>
    </nav>
  );
};

export default HomeNav;
