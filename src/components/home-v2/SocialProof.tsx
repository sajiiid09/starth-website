import React from "react";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH2 from "@/components/home-v2/primitives/DisplayH2";
import Lead from "@/components/home-v2/primitives/Lead";
import { defaultSectionGaps } from "@/components/home-v2/constants";

const SocialProof: React.FC = () => {
  const theme = "light" as const;

  return (
    <Section theme={theme} id="home-proof" dataSection="social">
      <Container>
        <div
          className="flex flex-col"
          style={{ gap: defaultSectionGaps.blockGap }}
        >
          <div
            className="flex flex-col"
            style={{ gap: defaultSectionGaps.eyebrowToHeadline }}
          >
            <Eyebrow theme={theme}>Social proof</Eyebrow>
            <DisplayH2 theme={theme}>
              A clean canvas for logos, testimonials, and outcomes.
            </DisplayH2>
          </div>
          <Lead theme={theme}>
            This placeholder ensures the typography and spacing match the
            established baseline before content is added.
          </Lead>
        </div>
      </Container>
    </Section>
  );
};

export default SocialProof;
