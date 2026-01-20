import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

// Updated Cards with specific shades of #D9EDF0
const cards = [
  {
    id: 1,
    title: "Real-time occupancy tracking for instant pivots.",
    bg: "#D9EDF0",      // Dark
    text: "#027F83",
    border: "rgba(255,255,255,0.1)"
  },
  {
    id: 2,
    title: "Automated run-of-show cues for every vendor.",
    bg: "#c0ecf3",      // Base Light Blue (Pop Card)
    text: "#027F83",    // Brand Teal Text
    border: "transparent"
  },
  {
    id: 3,
    title: "ROI visibility that stakeholders can trust.",
    bg: "#59b6c5",      // Slightly darker shade of D9EDF0
    text: "#eaf2f2",    // Darker Teal Text
    border: "transparent"
  },
  {
    id: 4,
    title: "Predictable logistics for complex crowds.",
    bg: "#01b0b6",      // Dark
    text: "#e9f6f6",
    border: "rgba(255,255,255,0.1)"
  },
];

const DarkMotionPath: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Refs for the two lines of text
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const path = pathRef.current;
      const cardElements = cardsRef.current.filter(Boolean);

      if (!path || cardElements.length === 0) return;

      // 1. Master Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "+=500%", 
          pin: true,     
          scrub: 1.5,
        },
      });

      // --- PHASE 1: Sequential Text Fill (0% to 20% of scroll) ---
      // Line 1 fills first (0% -> 10%)
      tl.to(line1Ref.current, {
        backgroundPosition: "0% 50%", 
        ease: "none",
        duration: 0.1, 
      }, 0);

      // Line 2 fills second (10% -> 20%)
      tl.to(line2Ref.current, {
        backgroundPosition: "0% 50%", 
        ease: "none",
        duration: 0.1, 
      }, ">"); // Starts immediately after Line 1

      // --- PHASE 2: Card Motion (20% to 100% of scroll) ---
      cardElements.forEach((card, index) => {
        gsap.set(card, { 
          xPercent: -50, 
          yPercent: -50, 
          transformOrigin: "center center",
          opacity: 0,
          scale: 0.5 
        });

        const spacing = 0.22; 
        const startTime = 0.2 + (index * spacing); // Start after text fill (0.2)

        tl.to(card, {
          motionPath: {
            path: path,
            align: path,
            alignOrigin: [0.5, 0.5],
            start: 0, 
            end: 1, 
          },
          ease: "none",
          duration: 0.8, // Fill remaining timeline
        }, startTime); 
      });

      // --- PHASE 3: Smart Focus (Blur right side only) ---
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
            
            // Calculate distance relative to center
            // Positive = Card is to the Right (coming in)
            // Negative = Card is to the Left (leaving)
            const dist = cardCenter - center; 
            
            const maxDist = window.innerWidth * 0.4;
            
            // Logic: 
            // If dist > 0 (Right side): Apply blur based on distance
            // If dist <= 0 (Left/Center): No blur (Clear)
            let blurAmount = 0;
            let scaleAmount = 1.1; // Default "Active" size
            let opacityAmount = 1;

            if (dist > 0) {
                // Incoming from Right
                const normalizedDist = Math.min(dist, maxDist);
                const factor = normalizedDist / maxDist; // 0 = center, 1 = edge
                
                blurAmount = factor * 12;        // 0px -> 12px blur
                scaleAmount = 1.1 - (factor * 0.5); // 1.1 -> 0.6 scale
                opacityAmount = 1 - (factor * 0.8); // 1 -> 0.2 opacity
            } else {
                // Exiting to Left (Keep clear, maybe slight shrink if desired)
                // We keep it fully clear as requested
                blurAmount = 0;
                scaleAmount = 1.1; 
                opacityAmount = 1;
            }

            gsap.set(card, {
              scale: scaleAmount,
              opacity: opacityAmount,
              filter: `blur(${blurAmount}px)`,
              zIndex: dist < 100 ? 100 : 10, // Keep center/left cards on top
            });
          });
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Shared styles for the Gradient Text
  const gradientTextStyle: React.CSSProperties = {
    backgroundImage: "linear-gradient(90deg, #FFFFFF 50%, #444444 50%)",
    backgroundSize: "200% 100%",
    backgroundPosition: "100% 50%", // Start Grey
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "inline-block", // Required for background animation on spans
  };

  return (
    <Section theme="dark" id="home-dark" className="relative z-10 overflow-hidden bg-brand-dark">
      <div ref={triggerRef} className="relative flex h-screen w-full flex-col justify-center overflow-hidden">
        
        {/* Background Text Layer */}
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center px-6 pt-20 text-center pointer-events-none">
          <Container>
            <div className="flex flex-col items-center gap-2">
              <span 
                ref={line1Ref}
                className="text-5xl font-bold leading-tight tracking-tight md:text-7xl lg:text-[5.5rem]"
                style={gradientTextStyle}
              >
                From chaos to
              </span>
              <span 
                ref={line2Ref}
                className="text-5xl font-bold leading-tight tracking-tight md:text-7xl lg:text-[5.5rem]"
                style={gradientTextStyle}
              >
                coordinated flow.
              </span>
            </div>

            <FadeIn delay={0.3} duration={1} ease="power2.out" direction="up" distance={40}>
              <p className="mx-auto mt-8 max-w-xl text-lg text-white/60 md:text-xl">
                Strathwell automates the invisible dependencies of event management, 
                turning complex logistics into a predictable operating system.
              </p>
            </FadeIn>
          </Container>
        </div>

        {/* The Motion Stage */}
        <div className="relative z-10 h-full w-full pointer-events-none">
          <svg
            className="absolute top-1/2 left-0 h-full w-full -translate-y-1/2"
            viewBox="0 0 1440 800"
            preserveAspectRatio="xMidYMid meet"
            style={{ opacity: 0 }}
          >
            <path
              ref={pathRef}
              d="M 1600 350 C 1200 350 1000 550 720 550 C 440 550 240 350 -200 350"
              fill="none"
              stroke="none"
            />
          </svg>

          {cards.map((card, i) => (
            <div
              key={card.id}
              ref={(el) => (cardsRef.current[i] = el)}
              style={{
                backgroundColor: card.bg,
                color: card.text,
                borderColor: card.border,
              }}
              className="absolute top-0 left-0 flex aspect-[4/3] w-[28vw] min-w-[320px] max-w-[440px] flex-col justify-between rounded-3xl border p-10 shadow-2xl backdrop-blur-sm"
            >
              <h3 className="text-3xl font-bold leading-snug tracking-tight md:text-4xl">
                {card.title}
              </h3>
              <div className="flex items-center justify-between opacity-50">
                 <div className="h-2 w-16 rounded-full bg-current" />
                 <div className="text-xs font-mono uppercase tracking-widest">
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