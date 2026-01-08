import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { motionTokens } from "@/components/utils/motion";

type UseGsapRevealOptions = {
  targets?: string;
  distance?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  start?: string;
  ease?: string;
  blur?: number;
};

const useGsapReveal = (
  ref: React.RefObject<HTMLElement>,
  {
    targets,
    distance = motionTokens.revealDistance,
    duration = motionTokens.revealDuration,
    delay = 0,
    stagger = 0,
    start = motionTokens.revealStart,
    ease = motionTokens.revealEase,
    blur = motionTokens.revealBlur
  }: UseGsapRevealOptions = {}
) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const targetElements = targets
        ? element.querySelectorAll(targets)
        : element;

      gsap.fromTo(
        targetElements,
        {
          y: distance,
          opacity: 0,
          filter: `blur(${blur}px)`
        },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration,
          delay,
          stagger,
          ease,
          scrollTrigger: {
            trigger: element,
            start,
            toggleActions: "play none none none",
            invalidateOnRefresh: true
          }
        }
      );
    }, element);

    return () => context.revert();
  }, [
    blur,
    delay,
    distance,
    duration,
    ease,
    prefersReducedMotion,
    ref,
    start,
    stagger,
    targets
  ]);
};

export default useGsapReveal;
