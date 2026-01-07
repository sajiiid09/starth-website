import React from "react";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH2 from "@/components/home-v2/primitives/DisplayH2";
import Lead from "@/components/home-v2/primitives/Lead";
import TagPill from "@/components/home-v2/primitives/TagPill";
import { defaultSectionGaps } from "@/components/home-v2/constants";

const ChaosDrop: React.FC = () => {
  const theme = "cream" as const;

  return (
    <Section theme={theme}>
      <Container>
        <div
          className="flex flex-col"
          style={{ gap: defaultSectionGaps.blockGap }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <TagPill>Built for modern teams</TagPill>
          </div>
          <div
            className="flex flex-col"
            style={{ gap: defaultSectionGaps.eyebrowToHeadline }}
          >
            <Eyebrow theme={theme}>Orchestration clarity</Eyebrow>
            <DisplayH2 theme={theme}>
              A calmer, cream-toned space for structured storytelling.
            </DisplayH2>
          </div>
          <Lead theme={theme}>
            This block will become a layered layout, but for now the rhythm and
            spacing are set with the global tokens.
          </Lead>
        </div>
      </Container>
    </Section>
  );
};

export default ChaosDrop;
