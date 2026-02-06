import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Trophy, 
  Clock,
  CurrencyDollar,
  Star,
  Buildings
} from "@phosphor-icons/react";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";

export default function SuccessMetrics() {
  const metrics = [
    {
      icon: Users,
      value: "194",
      label: "Limitless Summit Attendees",
      description: "Connected at the Google HQ flagship event"
    },
    {
      icon: Buildings,
      value: "5+",
      label: "Fortune 500 Partners",
      description: "Including Google, Eventbrite, ServiceNow, Wells Fargo, NVIDIA"
    },
    {
      icon: Trophy,
      value: "AI-Powered",
      label: "Event Orchestration",
      description: "Seamless coordination through our platform"
    },
    {
      icon: Clock,
      value: "1 Day",
      label: "Full Summit Experience",
      description: "Complete event coordination at Google HQ"
    },
    {
      icon: CurrencyDollar,
      value: "$10K+",
      label: "Event Business Value",
      description: "Generated through the Limitless partnership"
    },
    {
      icon: Star,
      value: "Leadership",
      label: "Industry Feedback",
      description: "From leaders at top-tier technology companies"
    }
  ];

  return (
    <section className="py-14 md:py-20">
      <Container>
        <FadeIn className="text-center">
          <h2 className="text-2xl font-semibold text-brand-dark sm:text-3xl md:text-4xl">
            Partnership Impact
          </h2>
          <p className="mt-3 text-base text-brand-dark/70 sm:text-lg md:mt-4">
            Verifiable results from our role in the Limitless Women in Tech Summit partnership
          </p>
        </FadeIn>

        <FadeIn className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerChildren={0.08} childSelector=".metric-card">
          {metrics.map((metric) => (
            <Card
              key={metric.label}
              className="metric-card border border-white/40 bg-white/80 text-center shadow-card"
            >
              <CardContent className="p-8">
                <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-teal/10">
                  <metric.icon className="h-6 w-6 text-brand-teal" />
                </div>

                <div className="space-y-2">
                  <div className="text-3xl font-semibold text-brand-dark">{metric.value}</div>
                  <div className="text-base font-semibold text-brand-dark/90">{metric.label}</div>
                  <p className="text-sm leading-relaxed text-brand-dark/70">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </FadeIn>


      </Container>
    </section>
  );
}
