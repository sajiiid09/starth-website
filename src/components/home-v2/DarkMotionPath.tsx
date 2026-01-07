import React from "react";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH2 from "@/components/home-v2/primitives/DisplayH2";
import Lead from "@/components/home-v2/primitives/Lead";
import { defaultSectionGaps } from "@/components/home-v2/constants";

const DarkMotionPath: React.FC = () => {
  const theme = "dark" as const;

  return (
    <Section theme={theme}>
      <Container>
        <div
          className="flex flex-col"
          style={{ gap: defaultSectionGaps.blockGap }}
        >
          <div
            className="flex flex-col"
            style={{ gap: defaultSectionGaps.eyebrowToHeadline }}
          >
            <Eyebrow theme={theme}>Momentum in motion</Eyebrow>
            <DisplayH2 theme={theme}>
              Showcase the kinetic flow that anchors the dark theme sections.
            </DisplayH2>
          </div>
          <Lead theme={theme}>
            Copy will evolve here, but spacing, typography, and contrast now match
            the design system requirements.
          </Lead>
        </div>
      </Container>
    </Section>
  );
};

export default DarkMotionPath;
