import React from "react";
import { dummyTemplates } from "@/data/dummyTemplates";
import FadeIn from "@/components/animations/FadeIn";
import Container from "@/components/home-v2/primitives/Container";
import Section from "@/components/home-v2/primitives/Section";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH2 from "@/components/home-v2/primitives/DisplayH2";
import Lead from "@/components/home-v2/primitives/Lead";
import TemplateCard from "@/components/templates/TemplateCard";

const TemplateShowcase: React.FC = () => {
  const templates = dummyTemplates.slice(0, 6);

  return (
    <Section theme="light">
      <Container>
        <FadeIn className="text-center">
          <Eyebrow theme="light">Recommended blueprints</Eyebrow>
          <DisplayH2 theme="light">Recommended Blueprints</DisplayH2>
          <Lead theme="light">
            Jumpstart with vetted templates designed for speed, clarity, and standout guest
            experiences.
          </Lead>
        </FadeIn>

        <FadeIn
          className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          staggerChildren={0.08}
          childSelector=".template-card"
        >
          {templates.map((template) => (
            <div key={template.id} className="template-card">
              <TemplateCard template={template} />
            </div>
          ))}
        </FadeIn>
      </Container>
    </Section>
  );
};

export default TemplateShowcase;
