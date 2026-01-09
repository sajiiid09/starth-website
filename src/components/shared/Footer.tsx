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
      { label: "Customer Review", to: createPageUrl("Reviews") },
      { label: "Templates", to: createPageUrl("Templates") },
      { label: "Vendors", to: createPageUrl("Vendors") }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", to: createPageUrl("Terms") },
      { label: "Privacy", to: createPageUrl("Privacy") },
      { label: "Legals", to: createPageUrl("Legals") }
    ]
  }
];

export default function Footer() {
  const footerRef = React.useRef<HTMLElement>(null);
  useGsapReveal(footerRef, { distance: 20, stagger: 0.08 });

  return (
    <footer
      ref={footerRef}
      className="mt-16 border-t border-brand-dark/10 bg-brand-cream/70"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:px-8 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <div className="text-3xl font-semibold text-brand-dark">
            Strathwell
          </div>
          <p className="mt-3 text-sm text-brand-dark/60">
            Blueprint-first event planning with curated venues, vendors, and
            intelligent orchestration.
          </p>
          <Link
            to={createPageUrl("Home")}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-teal transition duration-200 ease-smooth hover:text-brand-dark"
          >
            Back to top <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
                {section.title}
              </div>
              <ul className="space-y-2 text-sm text-brand-dark/70">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="transition duration-200 ease-smooth hover:text-brand-dark"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-brand-dark/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-6 text-xs text-brand-dark/50 md:flex-row md:items-center md:px-8">
          <span>© {new Date().getFullYear()} Strathwell. All rights reserved.</span>
          <span>Designed for modern event orchestration.</span>
        </div>
      </div>
    </footer>
  );
}
