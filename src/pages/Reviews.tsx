import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Container from "@/components/home-v2/primitives/Container";
import Section from "@/components/home-v2/primitives/Section";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH1 from "@/components/home-v2/primitives/DisplayH1";
import Lead from "@/components/home-v2/primitives/Lead";
import PillButton from "@/components/home-v2/primitives/PillButton";
import FadeIn from "@/components/animations/FadeIn";
import ReviewCard from "@/components/reviews/ReviewCard";
import { cn } from "@/lib/utils";

const reviews = [
  {
    name: "Lena Torres",
    role: "Organizer",
    company: "Helios Ventures",
    city: "San Francisco, CA",
    rating: 5,
    quote:
      "The concierge team kept every stakeholder aligned. We delivered on-time and under budget with zero last-minute chaos."
  },
  {
    name: "Marcus Lee",
    role: "Venue Owner",
    company: "Harborline Loft",
    city: "Boston, MA",
    rating: 5,
    quote:
      "Strathwell brings qualified leads and makes it effortless to coordinate walkthroughs, contracts, and production timelines."
  },
  {
    name: "Priya Rao",
    role: "Service Provider",
    company: "Lumina Catering",
    city: "Chicago, IL",
    rating: 5,
    quote:
      "We receive fully scoped requests and clear run-of-show notes, so our team can execute flawlessly."
  },
  {
    name: "Jordan Wells",
    role: "Organizer",
    company: "Northwind Summit",
    city: "Seattle, WA",
    rating: 5,
    quote:
      "I loved the level of detail in the proposal. Every vendor option had context and cost tradeoffs."
  },
  {
    name: "Camila Duarte",
    role: "Organizer",
    company: "Studio Eleven",
    city: "Austin, TX",
    rating: 5,
    quote:
      "We moved from kickoff to confirmed venue in 36 hours. The team orchestrated the entire pipeline."
  },
  {
    name: "Noah Kim",
    role: "Service Provider",
    company: "Signal AV",
    city: "New York, NY",
    rating: 5,
    quote:
      "The intake notes and on-site comms are clean and actionable. It feels like working with an in-house team."
  },
  {
    name: "Ariella Patel",
    role: "Venue Owner",
    company: "Grandview Hall",
    city: "Toronto, ON",
    rating: 5,
    quote:
      "We get well-qualified bookings and better alignment on load-in and staffing requirements."
  },
  {
    name: "Diego Morales",
    role: "Organizer",
    company: "Elevate Labs",
    city: "Denver, CO",
    rating: 5,
    quote:
      "Every milestone felt managed. The team handled vendor negotiations and kept our execs calm."
  },
  {
    name: "Samantha Zhou",
    role: "Service Provider",
    company: "Flora & Co.",
    city: "Miami, FL",
    rating: 5,
    quote:
      "We receive a clear style guide and execution timeline. It makes it easy to deliver premium installs."
  },
  {
    name: "Oliver Grant",
    role: "Venue Owner",
    company: "Summit Studios",
    city: "London, UK",
    rating: 5,
    quote:
      "The coordination is exceptional. We can staff confidently knowing the agenda has been verified."
  }
];

const filters = [
  { label: "All", active: true },
  { label: "Organizers", active: false },
  { label: "Venue Owners", active: false },
  { label: "Service Providers", active: false }
];

const Reviews: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-light text-brand-dark">
      <Section theme="cream">
        <Container>
          <FadeIn className="text-center">
            <Eyebrow theme="cream">Reviews</Eyebrow>
            <DisplayH1 theme="cream">Loved by planners & venues.</DisplayH1>
            <Lead theme="cream">
              Verified feedback from organizers, venue owners, and service providers who rely on
              Strathwell to orchestrate standout experiences.
            </Lead>
          </FadeIn>
        </Container>
      </Section>

      <Section theme="light">
        <Container>
          <div className="flex flex-col gap-10">
            <FadeIn className="flex flex-wrap justify-center gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition",
                    filter.active
                      ? "border-brand-dark bg-brand-dark text-brand-light"
                      : "border-brand-dark/20 bg-white text-brand-dark/70 hover:border-brand-dark/40"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </FadeIn>

            <FadeIn
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              staggerChildren={0.08}
              childSelector=".review-card"
            >
              {reviews.map((review) => (
                <ReviewCard key={review.name} {...review} className="review-card" />
              ))}
            </FadeIn>
          </div>
        </Container>
      </Section>

      <Section theme="blue">
        <Container>
          <FadeIn>
            <div className="rounded-3xl border border-white/50 bg-white/80 p-6 text-center shadow-card sm:p-10">
              <h2 className="text-2xl font-semibold text-brand-dark sm:text-3xl">
                See how teams orchestrate the impossible.
              </h2>
              <p className="mt-3 text-sm text-brand-dark/70 sm:mt-4">
                Dive deeper into our case studies to learn how we deliver premium event outcomes.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to={createPageUrl("CaseStudies")}>
                  <PillButton>Explore case studies</PillButton>
                </Link>
                <Link to={createPageUrl("DFY")}>
                  <PillButton variant="secondary">Plan with us</PillButton>
                </Link>
              </div>
            </div>
          </FadeIn>
        </Container>
      </Section>
    </div>
  );
};

export default Reviews;
