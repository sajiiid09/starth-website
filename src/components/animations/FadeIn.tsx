import React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

let scrollTriggerRegistered = false;

const ensureScrollTrigger = () => {
  if (!scrollTriggerRegistered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }
};

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
  ease?: string;
  start?: string;
  once?: boolean;
  staggerChildren?: number;
  childSelector?: string;
};

const FadeIn: React.FC<FadeInProps> = ({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 40,
  duration = 1,
  ease = "power3.out",
  start = "top 85%",
  once = true,
  staggerChildren = 0,
  childSelector
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    if (prefersReducedMotion || typeof window === "undefined") {
      return;
    }

    ensureScrollTrigger();

    const element = wrapperRef.current;
    if (!element) {
      return;
    }

    const axisOffset = {
      x: 0,
      y: 0
    };

    if (direction === "up") {
      axisOffset.y = distance;
    }
    if (direction === "down") {
      axisOffset.y = -distance;
    }
    if (direction === "left") {
      axisOffset.x = distance;
    }
    if (direction === "right") {
      axisOffset.x = -distance;
    }

    const targets =
      staggerChildren > 0
        ? element.querySelectorAll(childSelector || ":scope > *")
        : element;

    const context = gsap.context(() => {
      gsap.fromTo(
        targets,
        { autoAlpha: 0, x: axisOffset.x, y: axisOffset.y },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          ease,
          stagger: staggerChildren > 0 ? staggerChildren : undefined,
          scrollTrigger: {
            trigger: element,
            start,
            toggleActions: once ? "play none none none" : "play none none reverse",
            invalidateOnRefresh: true
          }
        }
      );
    }, element);

    return () => {
      context.revert();
    };
  }, [
    prefersReducedMotion,
    delay,
    direction,
    distance,
    duration,
    ease,
    start,
    once,
    staggerChildren,
    childSelector
  ]);

  return (
    <div ref={wrapperRef} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
};

export default FadeIn;
