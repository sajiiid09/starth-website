import React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

let chaosDropRegistered = false;

const ensureChaosDropScrollTrigger = () => {
  if (!chaosDropRegistered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    chaosDropRegistered = true;
  }
};

type ChaosDropRefs = {
  sectionRef: React.RefObject<HTMLDivElement>;
  pathRef: React.RefObject<SVGPathElement>;
  arrowRef: React.RefObject<SVGPathElement>;
  line1Ref: React.RefObject<HTMLParagraphElement>;
  line2Ref: React.RefObject<HTMLParagraphElement>;
};

export const useChaosDrop = ({
  sectionRef,
  pathRef,
  arrowRef,
  line1Ref,
  line2Ref
}: ChaosDropRefs) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  React.useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const section = sectionRef.current;
    const path = pathRef.current;
    const arrow = arrowRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;

    if (!section || !path || !line1 || !line2) {
      return;
    }

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length} ${length}`;
    path.style.strokeDashoffset = `${length}`;
    path.style.opacity = "0";

    if (arrow) {
      arrow.style.opacity = "0";
    }

    if (prefersReducedMotion) {
      path.style.strokeDashoffset = "0";
      path.style.opacity = "1";
      if (arrow) {
        arrow.style.opacity = "1";
      }
      line1.style.opacity = "0.6";
      line1.style.transform = "translateY(0px)";
      line2.style.opacity = "1";
      line2.style.transform = "translateY(0px)";
      return;
    }

    ensureChaosDropScrollTrigger();

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          toggleActions: "play none none none",
          once: true,
          invalidateOnRefresh: true
        }
      });

      timeline.to(
        path,
        {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out"
        },
        0
      );

      if (arrow) {
        timeline.to(
          arrow,
          {
            opacity: 1,
            duration: 0.4,
            ease: "power3.out"
          },
          0.8
        );
      }

      timeline.fromTo(
        line1,
        { opacity: 0, y: 10 },
        { opacity: 0.6, y: 0, duration: 0.6, ease: "power3.out" },
        0.2
      );

      timeline.fromTo(
        line2,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        0.6
      );

      return () => {
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    }, section);

    return () => {
      context.revert();
    };
  }, [prefersReducedMotion, sectionRef, pathRef, arrowRef, line1Ref, line2Ref]);
};
