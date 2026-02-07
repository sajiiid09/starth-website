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
      const mm = gsap.matchMedia();

      mm.add("(max-width: 640px)", () => {
        gsap.set(videoContainerRef.current, {
          width: "70vw",
          height: "20vh",
          borderRadius: "1.25rem",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=140%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        tl.to(videoContainerRef.current, {
          width: "100vw",
          height: "85vh",
          borderRadius: "0rem",
          marginTop: 0,
          marginBottom: 0,
          ease: "power2.inOut",
        }).to(
          contentWrapperRef.current,
          {
            opacity: 0,
            scale: 0.96,
            duration: 0.45,
          },
          0
        );
      });

      mm.add("(min-width: 641px)", () => {
        gsap.set(videoContainerRef.current, {
          width: "25vw",
          height: "18vh",
          borderRadius: "1.5rem",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=200%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        tl.to(videoContainerRef.current, {
          width: "100vw",
          height: "100vh",
          borderRadius: "0rem",
          marginTop: 0,
          marginBottom: 0,
          ease: "power2.inOut",
        }).to(
          contentWrapperRef.current,
          {
            opacity: 0,
            scale: 0.95,
            duration: 0.5,
          },
          0
        );
      });

      return () => mm.revert();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[110vh] w-full flex-col items-center justify-center overflow-hidden bg-white sm:min-h-[120vh] md:h-[130vh]"
    >
      {/* Wrapper for TEXT content only. 
        We use z-10 so it sits 'under' the video when expanded (if video is z-20),
        OR z-30 if we want text on top initially.
        Based on your previous request, the text fades out, so z-index just needs to not block video.
      */}
      <div 
        ref={contentWrapperRef} 
        className="absolute inset-0 z-30 flex flex-col items-center justify-start gap-8 px-4 pb-6 pt-6 text-center pointer-events-none sm:gap-10 sm:px-6 sm:pt-8 md:z-10 md:gap-12 md:pb-5 md:pt-1"
      >
        
        {/* --- Top Title --- */}
        <div className="flex flex-col items-center text-center">
          <FadeIn delay={0.1} direction="up" duration={0.8} ease="power2.out" distance={30}>
            <span className="mb-4 block font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-500 sm:text-[10px] sm:tracking-[0.2em]">
              The OS for Autonomous Event Management
            </span>
          </FadeIn>
          <FadeIn delay={0.3} direction="up" duration={1.2} ease="power3.out" distance={60}>
            <h1 className="max-w-6xl text-3xl font-semibold leading-tight tracking-tight text-brand-dark sm:text-4xl md:text-7xl lg:text-[5.5rem]">
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
        <div className="h-[14vh] w-full sm:h-[18vh]" /> 

        {/* --- Bottom Text & Logos --- */}
        <div className="flex flex-col items-center text-center gap-6 sm:gap-8 md:gap-10">
          <FadeIn delay={0.3} direction="up">
            <p className="max-w-2xl text-base font-medium leading-relaxed text-gray-600 sm:text-lg md:text-xl">
              Strathwell transforms spaces into execution-ready event blueprints—mapping layouts, services, budgets, timelines, and risk so teams can approve and run events with confidence.
            </p>
          </FadeIn>

          <FadeIn delay={0.4} direction="up" className="flex flex-col items-center gap-4 sm:gap-6">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 sm:text-[10px]">
              Trusted By
            </span>
            <div className="flex items-center gap-5 grayscale-0 sm:gap-8">
              {[
                { src: "/partners/google.png", className: "h-6 sm:h-7 md:h-8" },
                { src: "/partners/nvidia.png", className: "h-6 sm:h-7 md:h-8" },
                { src: "/partners/founder.png", className: "h-5 sm:h-6" }
              ].map((partner) => (
                <img
                  key={partner.src}
                  src={partner.src}
                  alt="Partner logo"
                  className={`w-auto object-contain ${partner.className}`}
                  loading="lazy"
                />
              ))}
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
        className="absolute z-20 overflow-hidden shadow-2xl top-[33%] left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-[48%] md:top-[40%]" // Manually positioned to sit in the gap
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        >
          <source
            src="/137629.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>
      
    </section>
  );
}
