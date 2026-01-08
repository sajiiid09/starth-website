import React from "react";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import PillButton from "@/components/home-v2/primitives/PillButton";
import FadeIn from "@/components/animations/FadeIn";
import { usePlatformStack } from "@/components/home-v2/hooks/usePlatformStack";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import PromptBox from "@/components/home-v2/PromptBox";

const PlatformStack: React.FC = () => {
  const theme = "cream" as const;
  const sectionRef = React.useRef<HTMLElement>(null);
  const stackRef = React.useRef<HTMLDivElement>(null);
  const cardARef = React.useRef<HTMLDivElement>(null);
  const cardBRef = React.useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  usePlatformStack({
    sectionRef,
    stackRef,
    cardARef,
    cardBRef
  });

  return (
    <Section theme={theme} id="home-platform" dataSection="platform">
      <Container>
        <div ref={sectionRef} className="flex flex-col gap-12 lg:gap-16">
          <FadeIn>
            <div className="flex flex-col gap-6">
              <Eyebrow theme={theme}>The Strathwell platform</Eyebrow>
              <h2 className="text-[clamp(3rem,10vw,9rem)] font-semibold uppercase leading-[0.9] tracking-tight text-brand-dark">
                The Strathwell Platform
              </h2>
            </div>
          </FadeIn>
          <PromptBox />
          <div
            ref={stackRef}
            className="relative flex flex-col gap-8 lg:min-h-[520px]"
          >
            <div
              ref={cardARef}
              className="relative z-20 rounded-2xl border border-brand-dark/10 bg-white shadow-soft transition duration-250 ease-smooth hover:-translate-y-1 hover:shadow-card"
            >
              <div className="overflow-hidden rounded-2xl border border-brand-dark/5 bg-brand-blue/40">
                <div className="h-[220px] w-full bg-[radial-gradient(circle_at_30%_20%,rgba(2,127,131,0.15),transparent_60%),linear-gradient(120deg,rgba(34,31,31,0.05),rgba(34,31,31,0))]" />
              </div>
              <div className="flex flex-col gap-4 p-6 md:p-8">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/60">
                  Templates
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-brand-dark">
                    Blueprint presets for real events
                  </h3>
                  <p className="mt-2 text-base text-brand-dark/70">
                    Ready-to-run operating plans that keep teams aligned and
                    launches predictable.
                  </p>
                </div>
                <div className="text-sm font-medium text-brand-dark/70">
                  ✓ Ready-to-run operating plan
                </div>
                <PillButton variant="secondary" size="sm" className="self-start">
                  Explore Templates
                </PillButton>
              </div>
            </div>
            <div
              ref={cardBRef}
              className={`relative z-10 rounded-2xl border border-brand-dark/10 bg-white shadow-soft transition duration-250 ease-smooth hover:-translate-y-1 hover:shadow-card ${
                prefersReducedMotion ? "" : "lg:-mt-24"
              }`}
            >
              <div className="overflow-hidden rounded-2xl border border-brand-dark/5 bg-brand-blue/30">
                <div className="h-[220px] w-full bg-[radial-gradient(circle_at_70%_10%,rgba(2,127,131,0.18),transparent_55%),linear-gradient(130deg,rgba(34,31,31,0.06),rgba(34,31,31,0))]" />
              </div>
              <div className="flex flex-col gap-4 p-6 md:p-8">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/60">
                  Blueprint OS
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-brand-dark">
                    Space + stack + budget + timeline + risk
                  </h3>
                  <p className="mt-2 text-base text-brand-dark/70">
                    Keep dependencies, staffing, and compliance in one
                    orchestration layer.
                  </p>
                </div>
                <div className="text-sm font-medium text-brand-dark/70">
                  ✓ Includes dependencies &amp; compliance
                </div>
                <PillButton variant="secondary" size="sm" className="self-start">
                  Explore the OS
                </PillButton>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default PlatformStack;
