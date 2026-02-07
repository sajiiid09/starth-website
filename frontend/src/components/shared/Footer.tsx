import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin } from "@phosphor-icons/react";
import { createPageUrl } from "@/utils";
import useGsapReveal from "@/components/utils/useGsapReveal";

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "AI Planner", to: createPageUrl("AIPlanner") },
      { label: "Marketplace", to: createPageUrl("Marketplace") },
      { label: "Plan with Us", to: createPageUrl("DFY") }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About", to: createPageUrl("About") },
      { label: "Case Studies", to: createPageUrl("CaseStudies") },
      { label: "Contact", to: createPageUrl("Contact") }
    ]
  },
  {
    title: "Explore",
    links: [
      { label: "Reviews", to: createPageUrl("Reviews") },
      { label: "Templates", to: createPageUrl("Templates") },
      { label: "Vendors", to: createPageUrl("Vendors") }
    ]
  },
  {
    title: "Legals",
    links: [
      { label: "Privacy", to: createPageUrl("Privacy") },
      { label: "Terms", to: createPageUrl("Legals") }
    ]
  }
];

export default function Footer() {
  const footerRef = React.useRef<HTMLElement>(null);
  
  // Use the global GSAP animation hook
  useGsapReveal(footerRef, { distance: 30, stagger: 0.1 });

  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      ref={footerRef}
      className="relative mt-12 w-full overflow-hidden bg-brand-teal text-[#FFFBF4] sm:mt-16 md:mt-20"
    >
      {/* Top Section: Meta & Links */}
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        
        {/* Left: Location Indicator */}
        <div className="flex w-full flex-col gap-4 border-b border-[#FFFBF4]/20 p-5 sm:gap-6 sm:p-8 lg:w-1/3 lg:border-b-0 lg:border-r">
          <div className="flex items-start gap-3 text-xs font-medium uppercase tracking-widest opacity-80">
            <MapPin weight="fill" className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span>2 Hawthorne Pl</span>
              <span>Boston, MA 02114</span>
            </div>
          </div>
          
          <p className="mt-auto hidden text-sm opacity-60 lg:block">
            Orchestrating modern events with precision and style.
          </p>
        </div>

        {/* Right: Navigation Grid */}
        <div className="w-full border-b border-[#FFFBF4]/20 p-5 sm:p-8 lg:w-2/3 lg:border-b-0">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
            {footerSections.map((section) => (
              <div key={section.title} className="flex flex-col gap-3 sm:gap-4">
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#FFFBF4]/50 sm:text-xs">
                  {section.title}
                </h4>
                <ul className="flex flex-col gap-2 sm:gap-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="group relative inline-block overflow-hidden text-sm font-medium leading-6"
                      >
                        <span className="inline-block transition-transform duration-300 ease-smooth group-hover:-translate-y-full">
                          {link.label}
                        </span>
                        <span className="absolute left-0 top-0 inline-block translate-y-full transition-transform duration-300 ease-smooth group-hover:translate-y-0">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="mx-auto w-full max-w-[1400px] border-t border-[#FFFBF4]/20" />

      {/* Main Bottom Section */}
      <div className="mx-auto flex max-w-[1400px] flex-col justify-between px-5 py-8 sm:px-8 sm:py-12 lg:flex-row lg:items-end lg:py-16">
        
        {/* Big Branding Text */}
        <div>
          <h1 className="font-display text-[15vw] font-semibold leading-[0.85] tracking-tighter text-[#FFFBF4] sm:text-[12vw] md:text-[10vw] lg:text-[8rem] xl:text-[10rem]">
            Strathwell
          </h1>
        </div>

        {/* Bottom Right: Copyright & Back to Top */}
        <div className="mt-8 flex flex-col-reverse items-start gap-3 text-xs font-medium uppercase tracking-widest sm:flex-row sm:items-center sm:gap-6 lg:mt-0 lg:flex-col lg:items-end lg:gap-4">
          <div className="opacity-60">
            © {currentYear} Strathwell Inc.
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 border-b border-transparent pb-0.5 transition-colors hover:border-[#FFFBF4]"
          >
            Back to top <ArrowUpRight weight="bold" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
