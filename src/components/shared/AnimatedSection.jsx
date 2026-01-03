import React, { useEffect, useRef } from "react";
import anime from "animejs";

export default function AnimatedSection({ children, animation = "fadeInUp", delay = 0, className = "" }) {
  const elementRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const animations = {
      fadeInUp: {
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutCubic'
      },
      fadeIn: {
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad'
      },
      slideInLeft: {
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 700,
        easing: 'easeOutExpo'
      },
      slideInRight: {
        translateX: [50, 0],
        opacity: [0, 1],
        duration: 700,
        easing: 'easeOutExpo'
      },
      scaleIn: {
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutBack'
      }
    };

    anime({
      targets: elementRef.current,
      ...animations[animation],
      delay
    });
  }, [animation, delay]);

  return (
    <div ref={elementRef} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}