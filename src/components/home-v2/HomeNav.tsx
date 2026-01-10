import React from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "@/components/home-v2/primitives/Container";
import PillButton from "@/components/home-v2/primitives/PillButton";
import { navThemeClasses } from "@/components/home-v2/navTheme";
import { cn } from "@/lib/utils";
import { useNavTheme } from "@/components/home-v2/state/navThemeStore";
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
  { label: "Popular Vendors", to: createPageUrl("Vendors"), comingSoon: true },
  { label: "Plan with Us", to: createPageUrl("DFY") },
  { label: "AI Planner", to: createPageUrl("AIPlanner") }
];

const exploreItems = [
  { label: "Case Studies", to: createPageUrl("CaseStudies") },
  { label: "Customer Review", to: createPageUrl("Reviews") },
  { label: "Contact", to: createPageUrl("Contact") },
  { label: "Legals", to: createPageUrl("Legals"), comingSoon: true }
];

const HomeNav: React.FC = () => {
  const { activeTheme } = useNavTheme();
  const themeClasses = navThemeClasses[activeTheme] || navThemeClasses.light;
  const [showDemoModal, setShowDemoModal] = React.useState(false);

  const dropdownContentClasses = cn(
    "w-[min(40vw,560px)] min-w-[320px] rounded-2xl border p-6 shadow-card backdrop-blur-xl",
    themeClasses.dropdown
  );
  const dropdownItemClasses = cn(
    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors duration-150 ease-smooth",
    themeClasses.dropdownItem
  );

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b",
        themeClasses.shell,
        themeClasses.border
      )}
      data-theme={activeTheme}
    >
      <Container className="flex h-[72px] items-center justify-between">
        <Link to={createPageUrl("Home")} className="flex items-center">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/ddf404508_Elegant_Simple_Aesthetic_Real_Estate_Logo__1_-removebg-preview.png"
            alt="Strathwell"
            className="h-12 w-auto"
          />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            to={createPageUrl("About")}
            className={cn(
              "text-sm font-medium transition-colors duration-150 ease-smooth",
              themeClasses.link,
              themeClasses.linkHover
            )}
          >
            About
          </Link>
          <Link
            to={createPageUrl("AIPlanner")}
            className={cn(
              "text-sm font-medium transition-colors duration-150 ease-smooth",
              themeClasses.link,
              themeClasses.linkHover
            )}
          >
            AI Planner
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-2 text-sm font-medium transition-colors duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/30 focus-visible:ring-offset-2",
                  themeClasses.link,
                  themeClasses.linkHover
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-2 text-sm font-medium transition-colors duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/30 focus-visible:ring-offset-2",
                  themeClasses.link,
                  themeClasses.linkHover
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
              "text-sm font-medium transition-colors duration-150 ease-smooth",
              themeClasses.link,
              themeClasses.linkHover
            )}
          >
            Log in
          </Link>
          <PillButton
            variant="secondary"
            size="sm"
            className={cn(
              "min-h-[40px] px-5",
              themeClasses.cta,
              themeClasses.ctaHover
            )}
            onClick={() => setShowDemoModal(true)}
          >
            Book a demo
          </PillButton>
        </div>

        <button
          type="button"
          className={cn(
            "inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium md:hidden",
            themeClasses.border,
            themeClasses.text
          )}
        >
          Menu
        </button>
      </Container>
      <DemoRequestModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
    </nav>
  );


};
