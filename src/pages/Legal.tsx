import React, { useEffect, useState, useRef } from "react";
import Container from "@/components/home-v2/primitives/Container";
import Section from "@/components/home-v2/primitives/Section";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH1 from "@/components/home-v2/primitives/DisplayH1";
import Lead from "@/components/home-v2/primitives/Lead";
import FadeIn from "@/components/animations/FadeIn";
import { ScrollText, ShieldCheck, Scale, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Data Structure ---
const legalSections = [
  {
    id: "company-info",
    title: "1. Company Information",
    content: (
      <div className="space-y-1">
        <p className="font-semibold text-brand-dark">Strathwell, Inc.</p>
        <p>A Delaware C-Corporation</p>
        <p>United States</p>
      </div>
    )
  },
  {
    id: "acceptance",
    title: "2. Acceptance of Terms",
    content: (
      <div className="space-y-4">
        <p>
          By accessing or using the Services, you agree to be bound by these Legal Terms, 
          including our Terms of Service, Privacy Policy, and any additional policies referenced herein.
        </p>
        <div className="rounded-lg border border-brand-coral/20 bg-brand-coral/5 p-4 text-sm font-medium text-brand-coral">
          If you do not agree, you may not access or use the Services.
        </div>
      </div>
    )
  },
  {
    id: "terms-of-service",
    title: "3. Terms of Service",
    content: (
      <div className="space-y-4">
        <p>
          Strathwell provides an AI-powered event planning, orchestration, and marketplace platform 
          that connects users with venues, spaces, service providers, and event-related tools.
        </p>
        <div>
          <p className="font-semibold mb-2">You agree that you will:</p>
          <ul className="space-y-2">
            {[
              "Use the Services only for lawful purposes",
              "Provide accurate and complete information",
              "Not misuse, scrape, reverse-engineer, or interfere with the platform"
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-brand-dark/80">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-teal" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs uppercase tracking-widest text-brand-dark/50">
          * Strathwell reserves the right to suspend or terminate access for violations of these terms.
        </p>
      </div>
    )
  },
  {
    id: "marketplace-disclaimer",
    title: "4. Marketplace & Third-Party Services Disclaimer",
    content: (
      <div className="space-y-3">
        <p className="font-medium text-brand-dark">Strathwell acts as a technology platform only.</p>
        <ul className="space-y-2">
          {[
            "Strathwell does not own, operate, or control third-party venues, spaces, or service providers listed on the platform.",
            "Any agreements, payments, or disputes between users and third parties are strictly between those parties.",
            "Strathwell disclaims all liability arising from third-party services, venues, vendors, or events."
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-brand-dark/80">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-dark/40" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  },
  {
    id: "payments",
    title: "5. Payments & Fees",
    content: (
      <div className="space-y-3">
        <p>Certain features may require payment or subscription.</p>
        <ul className="space-y-2">
          {[
            "All fees are disclosed prior to purchase",
            "Payments are processed via third-party payment processors",
            "Fees are non-refundable unless explicitly stated"
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-brand-dark/80">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-teal" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm italic text-brand-dark/60">
          Strathwell is not responsible for payment processor errors or disputes.
        </p>
      </div>
    )
  },
  {
    id: "ip",
    title: "6. Intellectual Property",
    content: (
      <div className="space-y-4">
        <p>
          All content, software, algorithms, AI models, workflows, trademarks, logos, and designs 
          associated with Strathwell are the exclusive property of Strathwell, Inc. or its licensors.
        </p>
        <div className="rounded-lg bg-brand-dark/5 p-4 text-sm font-medium text-brand-dark">
          You may not copy, modify, distribute, sell, or exploit any part of the Services without prior written consent.
        </div>
      </div>
    )
  },
  {
    id: "ai-disclaimer",
    title: "7. AI & Automated Decision-Making Disclaimer",
    content: (
      <div className="space-y-4">
        <p>
          Strathwell uses artificial intelligence and automated systems to assist with event planning, 
          matching, recommendations, and orchestration.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            "AI outputs are informational and assistive only",
            "Results may be incomplete, inaccurate, or non-deterministic",
            "Users are solely responsible for final decisions and outcomes",
            "Strathwell makes no guarantees regarding AI accuracy or suitability"
          ].map((item) => (
            <div key={item} className="rounded-lg border border-brand-teal/20 bg-brand-teal/5 p-3 text-sm text-brand-dark/80">
              {item}
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: "liability",
    title: "8. Limitation of Liability",
    content: (
      <div className="space-y-3">
        <p className="font-semibold">To the maximum extent permitted by law:</p>
        <ul className="space-y-2 text-brand-dark/80">
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-teal" />
            <span>Strathwell shall not be liable for indirect, incidental, consequential, or punitive damages</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-teal" />
            <span>Total liability shall not exceed the amount paid to Strathwell in the preceding 12 months</span>
          </li>
        </ul>
        <p className="font-medium text-brand-dark">Use of the Services is at your own risk.</p>
      </div>
    )
  },
  {
    id: "indemnification",
    title: "9. Indemnification",
    content: (
      <div className="space-y-2">
        <p>
          You agree to indemnify and hold harmless Strathwell, Inc., its officers, directors, employees, 
          and partners from any claims, damages, losses, or expenses arising from:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-brand-dark/80 marker:text-brand-teal">
          <li>Your use of the Services</li>
          <li>Your violation of these terms</li>
          <li>Your interaction with third parties</li>
        </ul>
      </div>
    )
  },
  {
    id: "privacy-policy",
    title: "10. Privacy Policy",
    content: (
      <div className="space-y-3">
        <p>
          Your use of the Services is subject to our Privacy Policy, which explains how we collect, 
          use, and protect personal data.
        </p>
        <p className="flex items-center gap-2 text-sm font-medium text-brand-teal">
          <ShieldCheck className="h-4 w-4" />
          Strathwell complies with applicable data protection laws, including U.S. privacy standards and, where applicable, GDPR principles.
        </p>
      </div>
    )
  },
  {
    id: "termination",
    title: "11. Termination",
    content: (
      <div className="space-y-3">
        <p>
          Strathwell may suspend or terminate access to the Services at any time, with or without notice, 
          for any violation of these terms or applicable law.
        </p>
        <p className="text-sm text-brand-dark/60">
          Sections relating to IP, liability, indemnification, and governing law shall survive termination.
        </p>
      </div>
    )
  },
  {
    id: "governing-law",
    title: "12. Governing Law & Jurisdiction",
    content: (
      <div className="flex items-start gap-3 rounded-lg border border-brand-dark/10 bg-white p-4">
        <Scale className="mt-1 h-5 w-5 text-brand-dark/40" />
        <div className="space-y-2 text-sm">
          <p>These Legal Terms are governed by the laws of the State of Delaware, without regard to conflict-of-law principles.</p>
          <p>Any disputes shall be resolved exclusively in state or federal courts located in Delaware.</p>
        </div>
      </div>
    )
  },
  {
    id: "changes",
    title: "13. Changes to These Terms",
    content: (
      <div className="space-y-2">
        <p>Strathwell may update these Legal Terms at any time.</p>
        <p className="text-sm font-medium text-brand-dark/80">
          Changes become effective upon posting. Continued use of the Services constitutes acceptance of the updated terms.
        </p>
      </div>
    )
  },
  {
    id: "contact",
    title: "14. Contact",
    content: (
      <div>
        <p className="mb-2">For legal, compliance, or policy questions:</p>
        <a 
          href="mailto:info@strathwell.com" 
          className="text-lg font-bold text-brand-teal hover:underline"
        >
          info@strathwell.com
        </a>
      </div>
    )
  }
];

const Legal: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("company-info");

  // Advanced Scroll Spy using IntersectionObserver
  useEffect(() => {
    // We use a specific rootMargin to create a "reading zone" at the top of the viewport
    const options = {
      root: null,
      rootMargin: "-15% 0px -70% 0px", // Triggers when section enters top 15-30% of screen
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, options);

    legalSections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-brand-dark">
      
      {/* Hero Header */}
      <Section theme="cream" className="border-b border-brand-dark/5 bg-white pb-20 pt-32">
        <Container>
          <FadeIn className="text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-dark/5 text-brand-dark">
              <ScrollText className="h-6 w-6" />
            </div>
            <Eyebrow theme="cream">Legal & Compliance</Eyebrow>
            <DisplayH1 theme="cream" className="mt-4">
              Transparent, human-first policies.
            </DisplayH1>
            <Lead theme="cream" className="mx-auto max-w-large mt-6 text-center text-brand-dark/80">
              These terms outline the rules, regulations, and guidelines for using Strathwell's 
              AI-powered event orchestration platform.
            </Lead>
            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-brand-dark/40">
              Last Updated: January 15, 2026
            </p>
          </FadeIn>
        </Container>
      </Section>

      <Section theme="light" className="py-20">
        <Container>
          {/* Important: Removed 'items-start' to allow sidebar container to stretch for sticky */}
          <div className="grid gap-16 lg:grid-cols-[280px_1fr]">
            
            {/* Sidebar Column */}
            <div className="order-2 lg:order-1">
              
              {/* Sticky Wrapper - Requires parent container to be tall */}
              <div className="hidden lg:block sticky top-28">
                <nav 
                  className="max-h-[calc(100vh-140px)] overflow-y-auto rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-brand-dark/5 backdrop-blur-md"
                >
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-dark/40">
                    Table of Contents
                  </p>
                  <ul className="space-y-1 relative border-l border-brand-dark/5 ml-2 pl-2">
                    {/* Active Indicator Line (Optional Visual Polish) */}
                    {legalSections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                            setActiveSection(section.id);
                          }}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm transition-all duration-300 ease-out border-l-2 -ml-[11px]",
                            activeSection === section.id
                              ? "border-brand-teal bg-brand-teal/5 font-semibold text-brand-teal translate-x-1"
                              : "border-transparent text-brand-dark/60 hover:text-brand-dark hover:bg-brand-dark/5"
                          )}
                        >
                          {/* Clean Title Logic */}
                          {section.title.split('. ')[1] || section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              {/* Mobile Dropdown (Sticky on Mobile too optionally, but usually better static) */}
              <div className="lg:hidden sticky top-24 z-10">
                <details className="group rounded-2xl border border-white/50 bg-white/95 p-4 shadow-lg backdrop-blur-md">
                  <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-brand-dark marker:content-none">
                    <span>
                      Jump to Section... <span className="text-brand-teal ml-2">({legalSections.find(s => s.id === activeSection)?.title.split('.')[0] || "1"})</span>
                    </span>
                    <span className="transition-transform group-open:rotate-180">▼</span>
                  </summary>
                  <ul className="mt-4 space-y-3 border-t border-brand-dark/5 pt-4 text-sm text-brand-dark/70 max-h-60 overflow-y-auto">
                    {legalSections.map((section) => (
                      <li key={section.id}>
                        <a 
                          href={`#${section.id}`} 
                          className={cn(
                             "block py-1 hover:text-brand-teal",
                             activeSection === section.id && "text-brand-teal font-semibold"
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                            // Close details on click
                            (e.target as HTMLElement).closest('details')?.removeAttribute('open');
                          }}
                        >
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            </div>

            {/* Content Column */}
            <div className="order-1 space-y-8 lg:order-2">
              {legalSections.map((section, index) => (
                <FadeIn key={section.id} delay={index * 0.05}>
                  <section
                    id={section.id}
                    // scroll-mt-32 ensures the sticky header doesn't cover the title
                    className={cn(
                       "scroll-mt-32 rounded-[32px] border bg-white p-8 shadow-sm transition-all duration-500 md:p-10",
                       activeSection === section.id 
                         ? "border-brand-teal/30 shadow-md ring-1 ring-brand-teal/10" 
                         : "border-white/60 shadow-sm"
                    )}
                  >
                    <h2 className="mb-6 font-display text-2xl font-bold text-brand-dark">
                      {section.title}
                    </h2>
                    <div className="text-base leading-relaxed text-brand-dark/80">
                      {section.content}
                    </div>
                  </section>
                </FadeIn>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Footer Note */}
      <div className="border-t border-brand-dark/5 bg-white py-12 text-center">
        <Container>
          <p className="text-sm text-brand-dark/50">
            © {new Date().getFullYear()} Strathwell, Inc. All rights reserved.
          </p>
        </Container>
      </div>
    </div>
  );
};

export default Legal;