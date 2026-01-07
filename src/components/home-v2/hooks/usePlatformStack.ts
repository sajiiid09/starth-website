import React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

let platformStackRegistered = false;

const ensurePlatformStackScrollTrigger = () => {
  if (!platformStackRegistered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    platformStackRegistered = true;
  }
};

type PlatformStackRefs = {
  sectionRef: React.RefObject<HTMLElement>;
  stackRef: React.RefObject<HTMLDivElement>;
  cardARef: React.RefObject<HTMLDivElement>;
  cardBRef: React.RefObject<HTMLDivElement>;
};

export const usePlatformStack = ({
  sectionRef,
  stackRef,
  cardARef,
  cardBRef
}: PlatformStackRefs) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  React.useLayoutEffect(() => {
    if (prefersReducedMotion || typeof window === "undefined") {
      return;
    }

    const section = sectionRef.current;
    const stack = stackRef.current;
    const cardA = cardARef.current;
    const cardB = cardBRef.current;

    if (!section || !stack || !cardA || !cardB) {
      return;
    }

    ensurePlatformStackScrollTrigger();

    const context = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px)"
        },
        (ctx) => {
          const { isDesktop } = ctx.conditions as { isDesktop: boolean };

          if (!isDesktop) {
            return () => undefined;
          }

          const cardAAnim = gsap.to(cardA, {
            y: -80,
            ease: "none",
            scrollTrigger: {
              trigger: stack,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true
            }
          });

          const cardBAnim = gsap.to(cardB, {
            y: 60,
            ease: "none",
            scrollTrigger: {
              trigger: stack,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true
            }
          });

          return () => {
            cardAAnim.scrollTrigger?.kill();
            cardAAnim.kill();
            cardBAnim.scrollTrigger?.kill();
            cardBAnim.kill();
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
  }, [prefersReducedMotion, sectionRef, stackRef, cardARef, cardBRef]);
};
