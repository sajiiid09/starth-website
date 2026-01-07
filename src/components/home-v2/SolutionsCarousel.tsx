import React from "react";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH2 from "@/components/home-v2/primitives/DisplayH2";
import Lead from "@/components/home-v2/primitives/Lead";
import { defaultSectionGaps } from "@/components/home-v2/constants";

const SolutionsCarousel: React.FC = () => {
  const theme = "blue" as const;

  return (
    <Section theme={theme} id="home-solutions" dataSection="solutions">
      <Container>
        <div
          className="flex flex-col"
          style={{ gap: defaultSectionGaps.blockGap }}
        >
          <div
            className="flex flex-col"
            style={{ gap: defaultSectionGaps.eyebrowToHeadline }}
          >
            <Eyebrow theme={theme}>Solutions</Eyebrow>
            <DisplayH2 theme={theme}>
              A soft blue stage for horizontal storytelling and previews.
            </DisplayH2>
          </div>
          <Lead theme={theme}>
            Carousel layouts will follow, but the spacing and typography now align
            with the global design tokens.
          </Lead>
        </div>
      </Container>
    </Section>
  );
};

export default SolutionsCarousel;
