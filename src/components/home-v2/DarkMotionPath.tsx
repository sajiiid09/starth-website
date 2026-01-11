import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";

// Register plugins immediately
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

// Refined Copy for Automated Event Management
const cards = [
  {
    id: 1,
    title: "Real-time occupancy tracking for instant pivots.",
    theme: "dark",
  },
  {
    id: 2,
    title: "Automated run-of-show cues for every vendor.",
    theme: "light", // High contrast "Pop" card
  },
  {
    id: 3,
    title: "ROI visibility that stakeholders can trust.",
    theme: "dark",
  },
  {
    id: 4,
    title: "Predictable logistics for complex crowds.",
    theme: "dark",
  },
];

const DarkMotionPath: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const path = pathRef.current;
      const cardElements = cardsRef.current.filter(Boolean);

      if (!path || cardElements.length === 0) return;

      // 1. Master Timeline (Heavier Scrub for "Soothing" feel)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "+=500%", // Much longer scroll distance for very slow, smooth movement
          pin: true,     
          scrub: 2,      // Higher value = more "weight/lag" in the scroll
        },
      });

      // 2. Animate Cards along the Invisible Path
      cardElements.forEach((card, index) => {
        gsap.set(card, { 
          xPercent: -50, 
          yPercent: -50, 
          transformOrigin: "center center",
          opacity: 0 
        });

        // Spacing Logic: 
        // Cards enter from Right (0) -> Exit Left (1)
        // We stagger them so they flow in a continuous stream
        const spacing = 0.28; 
        
        tl.to(card, {
          motionPath: {
            path: path,
            align: path,
            alignOrigin: [0.5, 0.5],
            start: 0, 
            end: 1, 
          },
          ease: "none",
          duration: 1, 
        }, index * spacing); 
      });

      // 3. Dynamic Focus Effect (Blur/Scale/Opacity)
      ScrollTrigger.create({
        trigger: triggerRef.current,
        start: "top top",
        end: "+=500%",
        scrub: true,
        onUpdate: () => {
          cardElements.forEach((card) => {
            const rect = card!.getBoundingClientRect();
            const center = window.innerWidth / 2;
            const cardCenter = rect.left + rect.width / 2;
            const dist = Math.abs(center - cardCenter);
            
            // Focus Window: The "Active Zone" in the middle
            const maxDist = window.innerWidth * 0.35; // Tighter focus zone
            const normalizedDist = Math.min(dist, maxDist);
            const focus = 1 - (normalizedDist / maxDist); // 1 = center, 0 = edge

            // Interpolate styles based on focus factor
            gsap.set(card, {
              scale: 0.8 + (focus * 0.3),       // 0.8 -> 1.1 scale
              opacity: 0.2 + (focus * 0.8),     // 0.2 -> 1.0 opacity
              filter: `blur(${(1 - focus) * 12}px)`, // 12px blur -> 0px blur
              zIndex: Math.round(focus * 100),  // Focused item always on top
            });
          });
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <Section theme="dark" id="home-dark" className="relative z-10 overflow-hidden bg-brand-dark">
      {/* The Pinned Wrapper */}
      <div ref={triggerRef} className="relative flex h-screen w-full flex-col justify-center overflow-hidden">
        
        {/* Static Background Text (Layer 0) */}
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center px-6 pt-20 text-center pointer-events-none">
          <Container>
            <FadeIn duration={1.2} ease="power3.out" direction="up" distance={60}>
              <h2 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl lg:text-[5.5rem]">
                From chaos to <br />
                <span className="text-white/40">coordinated flow.</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.3} duration={1} ease="power2.out" direction="up" distance={40}>
              <p className="mx-auto mt-8 max-w-xl text-lg text-white/60 md:text-xl">
                Strathwell automates the invisible dependencies of event management, 
                turning complex logistics into a predictable operating system.
              </p>
            </FadeIn>
          </Container>
        </div>

        {/* The Motion Stage (Layer 10) */}
        <div className="relative z-10 h-full w-full pointer-events-none">
          
          {/* The Invisible Path used for Logic */}
          <svg
            className="absolute top-1/2 left-0 h-full w-full -translate-y-1/2"
            viewBox="0 0 1440 800"
            preserveAspectRatio="xMidYMid meet"
            style={{ opacity: 0 }} // Completely hidden visually, but present for GSAP
          >
            <path
              ref={pathRef}
              // A smooth S-curve starting off-screen Right and ending off-screen Left
              d="M 1600 300 C 1200 300 1000 600 720 600 C 440 600 240 300 -200 300"
              fill="none"
              stroke="none" // No visible line
            />
          </svg>

          {/* The Floating Cards */}
          {cards.map((card, i) => (
            <div
              key={card.id}
              ref={(el) => (cardsRef.current[i] = el)}
              // Card Styling:
              // - aspect-[4/3]: Slightly rectangular for better text fit
              // - glassmorphism border for the dark cards
              className={`absolute top-0 left-0 flex aspect-[4/3] w-[26vw] min-w-[300px] max-w-[420px] flex-col justify-between rounded-3xl p-8 shadow-2xl backdrop-blur-sm ${
                card.theme === "light" 
                  ? "bg-[#D9EDF0] text-brand-dark border-none" 
                  : "bg-[#1A1A1A]/90 border border-white/10 text-white"
              }`}
            >
              <h3 className="text-2xl font-bold leading-snug tracking-tight md:text-3xl">
                {card.title}
              </h3>
              
              {/* Bottom Decorative Element */}
              <div className="flex items-center justify-between opacity-50">
                 <div className="h-1.5 w-12 rounded-full bg-current" />
                 <div className="text-[10px] font-mono uppercase tracking-widest">
                    0{card.id}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default DarkMotionPath;