import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH2 from "@/components/home-v2/primitives/DisplayH2";
import PillButton from "@/components/home-v2/primitives/PillButton";
import FadeIn from "@/components/animations/FadeIn";
import { solutions } from "@/components/home-v2/config/solutions";
import { useFollowCursor } from "@/components/home-v2/hooks/useFollowCursor";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const SolutionsCarousel: React.FC = () => {
  const theme = "cream" as const;
  const prefersReducedMotion = usePrefersReducedMotion();
  const { wrapperRef, cursorRef, isActive } = useFollowCursor({
    enabled: !prefersReducedMotion
  });

  return (
    <Section theme={theme} id="home-solutions" dataSection="solutions">
      <Container>
        <div className="flex flex-col gap-10">
          <FadeIn>
            <div className="flex flex-col gap-4">
              <Eyebrow theme={theme}>Solutions</Eyebrow>
              <DisplayH2 theme={theme}>
                Experiences tuned for every Strathwell blueprint.
              </DisplayH2>
            </div>
          </FadeIn>
          <FadeIn>
            <div
              ref={wrapperRef}
              className={`relative ${prefersReducedMotion ? "" : "cursor-none"}`}
            >
              {!prefersReducedMotion && (
                <div
                  ref={cursorRef}
                  className={`pointer-events-none absolute left-0 top-0 z-20 rounded-full border border-brand-dark/20 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark shadow-soft backdrop-blur ${
                    isActive ? "opacity-100" : "opacity-0"
                  } transition-opacity duration-200`}
                >
                  Drag
                </div>
              )}
              <Swiper
                spaceBetween={24}
                slidesPerView={1.1}
                breakpoints={{
                  768: { slidesPerView: 1.6 },
                  1024: { slidesPerView: 2.6 }
                }}
              >
                {solutions.map((solution) => (
                  <SwiperSlide key={solution.title}>
                    <div className="group h-full rounded-2xl border border-brand-dark/10 bg-white shadow-soft transition duration-250 ease-smooth hover:shadow-card">
                      <div className="overflow-hidden rounded-2xl border-b border-brand-dark/10">
                        <img
                          src={solution.imageSrc}
                          alt={solution.title}
                          className="h-[220px] w-full object-cover transition duration-400 ease-smooth group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex h-full flex-col gap-4 p-6">
                        <div>
                          <h3 className="text-2xl font-semibold text-brand-dark">
                            {solution.title}
                          </h3>
                          <p className="mt-2 text-base text-brand-dark/70">
                            {solution.subtitle}
                          </p>
                        </div>
                        <PillButton
                          variant="secondary"
                          size="sm"
                          className="self-start"
                        >
                          {solution.ctaLabel}
                        </PillButton>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
};

export default SolutionsCarousel;
