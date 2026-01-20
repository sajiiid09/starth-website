import React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

let heroScrollRegistered = false;

const ensureHeroScrollTrigger = () => {
  if (!heroScrollRegistered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    heroScrollRegistered = true;
  }
};

type HeroKeyholeRefs = {
  sectionRef: React.RefObject<HTMLElement>;
  mediaWrapRef: React.RefObject<HTMLDivElement>;
  textWrapRef: React.RefObject<HTMLDivElement>;
};

export const useHeroKeyhole = ({
  sectionRef,
  mediaWrapRef,
  textWrapRef
}: HeroKeyholeRefs) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  React.useLayoutEffect(() => {
    if (prefersReducedMotion || typeof window === "undefined") {
      return;
    }

    ensureHeroScrollTrigger();

    const section = sectionRef.current;
    const mediaWrap = mediaWrapRef.current;
    const textWrap = textWrapRef.current;

    if (!section || !mediaWrap || !textWrap) {
      return;
    }

    const context = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          isMobile: "(max-width: 1023px)"
        },
        (ctx) => {
          const { isDesktop } = ctx.conditions as { isDesktop: boolean };

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: isDesktop ? "top top" : "top top+=10%",
              end: isDesktop ? "+=120%" : "+=80%",
              scrub: 1,
              pin: isDesktop,
              anticipatePin: 1,
              invalidateOnRefresh: true
            }
          });

          timeline.fromTo(
            mediaWrap,
            {
              width: "clamp(320px, 40vw, 520px)",
              height: "clamp(220px, 28vw, 340px)",
              borderRadius: "9999px",
              y: 0
            },
            {
              width: isDesktop ? "100vw" : "92vw",
              height: isDesktop ? "90vh" : "60vh",
              borderRadius: isDesktop ? "24px" : "32px",
              y: isDesktop ? -12 : 0,
              ease: "none"
            },
            0
          );

          timeline.to(
            textWrap,
            {
              opacity: 0,
              y: -20,
              ease: "none"
            },
            0.55
          );

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
  }, [prefersReducedMotion, sectionRef, mediaWrapRef, textWrapRef]);
};
