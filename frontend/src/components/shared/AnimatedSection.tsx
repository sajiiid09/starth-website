import React, { useEffect, useRef } from "react";

type AnimationType = "fadeInUp" | "fadeIn" | "slideInLeft" | "slideInRight" | "scaleIn";

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  className?: string;
}

const animationKeyframes: Record<AnimationType, Keyframe[]> = {
  fadeInUp: [
    { transform: "translateY(50px)", opacity: 0 },
    { transform: "translateY(0)", opacity: 1 },
  ],
  fadeIn: [
    { opacity: 0 },
    { opacity: 1 },
  ],
  slideInLeft: [
    { transform: "translateX(-50px)", opacity: 0 },
    { transform: "translateX(0)", opacity: 1 },
  ],
  slideInRight: [
    { transform: "translateX(50px)", opacity: 0 },
    { transform: "translateX(0)", opacity: 1 },
  ],
  scaleIn: [
    { transform: "scale(0.8)", opacity: 0 },
    { transform: "scale(1)", opacity: 1 },
  ],
};

const animationDurations: Record<AnimationType, number> = {
  fadeInUp: 800,
  fadeIn: 600,
  slideInLeft: 700,
  slideInRight: 700,
  scaleIn: 600,
};

export default function AnimatedSection({
  children,
  animation = "fadeInUp",
  delay = 0,
  className = "",
}: AnimatedSectionProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const el = elementRef.current;
    const timeout = setTimeout(() => {
      el.animate(animationKeyframes[animation], {
        duration: animationDurations[animation],
        easing: "ease-out",
        fill: "forwards",
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [animation, delay]);

  return (
    <div ref={elementRef} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
