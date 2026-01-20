import React from "react";

import CaseStudyHero from "../components/case-studies/CaseStudyHero";
import FeaturedCase from "../components/case-studies/FeaturedCase";
import LimitlessSchedule from "../components/case-studies/LimitlessSchedule";
import SuccessMetrics from "../components/case-studies/SuccessMetrics";

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-brand-light text-brand-dark">
      <CaseStudyHero />
      <FeaturedCase />
      <LimitlessSchedule />
      <SuccessMetrics />
    </div>
  );
}
