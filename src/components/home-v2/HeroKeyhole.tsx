import React from "react";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH1 from "@/components/home-v2/primitives/DisplayH1";
import Lead from "@/components/home-v2/primitives/Lead";
import PillButton from "@/components/home-v2/primitives/PillButton";
import { defaultSectionGaps } from "@/components/home-v2/constants";

const HeroKeyhole: React.FC = () => {
  const theme = "light" as const;

  return (
    <Section theme={theme} id="home-hero" dataSection="hero">
      <Container>
        <div
          className="flex flex-col"
          style={{ gap: defaultSectionGaps.blockGap }}
        >
          <div
            className="flex flex-col"
            style={{ gap: defaultSectionGaps.eyebrowToHeadline }}
          >
            <Eyebrow theme={theme}>Planning, orchestrated</Eyebrow>
            <DisplayH1 theme={theme}>
              A calm, precise foundation for the next-generation event platform.
            </DisplayH1>
          </div>
          <Lead theme={theme}>
            This hero section will introduce the key narrative with confident type,
            controlled spacing, and a clear CTA rhythm.
          </Lead>
          <div className="flex flex-wrap items-center gap-4">
            <PillButton>Request a demo</PillButton>
            <PillButton variant="secondary">Explore the platform</PillButton>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default HeroKeyhole;
