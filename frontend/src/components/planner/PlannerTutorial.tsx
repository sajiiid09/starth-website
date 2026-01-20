import React from "react";
import { BadgeCheck, ClipboardList, MessageSquare, Sparkles, Lightbulb } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import Container from "@/components/home-v2/primitives/Container";
import Section from "@/components/home-v2/primitives/Section";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH2 from "@/components/home-v2/primitives/DisplayH2";
import Lead from "@/components/home-v2/primitives/Lead";

const steps = [
  {
    title: "Describe your event goal + constraints",
    description: "Share the vibe, budget range, and must-haves to shape the brief.",
    icon: Sparkles
  },
  {
    title: "Answer the follow-up questions",
    description: "The planner asks for details like timing, guest count, and format.",
    icon: MessageSquare
  },
  {
    title: "Review the blueprint",
    description: "Get recommendations for venues, vendors, and a working timeline.",
    icon: ClipboardList
  },
  {
    title: "Customize and approve",
    description: "Adjust selections, save the plan, and move into execution.",
    icon: BadgeCheck
  }
];

const tips = [
  {
    title: "Anchor the budget",
    description: "Share a budget range early to unlock the best-fit venues and vendors."
  },
  {
    title: "Lead with location",
    description: "Include a city or region so we can prioritize availability and logistics."
  },
  {
    title: "Define the format",
    description: "Guest count, timing, and format help us craft the right run-of-show."
  }
];

const PlannerTutorial: React.FC = () => {
  return (
    <Section theme="cream">
      <Container>
        <FadeIn className="text-center">
          <Eyebrow theme="cream">How to get the best plan</Eyebrow>
          <DisplayH2 theme="cream">How to get the best plan</DisplayH2>
          <Lead theme="cream">
            Follow these steps to turn an idea into a premium, ready-to-execute blueprint.
          </Lead>
        </FadeIn>

        <FadeIn className="mt-10" staggerChildren={0.08} childSelector=".step-card">
          <div className="grid gap-6 md:grid-cols-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="step-card rounded-3xl border border-white/40 bg-white/80 p-6 shadow-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-teal/10">
                      <Icon className="h-5 w-5 text-brand-teal" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-brand-dark">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-brand-dark/70">{step.description}</p>
                </div>
              );
            })}
          </div>
        </FadeIn>

        <FadeIn className="mt-10">
          <div className="grid gap-4 rounded-3xl border border-white/40 bg-white/80 p-6 shadow-card md:grid-cols-[auto_1fr]">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-brand-teal">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-teal/10">
                <Lightbulb className="h-5 w-5 text-brand-teal" />
              </span>
              Pro tips
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {tips.map((tip) => (
                <div
                  key={tip.title}
                  className="rounded-2xl border border-brand-dark/10 bg-brand-cream/40 p-4"
                >
                  <p className="text-sm font-semibold text-brand-dark">{tip.title}</p>
                  <p className="mt-2 text-xs text-brand-dark/70">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
};

export default PlannerTutorial;
