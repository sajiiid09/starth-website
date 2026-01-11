import React from "react";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import TagPill from "@/components/home-v2/primitives/TagPill";
import FadeIn from "@/components/animations/FadeIn";
import NewsTicker from "@/components/home-v2/components/NewsTicker";

const SocialProof: React.FC = () => {
  const theme = "light" as const;
  const partners = [
    { name: "Ashbury", src: "/partners/ashbury.svg" },
    { name: "Crescent", src: "/partners/crescent.svg" },
    { name: "Lakeview", src: "/partners/lakeview.svg" },
    { name: "Northbridge", src: "/partners/northbridge.svg" }
  ];
  const builtFor = [
    "Event planners",
    "Corporate teams",
    "Venues",
    "Individuals",
    "Community orgs",
    "Agencies"
  ];

  return (
    <Section theme={theme} id="home-social" dataSection="social">
      <Container>
        <div className="flex flex-col items-center gap-12 text-center">
          <FadeIn duration={0.9} ease="power2.out" direction="up" distance={30}>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {partners.map((partner) => (
                <img
                  key={partner.name}
                  src={partner.src}
                  alt={partner.name}
                  className="h-7 opacity-70"
                  loading="lazy"
                />
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.2} duration={1} ease="power3.out" direction="up" distance={50}>
            <div className="flex max-w-[900px] flex-col gap-6">
              <p className="text-3xl font-medium leading-[1.3] text-brand-dark md:text-5xl">
                "Strathwell turns our event planning into a calm, repeatable
                system—every team knows the blueprint before a single guest
                arrives."
              </p>
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-brand-dark/60">
                Avery Collins • Director of Operations, Northbridge Collective
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.3} duration={0.8} ease="power2.out" direction="up" distance={30}>
            <div className="flex flex-col items-center gap-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/60">
                Built for
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {builtFor.map((tag) => (
                  <TagPill key={tag} variant="coral" size="md">
                    {tag}
                  </TagPill>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
      <NewsTicker />
    </Section>
  );
};

export default SocialProof;
