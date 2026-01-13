import React from "react";
import { ChevronDown } from "lucide-react";
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
  { label: "Event Templates", to: createPageUrl("Templates"), comingSoon: true },
  { label: "Popular Vendors", to: createPageUrl("Vendors") },
  { label: "Plan with Us", to: createPageUrl("DFY") },
  { label: "AI Planner", to: createPageUrl("AIPlanner") }
];

const exploreItems = [
  { label: "Case Studies", to: createPageUrl("CaseStudies") },
  { label: "Reviews", to: createPageUrl("Reviews") },
  { label: "Contact", to: createPageUrl("Contact") },
  { label: "Legal", to: createPageUrl("Legal") }
];

const HomeNav: React.FC = () => {
  const [showDemoModal, setShowDemoModal] = React.useState(false);

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
            className="h-14 w-auto sm:h-16 md:h-[72px]"
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
                      {item.comingSoon && (
                        <span className="text-xs uppercase tracking-[0.2em] text-brand-dark/50">
                          Coming soon
                        </span>
                      )}
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
                      {item.comingSoon && (
                        <span className="text-xs uppercase tracking-[0.2em] text-brand-dark/50">
                          Coming soon
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
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

        
      </Container>
      <DemoRequestModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
    </nav>
  );


};

export default HomeNav;
