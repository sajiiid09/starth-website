import React from "react";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH2 from "@/components/home-v2/primitives/DisplayH2";
import Lead from "@/components/home-v2/primitives/Lead";
import { defaultSectionGaps } from "@/components/home-v2/constants";

const PlatformStack: React.FC = () => {
  const theme = "light" as const;

  return (
    <Section theme={theme} id="home-platform" dataSection="platform">
      <Container>
        <div
          className="flex flex-col"
          style={{ gap: defaultSectionGaps.blockGap }}
        >
          <div
            className="flex flex-col"
            style={{ gap: defaultSectionGaps.eyebrowToHeadline }}
          >
            <Eyebrow theme={theme}>Modular stack</Eyebrow>
            <DisplayH2 theme={theme}>
              Highlight the platform layers with a clean, spacious layout.
            </DisplayH2>
          </div>
          <Lead theme={theme}>
            The visual system now supports the grid, padding, and typography
            needed for the next phase of layout work.
          </Lead>
        </div>
      </Container>
    </Section>
  );
};

export default PlatformStack;
