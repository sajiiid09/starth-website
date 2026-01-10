import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FadeIn from "@/components/animations/FadeIn";

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial State: Small "Pill" Video
      gsap.set(videoContainerRef.current, {
        width: "25vw",    // Preserved your exact values
        height: "18vh",   // Preserved your exact values
        borderRadius: "1.5rem",
      });

      // 2. The Expansion Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=200%",  // Scroll distance to complete expansion
          pin: true,      // Lock section in place
          scrub: 1,       // Smooth, weighty scrubbing
          anticipatePin: 1,
        },
      });

      tl.to(videoContainerRef.current, {
        width: "100vw",        // Full viewport width
        height: "100vh",       // Full viewport height
        borderRadius: "0rem",  // Sharp corners
        marginTop: 0,          // Remove any margins to hit edges
        marginBottom: 0,
        ease: "power2.inOut",  // Smooth acceleration curve
      })
      // Fade out ONLY the text wrapper, NOT the video
      .to(contentWrapperRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.5,
      }, 0); // Runs concurrently

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[130vh] w-full flex-col items-center justify-center overflow-hidden bg-white"
    >
      {/* Wrapper for TEXT content only. 
        We use z-10 so it sits 'under' the video when expanded (if video is z-20),
        OR z-30 if we want text on top initially.
        Based on your previous request, the text fades out, so z-index just needs to not block video.
      */}
      <div 
        ref={contentWrapperRef} 
        className="absolute inset-0 flex flex-col items-center justify-start pb-5 pt-1 gap-12 z-10 pointer-events-none"
      >
        
        {/* --- Top Title --- */}
        <div className="flex flex-col items-center text-center">
          <FadeIn delay={0.1} direction="up">
            <span className="mb-6 block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              The OS for Autonomous Event Management
            </span>
          </FadeIn>
          <FadeIn delay={0.2} direction="up">
            <h1 className="max-w-6xl text-5xl font-bold leading-[1.05] tracking-tight text-brand-dark md:text-7xl lg:text-[5.5rem]">
              Orchestrating events <br />
              <span style={{ color: '#027F83' }}>from blueprint</span> <br />
              to execution
            </h1>
          </FadeIn>
        </div>

        {/* This empty div maintains the flex gap spacing 
           where the video visually sits initially.
           Height matches video initial height (18vh) + some buffer.
        */}
        <div className="h-[18vh] w-full" /> 

        {/* --- Bottom Text & Logos --- */}
        <div className="flex flex-col items-center text-center gap-10">
          <FadeIn delay={0.3} direction="up">
            <p className="max-w-2xl text-lg font-medium leading-relaxed text-gray-600 md:text-xl">
              Strathwell transforms spaces into execution-ready event blueprints—mapping layouts, services, budgets, timelines, and risk so teams can approve and run events with confidence.
            </p>
          </FadeIn>

          <FadeIn delay={0.4} direction="up" className="flex flex-col items-center gap-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Trusted By
            </span>
            <div className="flex items-center gap-8 grayscale opacity-60">
               {/* Logos */}
               <div className="h-6 w-20 bg-gray-300 rounded" />
               <div className="h-6 w-20 bg-gray-300 rounded" />
               <div className="h-6 w-20 bg-gray-300 rounded" />
            </div>
          </FadeIn>
        </div>
      </div>

      {/* --- The Video Container --- 
         Positioned absolutely to align with the 'gap' in the flex container above,
         or just centered if layout permits.
         Given your specific layout needs, using absolute centering is safest for the expansion.
      */}
      <div 
        ref={videoContainerRef} 
        className="absolute z-20 overflow-hidden shadow-2xl top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2" // Manually positioned to sit in the gap
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        >
          <source
            src="/public/herovid.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>
      
    </section>
  );
}