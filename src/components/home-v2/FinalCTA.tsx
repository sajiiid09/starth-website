import React from "react";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH2 from "@/components/home-v2/primitives/DisplayH2";
import Lead from "@/components/home-v2/primitives/Lead";
import PillButton from "@/components/home-v2/primitives/PillButton";
import { defaultSectionGaps } from "@/components/home-v2/constants";

const FinalCTA: React.FC = () => {
  const theme = "light" as const;

  return (
    <Section theme={theme} id="home-cta" dataSection="final">
      <Container>
        <div
          className="flex flex-col"
          style={{ gap: defaultSectionGaps.blockGap }}
        >
          <div
            className="flex flex-col"
            style={{ gap: defaultSectionGaps.eyebrowToHeadline }}
          >
            <Eyebrow theme={theme}>Next steps</Eyebrow>
            <DisplayH2 theme={theme}>
              Close the narrative with a focused, confident CTA.
            </DisplayH2>
          </div>
          <Lead theme={theme}>
            Buttons, layout, and typography now follow the shared primitives so
            future updates remain consistent.
          </Lead>
          <div className="flex flex-wrap items-center gap-4">
            <PillButton>Get started</PillButton>
            <PillButton variant="ghost">View product tour</PillButton>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default FinalCTA;
