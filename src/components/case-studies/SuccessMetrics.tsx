import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Award, 
  Clock,
  DollarSign,
  Star,
  Building
} from "lucide-react";
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
      icon: Building,
      value: "5+",
      label: "Fortune 500 Partners",
      description: "Including Google, Eventbrite, ServiceNow, Wells Fargo, NVIDIA"
    },
    {
      icon: Award,
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
      icon: DollarSign,
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
    <section className="py-20">
      <Container>
        <FadeIn className="text-center">
          <h2 className="text-3xl font-semibold text-brand-dark md:text-4xl">
            Partnership Impact
          </h2>
          <p className="mt-4 text-lg text-brand-dark/70">
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

        {/* Call to Action */}
        <FadeIn className="mt-16">
          <Card className="border-none bg-gradient-to-r from-brand-dark to-brand-dark/90 text-brand-light shadow-card">
            <CardContent className="p-12 text-center">
              <h3 className="text-3xl font-semibold">
                Ready to Create Your Success Story?
              </h3>
              <p className="mt-4 text-lg text-brand-light/80">
                Join the leading organizations that trust Strathwell to orchestrate their most important events.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link to={createPageUrl("AIPlanner")}>
                  <button className="w-full rounded-full bg-white px-8 py-3 text-sm font-semibold text-brand-dark transition hover:bg-brand-cream sm:w-auto">
                    Plan with AI
                  </button>
                </Link>
                <Link to={createPageUrl("DFY")}>
                  <button className="w-full rounded-full border border-white/60 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-brand-dark sm:w-auto">
                    Plan with Us
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </Container>
    </section>
  );
}
