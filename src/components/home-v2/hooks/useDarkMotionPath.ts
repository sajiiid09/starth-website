import React from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

let motionPathRegistered = false;

const ensureMotionPathPlugins = () => {
  if (!motionPathRegistered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
    motionPathRegistered = true;
  }
};

type DarkMotionPathRefs = {
  sectionRef: React.RefObject<HTMLElement>;
  stageRef: React.RefObject<HTMLDivElement>;
  pathRef: React.RefObject<SVGPathElement>;
  cardRefs: React.MutableRefObject<HTMLDivElement[]>;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const lerp = (start: number, end: number, amount: number) =>
  start + (end - start) * amount;

export const useDarkMotionPath = ({
  sectionRef,
  stageRef,
  pathRef,
  cardRefs
}: DarkMotionPathRefs) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  React.useLayoutEffect(() => {
    if (prefersReducedMotion || typeof window === "undefined") {
      return;
    }

    ensureMotionPathPlugins();

    const section = sectionRef.current;
    const stage = stageRef.current;
    const path = pathRef.current;
    const cards = cardRefs.current;

    if (!section || !stage || !path || cards.length === 0) {
      return;
    }

    const context = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          isMobile: "(max-width: 1023px)"
        },
        (media) => {
          const { isDesktop } = media.conditions as { isDesktop: boolean };

          const opacitySetters = cards.map((card) =>
            gsap.quickSetter(card, "opacity")
          );
          const filterSetters = cards.map((card) =>
            gsap.quickSetter(card, "filter")
          );
          const scaleSetters = cards.map((card) =>
            gsap.quickSetter(card, "scale")
          );
          const zIndexSetters = cards.map((card) =>
            gsap.quickSetter(card, "zIndex")
          );

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: stage,
              start: "top top",
              end: isDesktop ? "+=200%" : "+=140%",
              scrub: 1,
              pin: isDesktop,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: () => {
                const viewportCenter = window.innerHeight / 2;
                const maxDistance = window.innerHeight * 0.5;

                cards.forEach((card, index) => {
                  const rect = card.getBoundingClientRect();
                  const cardCenter = rect.top + rect.height / 2;
                  const distance = Math.abs(cardCenter - viewportCenter);
                  const normalized = clamp(distance / maxDistance, 0, 1);
                  const prominence = 1 - normalized;

                  const opacity = lerp(0.35, 1, prominence);
                  const blur = lerp(isDesktop ? 10 : 6, 0, prominence);
                  const scale = lerp(0.96, 1.02, prominence);

                  opacitySetters[index](opacity);
                  filterSetters[index](`blur(${blur}px)`);
                  scaleSetters[index](scale);
                  zIndexSetters[index](Math.round(prominence * 10));
                });
              }
            }
          });

          const motionConfigs = [
            { start: 0.05, end: 0.55 },
            { start: 0.2, end: 0.75 },
            { start: 0.4, end: 0.95 }
          ];

          cards.forEach((card, index) => {
            const config = motionConfigs[index] ?? motionConfigs[0];
            gsap.set(card, { xPercent: -50, yPercent: -50 });
            timeline.to(
              card,
              {
                motionPath: {
                  path,
                  align: path,
                  alignOrigin: [0.5, 0.5],
                  autoRotate: false,
                  start: config.start,
                  end: config.end
                },
                ease: "none"
              },
              0
            );
          });

          return () => {
            timeline.scrollTrigger?.kill();
            timeline.kill();
          };
        }
      );

      return () => {
        mm.revert();
      };
    }, section);

    return () => {
      context.revert();
    };
  }, [prefersReducedMotion, sectionRef, stageRef, pathRef, cardRefs]);
};
