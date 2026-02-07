import React from "react";
import { Link } from "react-router-dom";
import { Clock, Trophy, CheckCircle } from "@phosphor-icons/react";
import { createPageUrl } from "@/utils";
import Container from "@/components/home-v2/primitives/Container";
import Section from "@/components/home-v2/primitives/Section";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH1 from "@/components/home-v2/primitives/DisplayH1";
import Lead from "@/components/home-v2/primitives/Lead";
import PillButton from "@/components/home-v2/primitives/PillButton";
import FadeIn from "@/components/animations/FadeIn";
import DemoRequestModal from "@/components/marketing/DemoRequestModal";
import { cn } from "@/lib/utils";

const highlights = [
  {
    title: "24-hour response",
    description: "Receive a curated proposal within one business day.",
    icon: Clock
  },
  {
    title: "Expert curation",
    description: "Hand-picked venues and vendors aligned to your vision.",
    icon: Trophy
  },
  {
    title: "Full execution",
    description: "Dedicated coordination from planning to day-of delivery.",
    icon: CheckCircle
  }
];

export default function DFYHero() {
  const [showDemoModal, setShowDemoModal] = React.useState(false);

  return (
    <Section theme="cream" className="relative overflow-hidden">
      <Container>
        <div className="flex flex-col gap-12 text-center">
          <FadeIn>
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              <Eyebrow theme="cream">Done-for-you orchestration</Eyebrow>
              <DisplayH1 theme="cream">
                Done-for-you event orchestration
                <span className="block bg-gradient-to-r from-brand-teal to-brand-dark bg-clip-text text-transparent">
                  with concierge-level execution.
                </span>
              </DisplayH1>
              <Lead theme="cream">
                Short on time? Our concierge team plans and executes your entire event—from
                concept to completion—so you can stay focused on your guests.
              </Lead>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <PillButton onClick={() => setShowDemoModal(true)}>
                  Book a demo
                </PillButton>
                <Link to={createPageUrl("Templates")}>
                  <PillButton
                    variant="secondary"
                    className="border-brand-dark/20 text-brand-dark hover:border-brand-dark"
                  >
                    Explore templates
                  </PillButton>
                </Link>
              </div>
            </div>
          </FadeIn>

          <FadeIn
            className="grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3"
            staggerChildren={0.1}
            childSelector=".dfy-highlight"
          >
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={cn(
                    "dfy-highlight rounded-3xl border border-white/50 bg-white/80 p-6 shadow-card"
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-teal/10">
                    <Icon className="h-6 w-6 text-brand-teal" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-brand-dark">{item.title}</h3>
                  <p className="mt-2 text-sm text-brand-dark/70">{item.description}</p>
                </div>
              );
            })}
          </FadeIn>
        </div>
      </Container>
      <DemoRequestModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
    </Section>
  );
}
