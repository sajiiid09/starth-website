import React from "react";
import FadeIn from "@/components/animations/FadeIn";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import PillButton from "@/components/home-v2/primitives/PillButton";
import PromptBox from "@/components/home-v2/PromptBox";
import type { SectionTheme } from "@/components/home-v2/types";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

// Custom hook for platform stack animations (kept for future extensibility)
const usePlatformStack = ({ sectionRef, stackRef, cardARef, cardBRef }: {
  sectionRef: React.RefObject<HTMLDivElement>;
  stackRef: React.RefObject<HTMLDivElement>;
  cardARef: React.RefObject<HTMLDivElement>;
  cardBRef: React.RefObject<HTMLDivElement>;
}) => {
  // Animation logic would go here if needed
};

interface PlatformStackProps {
  theme?: SectionTheme;
}

const PlatformStack: React.FC<PlatformStackProps> = ({ theme = 'light' }) => {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const stackRef = React.useRef<HTMLDivElement>(null);
  const cardARef = React.useRef<HTMLDivElement>(null);
  const cardBRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
          
          {/* Layout Fixed: Changed from flex-col stack to a responsive grid */}
          <div
            ref={stackRef}
            className="grid grid-cols-1 gap-8 lg:grid-cols-2"
          >
            {/* Card A: Templates */}
            <div
              ref={cardARef}
              className="relative z-20 overflow-hidden rounded-2xl border border-brand-dark/10 bg-white shadow-soft transition duration-300 ease-smooth hover:-translate-y-1 hover:shadow-card"
            >
              <div className="group relative h-[240px] w-full overflow-hidden border-b border-brand-dark/5 bg-brand-blue/10">
                <img 
                  src="https://images.unsplash.com/photo-1611224885990-ab7363d1f2a9?auto=format&fit=crop&q=80&w=1000" 
                  alt="Event Planning Templates" 
                  className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-brand-dark/5 mix-blend-multiply" />
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
                <PillButton
                  variant="secondary"
                  size="sm"
                  className="self-start"
                  type="button"
                  onClick={() => navigate(createPageUrl("Templates"))}
                >
                  Explore Templates
                </PillButton>
              </div>
            </div>

            {/* Card B: Marketplace */}
            <div
              ref={cardBRef}
              className="relative z-10 overflow-hidden rounded-2xl border border-brand-dark/10 bg-white shadow-soft transition duration-300 ease-smooth hover:-translate-y-1 hover:shadow-card"
            >
              <div className="group relative h-[240px] w-full overflow-hidden border-b border-brand-dark/5 bg-brand-blue/10">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000" 
                  alt="Blueprint OS Dashboard" 
                  className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-brand-dark/5 mix-blend-multiply" />
              </div>
              <div className="flex flex-col gap-4 p-6 md:p-8">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/60">
                  Marketplace
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
                <PillButton
                  variant="secondary"
                  size="sm"
                  className="self-start"
                  type="button"
                  onClick={() => navigate(createPageUrl("Marketplace"))}
                >
                  Explore Marketplace
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
