import React from "react";
import { Link } from "react-router-dom";
import { Calendar, FileSearch, MessageSquare, Users, Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import Container from "@/components/home-v2/primitives/Container";
import Section from "@/components/home-v2/primitives/Section";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH2 from "@/components/home-v2/primitives/DisplayH2";
import Lead from "@/components/home-v2/primitives/Lead";
import PillButton from "@/components/home-v2/primitives/PillButton";
import FadeIn from "@/components/animations/FadeIn";
import DemoRequestModal from "@/components/marketing/DemoRequestModal";

const featureHighlights = [
  {
    title: "Concierge intake",
    description: "Share goals, timelines, and budgets once. We translate them into an actionable plan."
  },
  {
    title: "Venue + vendor match",
    description: "Our network delivers vetted options and availability faster than manual outreach."
  },
  {
    title: "Budget orchestration",
    description: "Get a clear scope with tradeoffs, line items, and negotiated pricing insight."
  },
  {
    title: "Day-of oversight",
    description: "We manage run-of-show logistics, vendor coordination, and on-site execution."
  },
  {
    title: "Stakeholder comms",
    description: "Professional updates and approvals keep your team aligned at every milestone."
  },
  {
    title: "Post-event wrap",
    description: "Capture learnings, invoices, and notes for the next event blueprint."
  }
];

const steps = [
  {
    icon: MessageSquare,
    title: "Share your vision",
    description: "Complete the intake so we can understand goals, tone, and success criteria."
  },
  {
    icon: FileSearch,
    title: "Receive a proposal",
    description: "Within 24 hours, get a curated plan with venue, vendor, and timeline options."
  },
  {
    icon: Users,
    title: "We orchestrate",
    description: "Your concierge handles sourcing, contracting, and stakeholder communications."
  },
  {
    icon: Calendar,
    title: "We execute",
    description: "We manage run-of-show details so your event is seamless on the day."
  }
];

const metrics = [
  { label: "Proposal turnaround", value: "24 hrs" },
  { label: "Planner hours saved", value: "60+" },
  { label: "Client satisfaction", value: "98%" }
];

export default function DFYProcess() {
  const [showDemoModal, setShowDemoModal] = React.useState(false);

  return (
    <>
      <Section theme="light">
        <Container>
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-10">
              <FadeIn>
                <div className="text-center">
                  <Eyebrow theme="light">What you get</Eyebrow>
                  <DisplayH2 theme="light">
                    A concierge team that orchestrates every detail.
                  </DisplayH2>
                  <Lead theme="light">
                    We blend strategic planning with operational execution so your team stays focused on
                    the experience.
                  </Lead>
                </div>
              </FadeIn>
              <FadeIn
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                staggerChildren={0.08}
                childSelector=".dfy-feature"
              >
                {featureHighlights.map((item) => (
                  <Card
                    key={item.title}
                    className="dfy-feature border border-white/40 bg-white/80 shadow-card"
                  >
                    <CardContent className="space-y-3 p-6">
                      <h3 className="text-lg font-semibold text-brand-dark">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-brand-dark/70">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </FadeIn>
            </div>

            <div className="flex flex-col gap-10">
              <FadeIn>
                <div className="text-center">
                  <Eyebrow theme="light">How it works</Eyebrow>
                  <DisplayH2 theme="light">
                    Structured steps, transparent milestones.
                  </DisplayH2>
                  <Lead theme="light">
                    From intake to execution, every stage is tracked and communicated with your team.
                  </Lead>
                </div>
              </FadeIn>
              <FadeIn
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
                staggerChildren={0.08}
                childSelector=".dfy-step"
              >
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <Card
                      key={step.title}
                      className="dfy-step border border-white/40 bg-white/80 shadow-card"
                    >
                      <CardContent className="flex h-full flex-col gap-4 p-6">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark/40">
                            Step {index + 1}
                          </span>
                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-teal/10">
                            <Icon className="h-5 w-5 text-brand-teal" />
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-brand-dark">{step.title}</h3>
                        <p className="text-sm leading-relaxed text-brand-dark/70">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </FadeIn>
            </div>
          </div>
        </Container>
      </Section>

      <Section theme="blue">
        <Container>
          <FadeIn>
            <div className="rounded-3xl border border-white/50 bg-white/80 p-10 shadow-card">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark/50">
                    <Sparkles className="h-4 w-4 text-brand-teal" />
                    Proof & outcomes
                  </div>
                  <h3 className="text-2xl font-semibold text-brand-dark">
                    The concierge workflow delivers measurable results.
                  </h3>
                  <p className="text-sm text-brand-dark/70">
                    From faster approvals to smarter spend allocation, teams use DFY to orchestrate
                    high-impact events without the operational burden.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-2xl border border-brand-dark/10 bg-brand-light/80 p-4 text-center"
                    >
                      <div className="text-2xl font-semibold text-brand-dark">{metric.value}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.3em] text-brand-dark/50">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <PillButton onClick={() => setShowDemoModal(true)}>
                  Book a demo
                </PillButton>
                <Link to={createPageUrl("Contact")}>
                  <PillButton variant="secondary">Talk to the concierge team</PillButton>
                </Link>
              </div>
            </div>
          </FadeIn>
        </Container>
      </Section>
      <DemoRequestModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
    </>
  );
}
