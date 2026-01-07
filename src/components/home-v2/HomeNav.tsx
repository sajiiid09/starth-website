import React from "react";
import { ChevronDown } from "lucide-react";
import Container from "@/components/home-v2/primitives/Container";
import PillButton from "@/components/home-v2/primitives/PillButton";
import { navThemeClasses } from "@/components/home-v2/navTheme";
import { cn } from "@/lib/utils";
import { useNavTheme } from "@/components/home-v2/state/navThemeStore";

const navLinks = [
  { label: "Platform", href: "#home-platform" },
  { label: "Solutions", dropdown: true },
  { label: "Verticals", dropdown: true }
];

const dropdownItems = ["Overview", "Case studies", "Pricing"];

const HomeNav: React.FC = () => {
  const { activeTheme } = useNavTheme();
  const themeClasses = navThemeClasses[activeTheme];
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

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
        <a
          href="#home-hero"
          className={cn("text-lg font-semibold tracking-tight", themeClasses.text)}
        >
          Strathwell
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            if (link.dropdown) {
              const isOpen = openDropdown === link.label;
              return (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpenDropdown(isOpen ? null : link.label)
                    }
                    className={cn(
                      "inline-flex items-center gap-2 text-sm font-medium transition-colors duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/30 focus-visible:ring-offset-2",
                      themeClasses.link,
                      themeClasses.linkHover
                    )}
                  >
                    {link.label}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {isOpen && (
                    <div
                      className={cn(
                        "absolute left-1/2 top-full mt-3 w-56 -translate-x-1/2 rounded-r16 border p-4 shadow-soft",
                        themeClasses.dropdown
                      )}
                    >
                      <div className="space-y-3">
                        {dropdownItems.map((item) => (
                          <a
                            key={item}
                            href="#"
                            className={cn(
                              "block rounded-lg px-3 py-2 text-sm transition-colors duration-150 ease-smooth",
                              themeClasses.dropdownItem
                            )}
                          >
                            {item}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-150 ease-smooth",
                  themeClasses.link,
                  themeClasses.linkHover
                )}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href="#"
            className={cn(
              "text-sm font-medium transition-colors duration-150 ease-smooth",
              themeClasses.link,
              themeClasses.linkHover
            )}
          >
            Log in
          </a>
          <PillButton
            variant="secondary"
            size="sm"
            className={cn(
              "min-h-[40px] px-5",
              themeClasses.cta,
              themeClasses.ctaHover
            )}
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
    </nav>
  );
};

export default HomeNav;
