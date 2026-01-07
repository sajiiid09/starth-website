import React from "react";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH2 from "@/components/home-v2/primitives/DisplayH2";
import Lead from "@/components/home-v2/primitives/Lead";
import { defaultSectionGaps } from "@/components/home-v2/constants";
import FadeIn from "@/components/animations/FadeIn";
import MotionCard from "@/components/home-v2/components/MotionCard";
import { motionPathD, motionPathViewBox } from "@/components/home-v2/assets/motionPath";
import { useDarkMotionPath } from "@/components/home-v2/hooks/useDarkMotionPath";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const DarkMotionPath: React.FC = () => {
  const theme = "dark" as const;
  const sectionRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const pathRef = React.useRef<SVGPathElement>(null);
  const cardRefs = React.useRef<HTMLDivElement[]>([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useDarkMotionPath({
    sectionRef,
    stageRef,
    pathRef,
    cardRefs
  });

  const setCardRef = (index: number) => (node: HTMLDivElement | null) => {
    if (!node) {
      return;
    }
    cardRefs.current[index] = node;
  };

  return (
    <Section theme={theme} id="home-dark" dataSection="dark">
      <Container>
        <div
          className="flex flex-col"
          style={{ gap: defaultSectionGaps.blockGap }}
        >
          <FadeIn>
            <div
              className="flex flex-col"
              style={{ gap: defaultSectionGaps.eyebrowToHeadline }}
            >
              <Eyebrow theme={theme}>Guided flow</Eyebrow>
              <DisplayH2 theme={theme}>
                From parking lots to commerce hubs.
              </DisplayH2>
            </div>
          </FadeIn>
          <FadeIn>
            <Lead theme={theme}>
              Strathwell guides every arrival, keeps every space productive, and
              connects on-site activity to repeatable revenue.
            </Lead>
          </FadeIn>
        </div>
        <div
          ref={sectionRef}
          className="mt-16"
        >
          <div
            ref={stageRef}
            className="relative min-h-[70vh] w-full overflow-visible lg:min-h-[90vh]"
          >
            <svg
              viewBox={motionPathViewBox}
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
              focusable="false"
            >
              <path
                ref={pathRef}
                id="motionPath"
                d={motionPathD}
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="2"
              />
            </svg>
            {prefersReducedMotion ? (
              <FadeIn staggerChildren={0.12}>
                <div className="relative z-10 flex flex-col gap-6">
                  <MotionCard
                    title="Real-time occupancy"
                    body="Pinpoint availability, dwell time, and peak demand moments with precision."
                  />
                  <MotionCard
                    title="Demand-aware pricing"
                    body="Match pricing to intent signals, shifting rates the moment patterns evolve."
                  />
                  <MotionCard
                    title="Insights on autopilot"
                    body="Automated insights keep teams aligned and every location performing."
                  />
                </div>
              </FadeIn>
            ) : (
              <>
                <MotionCard
                  ref={setCardRef(0)}
                  className="absolute left-1/2 top-0 w-[min(320px,80vw)] lg:w-[360px]"
                  title="Real-time occupancy"
                  body="Pinpoint availability, dwell time, and peak demand moments with precision."
                />
                <MotionCard
                  ref={setCardRef(1)}
                  className="absolute left-1/2 top-0 w-[min(320px,80vw)] lg:w-[360px]"
                  title="Demand-aware pricing"
                  body="Match pricing to intent signals, shifting rates the moment patterns evolve."
                />
                <MotionCard
                  ref={setCardRef(2)}
                  className="absolute left-1/2 top-0 w-[min(320px,80vw)] lg:w-[360px]"
                  title="Insights on autopilot"
                  body="Automated insights keep teams aligned and every location performing."
                />
              </>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default DarkMotionPath;
