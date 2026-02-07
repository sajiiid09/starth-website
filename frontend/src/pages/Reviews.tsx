import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Review } from "@/api/entities";
import Container from "@/components/home-v2/primitives/Container";
import Section from "@/components/home-v2/primitives/Section";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH1 from "@/components/home-v2/primitives/DisplayH1";
import Lead from "@/components/home-v2/primitives/Lead";
import PillButton from "@/components/home-v2/primitives/PillButton";
import FadeIn from "@/components/animations/FadeIn";
import ReviewCard from "@/components/reviews/ReviewCard";
import { cn } from "@/lib/utils";
import { SpinnerGap } from "@phosphor-icons/react";

type ReviewItem = {
  id: string;
  name: string;
  role: string;
  company: string;
  city: string;
  rating: number;
  quote: string;
};

const FILTER_OPTIONS = [
  { label: "All", value: "" },
  { label: "Organizers", value: "Organizer" },
  { label: "Venue Owners", value: "Venue Owner" },
  { label: "Service Providers", value: "Service Provider" }
] as const;

function normalizeReview(raw: Record<string, unknown>): ReviewItem {
  const data = (raw.data ?? raw) as Record<string, unknown>;
  return {
    id: String(raw.id ?? ""),
    name: String(data.reviewer_name ?? data.name ?? "Anonymous"),
    role: String(data.reviewer_role ?? data.role ?? ""),
    company: String(data.company ?? ""),
    city: String(data.city ?? ""),
    rating: Number(data.rating ?? 5),
    quote: String(data.comment ?? data.quote ?? ""),
  };
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const filters: Record<string, string> = {};
        if (activeFilter) {
          filters.role = activeFilter;
        }
        const result = await Review.filter(filters);
        const items = Array.isArray(result) ? result : [];
        setReviews(items.map(normalizeReview));
      } catch (error) {
        console.error("Failed to load reviews:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [activeFilter]);

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
              {FILTER_OPTIONS.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition",
                    activeFilter === filter.value
                      ? "border-brand-dark bg-brand-dark text-brand-light"
                      : "border-brand-dark/20 bg-white text-brand-dark/70 hover:border-brand-dark/40"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </FadeIn>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <SpinnerGap className="h-8 w-8 animate-spin text-brand-dark/40" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-brand-dark/50">No reviews found.</p>
              </div>
            ) : (
              <FadeIn
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                staggerChildren={0.08}
                childSelector=".review-card"
              >
                {reviews.map((review) => (
                  <ReviewCard key={review.id} {...review} className="review-card" />
                ))}
              </FadeIn>
            )}
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
