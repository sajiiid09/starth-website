import React from "react";
import { BadgeCheck, ClipboardList, MessageSquare, Sparkles } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";

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
  "Include your estimated budget range",
  "Mention your location or preferred city",
  "Share guest count and event format"
];

const PlannerTutorial: React.FC = () => {
  return (
    <section className="mt-16">
      <FadeIn className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-brand-dark">
          How to use the AI Planner
        </h2>
        <p className="mt-3 text-base text-brand-dark/70">
          Follow these steps to turn an idea into a ready-to-execute event plan.
        </p>
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
        <div className="rounded-3xl border border-white/40 bg-brand-cream/60 p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
            Beginner tips
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {tips.map((tip) => (
              <span
                key={tip}
                className="rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold text-brand-dark/70"
              >
                {tip}
              </span>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
};

export default PlannerTutorial;
