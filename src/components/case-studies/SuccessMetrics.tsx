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
  Building,
  Sparkles,
  Bot,
  ArrowRight
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

        {/* Call to Action */}
        <FadeIn className="mt-24">
          <Card className="relative overflow-hidden border-none bg-[#1A1A1A] text-white shadow-2xl transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
            
            {/* --- Decorative Ambient Glows --- */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-[500px] w-[500px] rounded-full bg-brand-teal/20 blur-[120px] opacity-60 pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-[100px] opacity-40 pointer-events-none" />
            
            <CardContent className="relative z-10 flex flex-col items-center p-8 text-center sm:p-12 md:p-20">
              
              {/* Floating Icon */}
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 shadow-inner ring-1 ring-white/10 backdrop-blur-md">
                <Sparkles className="h-8 w-8 text-brand-teal" />
              </div>

              {/* Headlines */}
              <h3 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Ready to Create Your <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-brand-teal/80">
                  Success Story?
                </span>
              </h3>
              
              <p className="mt-4 max-w-xl text-base text-white/60 leading-relaxed sm:text-lg md:mt-6 md:text-xl">
                Join the leading organizations that trust Strathwell to orchestrate their most important events with precision and ease.
              </p>

              {/* Actions */}
              <div className="mt-10 flex w-full flex-col justify-center gap-4 sm:flex-row sm:w-auto">
                <Link to={createPageUrl("AIPlanner")}>
                  <button className="group flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-brand-dark shadow-lg shadow-brand-teal/10 transition-all duration-300 hover:bg-brand-cream hover:scale-105 hover:shadow-brand-teal/20 sm:w-auto min-w-[180px]">
                    <Bot className="h-5 w-5 text-brand-teal" />
                    <span>Plan with AI</span>
                  </button>
                </Link>
                
                <Link to={createPageUrl("DFY")}>
                  <button className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/40 sm:w-auto min-w-[180px]">
                    <span>Plan with Us</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
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
