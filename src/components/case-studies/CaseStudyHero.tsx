import React from "react";
import { Badge } from "@/components/ui/badge";
import { Award, Users, TrendingUp } from "lucide-react";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";

export default function CaseStudyHero() {
  return (
    <section className="pt-16 pb-12 bg-gradient-to-b from-brand-cream/70 via-brand-light to-brand-light md:pt-20 md:pb-16">
      <Container>
        <FadeIn className="text-center">
          <Badge className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
            <Award className="h-4 w-4" />
            Success Stories
          </Badge>

          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-6xl">
            Events That
            <br />
            <span className="bg-gradient-to-r from-brand-teal to-brand-dark bg-clip-text text-transparent">
              Make Impact
            </span>
          </h1>

          <p className="mt-4 text-base text-brand-dark/70 sm:text-lg md:mt-6 md:text-2xl">
            See how Strathwell helps create memorable experiences that drive business results and foster lasting connections.
          </p>
        </FadeIn>

        {/* Key Stats */}
        <FadeIn className="mt-12 grid gap-6 md:grid-cols-2" staggerChildren={0.1} childSelector=".stat-card">
          {[
            { value: "194", label: "Summit Attendees", icon: Users },
            { value: "$10K+", label: "Business Value", icon: TrendingUp }
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="stat-card rounded-3xl border border-white/40 bg-white/80 px-6 py-8 text-center shadow-card"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-teal/10">
                  <Icon className="h-6 w-6 text-brand-teal" />
                </div>
                <h3 className="text-3xl font-semibold text-brand-dark">{stat.value}</h3>
                <p className="mt-2 text-sm text-brand-dark/70">{stat.label}</p>
              </div>
            );
          })}
        </FadeIn>
      </Container>
    </section>
  );
}
