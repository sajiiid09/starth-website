import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
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
      { label: "Terms & Conditions", to: createPageUrl("Legals") }
    ]
  }
];

export default function Footer() {
  const footerRef = React.useRef<HTMLElement>(null);
  
  // Use the global GSAP animation hook
  useGsapReveal(footerRef, { distance: 30, stagger: 0.1 });

  const currentYear = new Date().getFullYear();

  return (
    <footer
      ref={footerRef}
      className="relative mt-16 w-full overflow-hidden bg-[#027F83] text-[#FFFBF4] md:mt-20"
    >
      {/* Top Section: Meta & Links */}
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        
        {/* Left: Time/Location Indicators (Replicating reference top-left) */}
        <div className="flex w-full flex-col gap-6 border-b border-[#FFFBF4]/20 p-6 sm:p-8 lg:w-1/3 lg:border-r lg:border-b-0">
          <div className="flex items-start gap-6 text-xs font-medium uppercase tracking-widest opacity-80 sm:gap-12">
              <div className="flex gap-3">
                <div className="mt-1 h-3 w-3 animate-pulse rounded-full bg-[#FFFBF4]" />
                <div className="flex flex-col gap-1">
                  <span>2 Hawthorne Pl</span>
                  <span>Boston, MA 02114</span>
                </div>
              </div>
          </div>
          
          <div className="mt-auto hidden lg:block">
             <p className="max-w-[200px] text-sm opacity-60">
               Orchestrating modern events with precision and style.
             </p>
          </div>
        </div>

        {/* Right: Navigation Grid */}
        <div className="w-full border-b border-[#FFFBF4]/20 p-6 sm:p-8 lg:w-2/3 lg:border-b-0">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
            {footerSections.map((section) => (
              <div key={section.title} className="flex flex-col gap-4">
                <h4 className="font-mono text-xs uppercase tracking-widest text-[#FFFBF4]/50">
                  {section.title}
                </h4>
                <ul className="flex flex-col gap-3">
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
      <div className="mx-auto flex max-w-[1400px] flex-col justify-between px-6 py-12 sm:px-8 sm:py-16 lg:flex-row lg:items-end">
        
        {/* Big Branding Area */}
        <div className="flex flex-col gap-6">
          {/* Logo Graphic & Description */}
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              {/* Abstract Logo Icon Box */}



            </div>

          {/* Tagline - MOVED BEFORE TEXT */}
          <div className="max-w-xs text-xs font-light leading-snug tracking-wide opacity-90 sm:text-base">
               Turning untapped spaces and services into unforgettable events with patented AI matching
             </div>

          {/* Massive Text - MOVED AFTER TAGLINE */}
          <h1 className="mt-4 font-sans text-[14vw] font-bold leading-[0.85] tracking-tighter text-[#FFFBF4] sm:text-[10vw] lg:text-[10rem]">
            Strathwell
          </h1>
        </div>

        {/* Bottom Right: Copyright & Back to Top */}
        <div className="mt-10 flex flex-col items-start gap-4 text-xs font-medium uppercase tracking-widest lg:items-end lg:text-right">
          <Link
            to={createPageUrl("Home")}
            className="flex items-center gap-2 border-b border-transparent pb-1 transition-colors hover:border-[#FFFBF4]"
          >
            Back to top <ArrowUpRight className="h-4 w-4" />
          </Link>
          <div className="opacity-60">
            © {currentYear} Strathwell Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
