import React from "react";
import HomeNav from "@/components/home-v2/HomeNav";
import HeroKeyhole from "@/components/home-v2/HeroKeyhole";
import DarkMotionPath from "@/components/home-v2/DarkMotionPath";
import ChaosDrop from "@/components/home-v2/ChaosDrop";
import PlatformStack from "@/components/home-v2/PlatformStack";
import SolutionsCarousel from "@/components/home-v2/SolutionsCarousel";
import SocialProof from "@/components/home-v2/SocialProof";
import FinalCTA from "@/components/home-v2/FinalCTA";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <HomeNav />
      <HeroKeyhole />
      <DarkMotionPath />
      <ChaosDrop />
      <PlatformStack />
      <SolutionsCarousel />
      <SocialProof />
      <FinalCTA />
    </div>
  );
}
