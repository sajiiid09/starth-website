import React from "react";
import HeroKeyhole from "@/components/home-v2/HeroKeyhole";
import DarkMotionPath from "@/components/home-v2/DarkMotionPath";
import ChaosDrop from "@/components/home-v2/ChaosDrop";
import PlatformStack from "@/components/home-v2/PlatformStack";
import SolutionsCarousel from "@/components/home-v2/SolutionsCarousel";
import SocialProof from "@/components/home-v2/SocialProof";
import FinalCTA from "@/components/home-v2/FinalCTA";
import { useNavThemeObserver } from "@/components/home-v2/hooks/useNavThemeObserver";

const HomeContent: React.FC = () => {
  const showDebugTokens =
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get("debugTokens") === "1";

  useNavThemeObserver();

  return (
    <div className="min-h-screen bg-white">
      <HeroKeyhole />
      <DarkMotionPath />
      <ChaosDrop />
      <PlatformStack />
      <SolutionsCarousel />
      <SocialProof />
      <FinalCTA />
      {showDebugTokens && (
        <div className="fixed bottom-6 right-6 z-50 w-[260px] rounded-2xl border border-brand-dark/10 bg-brand-light p-4 text-sm shadow-soft">
          <div className="font-semibold text-brand-dark">Token debug</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-brand-dark" />
              <span className="text-xs">Dark</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-brand-cream" />
              <span className="text-xs">Cream</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-brand-blue" />
              <span className="text-xs">Blue</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-brand-teal" />
              <span className="text-xs">Teal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-brand-coral" />
              <span className="text-xs">Coral</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-brand-light ring-1 ring-brand-dark/10" />
              <span className="text-xs">Light</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="font-display text-lg font-semibold leading-tight text-brand-dark">
              Display heading
            </div>
            <div className="text-xs uppercase tracking-caps text-brand-dark/60">
              Eyebrow label
            </div>
            <p className="text-xs text-brand-dark/70">
              Body text sample with 1.55 line-height.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function HomePage() {
  return <HomeContent />;
}
