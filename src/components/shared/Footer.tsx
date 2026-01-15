import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Globe, BoxSelect } from "lucide-react"; // Added icons for the logo graphic
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
    title: "Legal",
    links: [
      { label: "Legal", to: createPageUrl("Legal") },
      { label: "Terms", to: createPageUrl("Terms") },
      { label: "Privacy", to: createPageUrl("Privacy") },
      { label: "Legals", to: createPageUrl("Legals") }
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
      className="relative mt-20 w-full overflow-hidden bg-[#027F83] text-[#FFFBF4]"
    >
      {/* Top Section: Meta & Links */}
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        
        {/* Left: Time/Location Indicators (Replicating reference top-left) */}
        <div className="flex w-full flex-col gap-8 border-b border-[#FFFBF4]/20 p-8 lg:w-1/3 lg:border-r lg:border-b-0">
          <div className="flex items-start gap-12 text-xs font-medium uppercase tracking-widest opacity-80">
            <div className="flex gap-3">
              <div className="mt-1 h-3 w-3 animate-pulse rounded-full bg-[#FFFBF4]" />
              <div className="flex flex-col gap-1">
                <span>9:41 AM ET</span>
                <span>New York</span>
                <span>USA</span>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-[#FFFBF4]/40" />
              <div className="flex flex-col gap-1">
                <span>2:41 PM GMT</span>
                <span>London</span>
                <span>UK</span>
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
        <div className="w-full border-b border-[#FFFBF4]/20 p-8 lg:w-2/3 lg:border-b-0">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
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
                        className="group relative inline-block overflow-hidden text-sm font-medium"
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
      <div className="mx-auto flex max-w-[1400px] flex-col justify-between px-8 py-16 lg:flex-row lg:items-end">
        
        {/* Big Branding Area */}
        <div className="flex flex-col gap-6">
          {/* Logo Graphic & Description */}
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
             {/* Abstract Logo Icon Box */}
             <div className="flex h-16 w-16 items-center justify-center border border-[#FFFBF4]/30 bg-[#FFFBF4]/5 backdrop-blur-sm">
                <BoxSelect className="h-8 w-8 stroke-1 text-[#FFFBF4]" />
             </div>
             
             <div className="max-w-xs text-lg font-light leading-snug tracking-wide opacity-90">
               AN INTELLIGENT EVENT <br />
               & PLANNING STUDIO
             </div>
          </div>

          {/* Massive Text */}
          <h1 className="mt-4 font-sans text-[12vw] font-bold leading-[0.8] tracking-tighter text-[#FFFBF4] lg:text-[10rem]">
            Strathwell
          </h1>
        </div>

        {/* Bottom Right: Copyright & Back to Top */}
        <div className="mt-12 flex flex-col items-start gap-4 text-xs font-medium uppercase tracking-widest lg:items-end lg:text-right">
          <Link 
            to={createPageUrl("Home")}
            className="flex items-center gap-2 border-b border-transparent pb-1 transition-colors hover:border-[#FFFBF4]"
          >
            Back to top <ArrowUpRight className="h-4 w-4" />
          </Link>
          <div className="opacity-60">
            © {currentYear} strathwell LLC
          </div>
        </div>
      </div>
    </footer>
  );
}
