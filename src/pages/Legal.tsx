import React from "react";
import Container from "@/components/home-v2/primitives/Container";
import Section from "@/components/home-v2/primitives/Section";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH1 from "@/components/home-v2/primitives/DisplayH1";
import Lead from "@/components/home-v2/primitives/Lead";
import FadeIn from "@/components/animations/FadeIn";

const legalSections = [
  {
    id: "terms",
    title: "Terms of Service",
    intro:
      "These high-level terms outline how Strathwell provides event orchestration services and what customers can expect.",
    bullets: [
      "Engagements begin once scope, timing, and pricing are confirmed in writing.",
      "Clients retain ownership of event IP; Strathwell receives a limited license to execute.",
      "Changes to scope may impact timelines and require written approval.",
      "Payment milestones are tied to planning phases and vendor commitments."
    ]
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    intro:
      "We collect only the information needed to plan and deliver events, and we keep it protected.",
    bullets: [
      "We store contact, event, and vendor details for planning coordination.",
      "Data is used to match vendors and provide real-time status updates.",
      "We do not sell personal information to third parties.",
      "Clients can request data access or deletion by contacting our team."
    ]
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    intro:
      "Our platform is designed for professional events and community experiences.",
    bullets: [
      "No illegal, harmful, or discriminatory event activity is permitted.",
      "Vendors must comply with safety, licensing, and insurance requirements.",
      "Clients are responsible for venue rules, permits, and attendee safety."
    ]
  },
  {
    id: "vendor-verification",
    title: "Vendor Verification & Compliance",
    intro:
      "Strathwell verifies vendors to ensure consistent, premium service delivery.",
    bullets: [
      "Verification includes business credentials, insurance validation, and portfolio review.",
      "Vendors agree to service-level standards and response-time requirements.",
      "Compliance checks are repeated before high-impact events or renewals."
    ]
  },
  {
    id: "refunds",
    title: "Refunds & Cancellation",
    intro:
      "Refunds vary based on planning stage and vendor commitments.",
    bullets: [
      "Deposits secure planning resources and may be non-refundable after kickoff.",
      "Vendor deposits are governed by their individual agreements.",
      "Cancellation timelines and refund amounts are defined in the service proposal."
    ]
  }
];

const Legal: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-light text-brand-dark">
      <Section theme="cream">
        <Container>
          <FadeIn className="text-center">
            <Eyebrow theme="cream">Legal</Eyebrow>
            <DisplayH1 theme="cream">Transparent, human-first policies.</DisplayH1>
            <Lead theme="cream">
              These summaries are provided for demo purposes and outline how Strathwell protects
              clients, vendors, and event stakeholders.
            </Lead>
          </FadeIn>
        </Container>
      </Section>

      <Section theme="light">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:items-start">
            <div className="order-2 lg:order-1">
              <div className="hidden lg:block">
                <nav className="sticky top-28 rounded-2xl border border-white/50 bg-white/80 p-6 shadow-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
                    On this page
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-brand-dark/70">
                    {legalSections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="transition hover:text-brand-dark"
                        >
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              <details className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-card lg:hidden">
                <summary className="cursor-pointer text-sm font-semibold text-brand-dark">
                  On this page
                </summary>
                <ul className="mt-4 space-y-3 text-sm text-brand-dark/70">
                  {legalSections.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`} className="transition hover:text-brand-dark">
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </div>

            <div className="order-1 space-y-10 lg:order-2">
              {legalSections.map((section) => (
                <FadeIn key={section.id}>
                  <section
                    id={section.id}
                    className="rounded-3xl border border-white/50 bg-white/80 p-8 shadow-card"
                  >
                    <h2 className="text-2xl font-semibold text-brand-dark">{section.title}</h2>
                    <p className="mt-3 text-sm text-brand-dark/70">{section.intro}</p>
                    <ul className="mt-4 space-y-2 text-sm text-brand-dark/70">
                      {section.bullets.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-teal" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </FadeIn>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default Legal;
