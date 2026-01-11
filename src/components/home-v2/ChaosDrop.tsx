import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";

// Ensure plugins are registered
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ChaosDrop: React.FC = () => {
  const theme = "blue" as const;
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const arrowHeadRef = useRef<SVGPathElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial State: Path is "undrawn"
      const pathLength = pathRef.current?.getTotalLength() || 0;
      
      gsap.set(pathRef.current, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      });
      
      gsap.set(arrowHeadRef.current, {
        opacity: 0, 
        scale: 0,
        transformOrigin: "center center"
      });

      // 2. ScrollTrigger Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center", // Start drawing when section hits center
          end: "center center",
          scrub: 1, // Smooth drawing linked to scroll
        },
      });

      // Draw the line
      tl.to(pathRef.current, {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: "none",
      })
      // Pop the arrow head at the end
      .to(arrowHeadRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.2,
        ease: "back.out(1.7)",
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <Section
      theme={theme}
      id="home-chaos"
      dataSection="chaos"
      className="relative overflow-hidden py-24 md:py-32 lg:py-40 bg-brand-blue"
    >
      <Container>
        <div ref={sectionRef} className="relative flex w-full flex-col items-center">
          
          {/* The Top "Eyebrow" Text */}
          <FadeIn direction="up" delay={0.1} duration={0.8} ease="power2.out" className="mb-12 text-center">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark/40">
              Event logistics have no way to coordinate these complex arrivals
            </p>
          </FadeIn>

          {/* The Graphic + Main Text Wrapper */}
          <div className="relative w-full max-w-5xl">
            
            {/* The SVG Graphic (Absolute to layer behind/around) */}
            <div className="absolute -top-20 -left-[10%] w-[120%] h-[140%] pointer-events-none z-0">
               <svg
                viewBox="0 0 1200 800"
                fill="none"
                preserveAspectRatio="none"
                className="w-full h-full"
               >
                 {/* The Drawing Line: Enters top-left, curves around right, points to text */}
                 <path
                   ref={pathRef}
                   d="M 200 0 V 100 Q 200 400 600 400 H 1000 Q 1100 400 1100 500 V 600" 
                   stroke="white"
                   strokeWidth="30"
                   strokeLinecap="round"
                   vectorEffect="non-scaling-stroke"
                   className="opacity-50"
                 />
                 {/* The Arrow Head */}
                 <path 
                   ref={arrowHeadRef}
                   d="M 1070 570 L 1100 610 L 1130 570" 
                   stroke="white" 
                   strokeWidth="30" 
                   strokeLinecap="round" 
                   strokeLinejoin="round"
                   className="opacity-50"
                 />
               </svg>
            </div>

            {/* Main Headline (Centered & Large) */}
            <div ref={textContainerRef} className="relative z-10 text-center flex flex-col gap-6">
              <FadeIn delay={0.2} duration={1} ease="power3.out" direction="up" distance={60}>
                <h2 className="font-display text-5xl font-bold leading-[1.1] tracking-tight text-brand-dark/40 md:text-7xl lg:text-8xl">
                  Without a blueprint, <br />
                  it's chaos.
                </h2>
              </FadeIn>
              
              <FadeIn delay={0.5} duration={1} ease="power3.out" direction="up" distance={60}>
                <h2 className="font-display text-5xl font-bold leading-[1.1] tracking-tight text-brand-dark md:text-7xl lg:text-8xl">
                  With Strathwell, <br />
                  it’s orchestration.
                </h2>
              </FadeIn>
            </div>

            {/* Bottom Subtext */}
            <FadeIn delay={0.8} duration={0.9} ease="power2.out" direction="up" distance={40} className="relative z-10 mt-16 flex justify-center">
              <p className="max-w-2xl text-center text-lg font-medium leading-relaxed text-brand-dark/70 md:text-xl">
                Strathwell transforms venues into intelligent hubs where automated
                workflows seamlessly coordinate vendors, staff, and deliveries.
              </p>
            </FadeIn>

          </div>
        </div>
      </Container>
    </Section>
  );
};

export default ChaosDrop;