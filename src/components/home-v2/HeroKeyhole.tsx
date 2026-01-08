import React from "react";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH1 from "@/components/home-v2/primitives/DisplayH1";
import Lead from "@/components/home-v2/primitives/Lead";
import PillButton from "@/components/home-v2/primitives/PillButton";
import { heroContent } from "@/components/home-v2/config/hero";
import { useHeroKeyhole } from "@/components/home-v2/hooks/useHeroKeyhole";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const HeroKeyhole: React.FC = () => {
  const theme = "light" as const;
  const sectionRef = React.useRef<HTMLElement>(null);
  const mediaWrapRef = React.useRef<HTMLDivElement>(null);
  const textWrapRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useHeroKeyhole({ sectionRef, mediaWrapRef, textWrapRef });

  const trustedBy = [...heroContent.trustedBy, ...heroContent.trustedBy];

  return (
    <Section theme={theme} id="home-hero" dataSection="hero">
      <div ref={sectionRef}>
        <Container>
          <div ref={textWrapRef} className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Eyebrow theme={theme} className="mb-4">
              {heroContent.eyebrow}
            </Eyebrow>
            <DisplayH1 theme={theme} className="mb-6">
              {heroContent.headline}
            </DisplayH1>
            <Lead theme={theme} className="mb-8">
              {heroContent.subheadline}
            </Lead>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <PillButton onClick={() => navigate(createPageUrl("AIPlanner"))}>
                {heroContent.ctas.primary}
              </PillButton>
              <PillButton
                variant="secondary"
                onClick={() => navigate(createPageUrl("Templates"))}
              >
                {heroContent.ctas.secondary}
              </PillButton>
            </div>
          </div>
        </Container>

        <div className="mt-16 flex justify-center">
          <div
            ref={mediaWrapRef}
            className="relative flex w-[clamp(320px,40vw,520px)] items-center justify-center overflow-hidden rounded-full bg-brand-dark/10 shadow-card"
          >
            <video
              className="h-full w-full object-cover"
              src="/videos/hero.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-brand-dark/10" />
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-5xl px-4">
          <div className="flex flex-col items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-caps text-brand-dark/60">
              Trusted by
            </span>
            <div className="relative w-full overflow-hidden">
              <div className="ticker-track flex items-center gap-10">
                {trustedBy.map((logo, index) => (
                  <img
                    key={`${logo.name}-${index}`}
                    src={logo.src}
                    alt={logo.name}
                    className="h-8 w-auto opacity-80"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default HeroKeyhole;
