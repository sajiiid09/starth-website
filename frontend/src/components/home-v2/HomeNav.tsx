import React from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "@/components/home-v2/primitives/Container";
import PillButton from "@/components/home-v2/primitives/PillButton";
import { cn } from "@/lib/utils";
import { createPageUrl } from "@/utils";
import DemoRequestModal from "@/components/marketing/DemoRequestModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const solutionsItems = [
  { label: "Marketplace", to: createPageUrl("Marketplace") },
  { label: "Event Templates", to: createPageUrl("Templates") },
  { label: "Popular Vendors", to: createPageUrl("Vendors") },
  { label: "Plan with Us", to: createPageUrl("DFY") },
];

const exploreItems = [
  { label: "Case Studies", to: createPageUrl("CaseStudies") },
  { label: "Reviews", to: createPageUrl("Reviews") },
  { label: "Contact", to: createPageUrl("Contact") },
  { label: "Legal", to: createPageUrl("Legal") }
];

const HomeNav: React.FC = () => {
  const [showDemoModal, setShowDemoModal] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const dropdownContentClasses = cn(
    "w-[min(40vw,560px)] min-w-[320px] rounded-2xl border border-white/30 bg-white/70 p-6 text-brand-dark shadow-card backdrop-blur-2xl"
  );
  const dropdownItemClasses = cn(
    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-brand-dark/80 transition-colors duration-150 ease-smooth hover:bg-white/60 hover:text-brand-dark"
  );

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 shadow-sm backdrop-blur-2xl"
      )}
    >
      <Container className="flex h-[80px] items-center justify-between">
        <Link to={createPageUrl("Home")} className="flex items-center">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/ddf404508_Elegant_Simple_Aesthetic_Real_Estate_Logo__1_-removebg-preview.png"
            alt="Strathwell"
            className="h-16 w-auto sm:h-20 md:h-[88px]"
          />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            to={createPageUrl("About")}
            className={cn(
              "text-sm font-medium text-brand-dark/80 transition-colors duration-150 ease-smooth hover:text-brand-dark"
            )}
          >
            About
          </Link>
          <Link
            to={createPageUrl("AIPlanner")}
            className={cn(
              "text-sm font-medium text-brand-dark/80 transition-colors duration-150 ease-smooth hover:text-brand-dark"
            )}
          >
            AI Planner
          </Link>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-2 text-sm font-medium text-brand-dark/80 transition-colors duration-150 ease-smooth hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/30 focus-visible:ring-offset-2"
                )}
              >
                Solutions
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className={dropdownContentClasses} side="bottom" asChild>
              <div className="space-y-3">
                {solutionsItems.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link to={item.to} className={dropdownItemClasses}>
                      <span>{item.label}</span>

                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-2 text-sm font-medium text-brand-dark/80 transition-colors duration-150 ease-smooth hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/30 focus-visible:ring-offset-2"
                )}
              >
                Explore
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className={dropdownContentClasses} side="bottom" asChild>
              <div className="space-y-3">
                {exploreItems.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link to={item.to} className={dropdownItemClasses}>
                      <span>{item.label}</span>

                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            to={createPageUrl("Plans")}
            className={cn(
              "text-sm font-medium text-brand-dark/80 transition-colors duration-150 ease-smooth hover:text-brand-dark"
            )}
          >
            Pricing
          </Link>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            to={createPageUrl("AppEntry")}
            className={cn(
              "text-sm font-medium text-brand-dark/80 transition-colors duration-150 ease-smooth hover:text-brand-dark"
            )}
          >
            Log in
          </Link>
          <PillButton
            variant="secondary"
            size="sm"
            className={cn(
              "min-h-[40px] border-brand-teal px-5 text-brand-teal hover:bg-brand-teal hover:text-brand-light"
            )}
            onClick={() => setShowDemoModal(true)}
          >
            Book a demo
          </PillButton>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-dark/10 bg-white/80 text-brand-dark shadow-soft transition hover:border-brand-dark/30"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {isMobileMenuOpen && (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 z-40 bg-brand-dark/30 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 border-b border-white/30 bg-white/95 shadow-card backdrop-blur-2xl">
            <div className="mx-auto flex max-h-[calc(100vh-96px)] w-full max-w-[1400px] flex-col gap-6 overflow-y-auto px-6 py-6">
              <div className="flex flex-col gap-3">
                <Link
                  to={createPageUrl("About")}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl border border-brand-dark/10 bg-white/70 px-4 py-3 text-sm font-semibold text-brand-dark"
                >
                  About
                </Link>
                <Link
                  to={createPageUrl("AIPlanner")}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl border border-brand-dark/10 bg-white/70 px-4 py-3 text-sm font-semibold text-brand-dark"
                >
                  AI Planner
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark/40">
                    Solutions
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    {solutionsItems.map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="rounded-xl border border-brand-dark/10 bg-white/70 px-4 py-3 text-sm font-medium text-brand-dark/80"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark/40">
                    Explore
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    {exploreItems.map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="rounded-xl border border-brand-dark/10 bg-white/70 px-4 py-3 text-sm font-medium text-brand-dark/80"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to={createPageUrl("Plans")}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl border border-brand-dark/10 bg-white/70 px-4 py-3 text-sm font-semibold text-brand-dark"
                >
                  Pricing
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to={createPageUrl("AppEntry")}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full border border-brand-dark/10 bg-white px-4 py-3 text-center text-sm font-semibold text-brand-dark"
                >
                  Log in
                </Link>
                <PillButton
                  variant="secondary"
                  size="sm"
                  className={cn(
                    "min-h-[44px] border-brand-teal px-5 text-brand-teal hover:bg-brand-teal hover:text-brand-light"
                  )}
                  onClick={() => {
                    setShowDemoModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Book a demo
                </PillButton>
              </div>
            </div>
          </div>
        </div>
      )}
      <DemoRequestModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
    </nav>
  );


};

export default HomeNav;
