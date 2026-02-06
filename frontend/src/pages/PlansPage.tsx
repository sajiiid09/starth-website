import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Sparkle,
  Lightning,
  Buildings,
  ArrowRight,
  Question,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

import FaqSection from "@/components/marketing/FaqSection";
type BillingCycle = "monthly" | "quarterly" | "yearly";

const plans = [
  {
    id: "free",
    name: "Starter",
    description: "Perfect for trying out AI orchestration.",
    price: { monthly: 0, quarterly: 0, yearly: 0 },
    features: [
      { text: "1 Active Event", included: true },
      { text: "3 AI Iterations / event", included: true },
      { text: "Access to Vendor Marketplace", included: true },
      { text: "Basic Event Itineraries", included: true },
      { text: "Real-time Collaboration", included: false },
      { text: "Dedicated Support", included: false },
    ],
    cta: "Get Started Free",
    popular: false,
    theme: "light",
  },
  {
    id: "plus",
    name: "Plus",
    description: "For professional organizers who need power.",
    price: { monthly: 20, quarterly: 54, yearly: 192 },
    features: [
      { text: "5 Active Events", included: true },
      { text: "5 AI Iterations / event", included: true },
      { text: "Advanced AI Planning Models", included: true },
      { text: "Full Vendor Marketplace Access", included: true },
      { text: "Real-time Collaboration", included: true },
      { text: "Priority Email Support", included: true },
    ],
    cta: "Choose Plus",
    popular: true,
    theme: "dark",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Unlimited scale for large agencies & corps.",
    price: { monthly: "Custom", quarterly: "Custom", yearly: "Custom" },
    features: [
      { text: "Unlimited Events", included: true },
      { text: "Unlimited AI Iterations", included: true },
      { text: "Custom API Integrations", included: true },
      { text: "White-label Options", included: true },
      { text: "Dedicated Account Manager", included: true },
      { text: "SLA & 24/7 Support", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
    theme: "light",
  },
];

export default function PlansPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-brand-dark font-sans selection:bg-brand-teal/20 selection:text-brand-dark">
      <section className="pt-24 pb-12 text-center">
        <Container>
          <FadeIn>
            <Badge className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-teal/20 bg-brand-teal/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
              <Lightning className="h-4 w-4" />
              Plans & Pricing
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-brand-dark sm:text-5xl md:text-6xl">
              Simple, transparent pricing.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-brand-dark/60 sm:text-lg md:text-xl">
              Choose the plan that fits your event orchestration needs.
              <br className="hidden md:block" />
              No hidden fees for organizers.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "rounded-full border border-brand-dark/20 px-4 py-2 text-sm font-semibold transition-colors",
                  billingCycle === "monthly" ? "bg-brand-dark text-brand-cream" : "bg-transparent text-brand-dark/60 hover:bg-brand-dark/10 hover:text-brand-dark"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("quarterly")}
                className={cn(
                  "rounded-full border border-brand-dark/20 px-4 py-2 text-sm font-semibold transition-colors",
                  billingCycle === "quarterly" ? "bg-brand-dark text-brand-cream" : "bg-transparent text-brand-dark/60 hover:bg-brand-dark/10 hover:text-brand-dark"
                )}
              >
                Quarterly{" "}
                <span className="ml-1 text-xs text-brand-teal">
                  (Save 10%)
                </span>
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={cn(
                  "rounded-full border border-brand-dark/20 px-4 py-2 text-sm font-semibold transition-colors",
                  billingCycle === "yearly" ? "bg-brand-dark text-brand-cream" : "bg-transparent text-brand-dark/60 hover:bg-brand-dark/10 hover:text-brand-dark"
                )}
              >
                Yearly{" "}
                <span className="ml-1 text-xs text-brand-teal">
                  (Save 20%)
                </span>
              </button>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-3 lg:items-center lg:gap-0">
            {plans.map((plan, index) => {
              const isDark = plan.theme === "dark";
              const priceValue = plan.price[billingCycle];

              return (
                <FadeIn
                  key={plan.id}
                  delay={index * 0.1}
                  className={cn("relative z-0", plan.popular && "z-10 lg:-mt-4 lg:-mb-4")}
                >
                  <div
                    className={cn(
                      "flex flex-col overflow-hidden rounded-[32px] p-8 transition-all duration-300 md:p-10",
                      isDark
                        ? "bg-brand-dark text-white shadow-2xl ring-1 ring-white/10 lg:scale-105"
                        : "bg-white text-brand-dark shadow-xl ring-1 ring-brand-dark/5 hover:-translate-y-1 hover:shadow-2xl"
                    )}
                  >
                    <div className="mb-8">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        {plan.popular && (
                          <span className="rounded-full bg-brand-teal px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                            Most Popular
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1">
                        {typeof priceValue === "number" ? (
                          <>
                            <span className="text-5xl font-bold tracking-tight">
                              ${priceValue}
                            </span>
                            <span
                              className={cn(
                                "text-sm font-medium",
                                isDark ? "text-white/60" : "text-brand-dark/40"
                              )}
                            >
                              /{billingCycle}
                            </span>
                          </>
                        ) : (
                          <span className="text-4xl font-bold tracking-tight">Custom</span>
                        )}
                      </div>
                      <p
                        className={cn(
                          "mt-4 text-sm leading-relaxed",
                          isDark ? "text-white/60" : "text-brand-dark/60"
                        )}
                      >
                        {plan.description}
                      </p>
                    </div>

                    <ul className="mb-8 flex-1 space-y-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          {feature.included ? (
                            <div
                              className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                                isDark ? "bg-brand-teal text-white" : "bg-brand-teal/10 text-brand-teal"
                              )}
                            >
                              <Check className="h-3 w-3" />
                            </div>
                          ) : (
                            <div
                              className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                                isDark ? "bg-white/10 text-white/20" : "bg-brand-dark/5 text-brand-dark/20"
                              )}
                            >
                              <X className="h-3 w-3" />
                            </div>
                          )}
                          <span
                            className={cn(
                              feature.included
                                ? isDark
                                  ? "text-white/90"
                                  : "text-brand-dark/90"
                                : isDark
                                  ? "text-white/30 line-through"
                                  : "text-brand-dark/30 line-through"
                            )}
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to={createPageUrl(plan.id === "enterprise" ? "Contact" : "AppEntry")}
                    >
                      <Button
                        className={cn(
                          "w-full rounded-full py-6 text-base font-bold shadow-lg transition-all hover:scale-[1.02]",
                          isDark
                            ? "bg-brand-teal text-white hover:bg-brand-teal/90"
                            : "bg-brand-dark text-white hover:bg-brand-dark/90"
                        )}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-t border-brand-dark/5 bg-white py-20">
        <Container>
          <FadeIn>
            <div className="relative overflow-hidden rounded-[32px] border border-brand-teal/20 bg-[#D9EDF0] p-8 text-center md:p-16">
              <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-brand-teal/10 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-brand-teal/10 blur-3xl" />

              <div className="relative z-10 mx-auto max-w-3xl">
                <Badge className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark shadow-sm">
                  <Buildings className="h-4 w-4 text-brand-teal" />
                  For Vendors & Venues
                </Badge>

                <h2 className="mb-6 text-3xl font-bold text-brand-dark md:text-4xl">
                  Are you a Venue Owner or Service Provider?
                </h2>

                <p className="mb-10 text-base leading-relaxed text-brand-dark/70 sm:text-lg">
                  Join our marketplace with{" "}
                  <span className="font-bold text-brand-dark">zero upfront cost</span>.
                  Our business model is designed to align with your success.
                </p>

                <div className="grid gap-6 text-left md:grid-cols-2">
                  <div className="rounded-2xl border border-white/50 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dark text-white">
                      <Sparkle className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-brand-dark">
                      No Subscription Fees
                    </h3>
                    <p className="text-sm text-brand-dark/60">
                      Listing your venue or services on Strathwell is completely free. No
                      monthly charges.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/50 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal text-white">
                      <Check className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-brand-dark">10% Success Fee</h3>
                    <p className="text-sm text-brand-dark/60">
                      We only earn when you get paid. A standard 10% commission applies to
                      confirmed bookings.
                    </p>
                  </div>
                </div>

                <div className="mt-10">
                  <Link to={`${createPageUrl("AppEntry")}?role=vendor`}>
                    <Button
                      variant="outline"
                      className="rounded-full border-brand-dark/20 px-8 py-6 text-brand-dark transition-all hover:border-brand-dark hover:bg-white hover:text-brand-dark"
                    >
                      Apply as a Vendor <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>
      <FaqSection subtitle="Find answers to common questions about Strathwell" />
      <section className="py-16 text-center bg-white">
        <Container>
          <FadeIn>
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-dark/5 text-brand-dark">
          <Question className="h-6 w-6" />
        </div>
        <h3 className="text-2xl font-bold text-brand-dark">Still have questions?</h3>
        <p className="mt-4 text-brand-dark/60">
          Our team is here to help you find the right plan for your organization.
        </p>
        <Link to={createPageUrl("Contact")}>
          <Button variant="link" className="mt-4 font-bold text-brand-teal">
            Contact Support &rarr;
          </Button>
        </Link>
          </FadeIn>
        </Container>
      </section>

        
    </div>
  );
}
