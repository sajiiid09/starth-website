import React from "react";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import { useChaosDrop } from "@/components/home-v2/hooks/useChaosDrop";

const ChaosDrop: React.FC = () => {
  const theme = "blue" as const;
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const pathRef = React.useRef<SVGPathElement>(null);
  const arrowRef = React.useRef<SVGPathElement>(null);
  const line1Ref = React.useRef<HTMLParagraphElement>(null);
  const line2Ref = React.useRef<HTMLParagraphElement>(null);

  useChaosDrop({
    sectionRef,
    pathRef,
    arrowRef,
    line1Ref,
    line2Ref
  });

  return (
    <Section
      theme={theme}
      id="home-chaos"
      dataSection="chaos"
      className="py-16 md:py-20 lg:py-24"
    >
      <Container>
        <div ref={sectionRef} className="flex w-full flex-col items-center">
          <div className="relative w-full max-w-[980px]">
            <svg
              viewBox="0 0 1000 620"
              preserveAspectRatio="xMidYMid meet"
              className="h-[340px] w-full md:h-[420px] lg:h-[520px]"
              aria-hidden="true"
              focusable="false"
            >
              <path
                ref={pathRef}
                d="M480 40 C520 140 520 220 500 300 C470 390 520 460 720 520"
                fill="none"
                stroke="#F7F1E4"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                ref={arrowRef}
                d="M700 500 L720 520 L700 540"
                fill="none"
                stroke="#F7F1E4"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="pointer-events-none absolute left-1/2 top-[58%] w-full max-w-[520px] -translate-x-1/2 text-center md:left-auto md:right-0 md:top-[62%] md:translate-x-0 md:text-left">
              <p
                ref={line1Ref}
                className="font-display text-2xl font-medium leading-[1.2] text-brand-dark/60 md:text-4xl"
              >
                Without a blueprint, it’s chaos.
              </p>
              <p
                ref={line2Ref}
                className="mt-3 font-display text-3xl font-semibold leading-[1.12] text-brand-dark md:text-5xl"
              >
                With <span className="font-semibold">Strathwell</span>, it’s
                orchestration.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default ChaosDrop;
