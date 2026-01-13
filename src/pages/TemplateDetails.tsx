import React from "react";
import { Link, useParams } from "react-router-dom";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";
import { cn } from "@/lib/utils";
import { dummyTemplates } from "@/data/dummyTemplates";
import SpacePlannerSchematic from "@/components/os/SpacePlannerSchematic";
import { venues } from "@/data/venues";
import { venueLayouts, type LayoutMode } from "@/data/venueLayouts";

const TemplateDetails: React.FC = () => {
  const { id } = useParams();
  const template = dummyTemplates.find((item) => item.id === id);
  const [layoutMode, setLayoutMode] = React.useState<LayoutMode>("optimized");
  const [showComparison, setShowComparison] = React.useState(false);
  const featuredVenue = venues[0];
  const layout =
    venueLayouts.find(
      (item) => item.venueId === featuredVenue.id && item.mode === layoutMode
    ) ?? venueLayouts.find((item) => item.venueId === featuredVenue.id);

  const guestCount =
    template?.stats?.reduce((value, stat) => {
      if (value) {
        return value;
      }
      if (!/guest|attendee/i.test(stat.label)) {
        return value;
      }
      const parsed = Number.parseInt(stat.value.replace(/[^0-9]/g, ""), 10);
      return Number.isNaN(parsed) ? value : parsed;
    }, 0) ||
    layout?.guestRangeRecommended.min ||
    120;

  if (!template) {
    return (
      <div className="pb-24 pt-12">
        <Container>
          <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-white/40 bg-white/70 px-6 py-16 text-center shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-teal">
              Blueprint not found
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-brand-dark md:text-4xl">
              This template has moved.
            </h1>
            <p className="mt-3 text-base text-brand-dark/70">
              Explore our full gallery of event blueprints to find the right fit for
              your next event.
            </p>
            <Link
              to="/templates"
              className="mt-6 inline-flex items-center rounded-full border border-brand-dark/20 px-5 py-2 text-sm font-medium text-brand-dark transition hover:border-brand-dark/40 hover:bg-brand-cream"
            >
              Back to Templates
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-10">
      <Container>
        <FadeIn>
          <Link
            to="/templates"
            className="inline-flex items-center text-sm font-semibold text-brand-teal"
          >
            ← Back to Templates
          </Link>
        </FadeIn>

        <FadeIn className="mt-6">
          <div className="grid gap-8 rounded-3xl border border-white/40 bg-white/70 p-8 shadow-card md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
                Blueprint Overview
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-brand-dark md:text-4xl">
                {template.title}
              </h1>
              <p className="mt-4 text-base text-brand-dark/70">
                {template.fullDetails}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {(template.stats || []).map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/40 bg-white/70 px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-dark/50">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-brand-dark">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center rounded-2xl border border-white/40 bg-brand-cream/60 p-6">
              <img
                src={template.image}
                alt={template.title}
                className="h-48 w-full object-contain"
              />
            </div>
          </div>
        </FadeIn>

        {layout && (
          <FadeIn className="mt-10 rounded-3xl border border-white/40 bg-white/70 p-8 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
                  Space blueprint
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-brand-dark">
                  Venue layout schematic
                </h2>
                <p className="mt-2 text-sm text-brand-dark/60">
                  Preview optimized vs. max layouts for a {guestCount}-guest
                  blueprint.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLayoutMode("optimized")}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition",
                    layoutMode === "optimized"
                      ? "border-brand-dark bg-brand-dark text-brand-light"
                      : "border-brand-dark/20 bg-white text-brand-dark/70 hover:border-brand-dark/40"
                  )}
                >
                  Optimized
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode("max")}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition",
                    layoutMode === "max"
                      ? "border-brand-dark bg-brand-dark text-brand-light"
                      : "border-brand-dark/20 bg-white text-brand-dark/70 hover:border-brand-dark/40"
                  )}
                >
                  Max
                </button>
                <button
                  type="button"
                  onClick={() => setShowComparison((prev) => !prev)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition",
                    showComparison
                      ? "border-brand-teal/50 bg-brand-teal/10 text-brand-teal"
                      : "border-brand-dark/20 bg-white text-brand-dark/70 hover:border-brand-dark/40"
                  )}
                >
                  Before / After
                </button>
              </div>
            </div>

            <div className="mt-6">
              {showComparison ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  <SpacePlannerSchematic
                    venue={featuredVenue}
                    layout={layout}
                    guestCount={guestCount}
                    inventory={layout.baselineInventory}
                    mode={layoutMode}
                    variant="before"
                  />
                  <SpacePlannerSchematic
                    venue={featuredVenue}
                    layout={layout}
                    guestCount={guestCount}
                    inventory={layout.baselineInventory}
                    mode={layoutMode}
                    variant="after"
                  />
                </div>
              ) : (
                <SpacePlannerSchematic
                  venue={featuredVenue}
                  layout={layout}
                  guestCount={guestCount}
                  inventory={layout.baselineInventory}
                  mode={layoutMode}
                  variant="after"
                />
              )}
            </div>
          </FadeIn>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <FadeIn className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-card">
            <h2 className="text-2xl font-semibold text-brand-dark">Timeline</h2>
            <div className="mt-6 space-y-5">
              {(template.timeline || []).map((item) => (
                <div key={item.time} className="flex gap-4">
                  <div className="flex min-w-[92px] items-start text-sm font-semibold text-brand-teal">
                    {item.time}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-brand-dark">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-brand-dark/70">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <div className="space-y-8">
            <FadeIn className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-card">
              <h2 className="text-2xl font-semibold text-brand-dark">Preferred Vendors</h2>
              <div className="mt-6 space-y-4">
                {(template.vendors || []).map((vendor) => (
                  <div
                    key={`${vendor.category}-${vendor.name}`}
                    className="rounded-2xl border border-white/40 bg-white/80 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-dark/50">
                      {vendor.category}
                    </p>
                    <p className="mt-2 text-base font-semibold text-brand-dark">
                      {vendor.name}
                    </p>
                    <p className="mt-1 text-sm text-brand-dark/70">{vendor.note}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-card">
              <h2 className="text-2xl font-semibold text-brand-dark">Budget</h2>
              <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/40 bg-white/80 px-4 py-3">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
                  Total Budget
                </p>
                <p className="text-lg font-semibold text-brand-dark">
                  {template.budget?.total}
                </p>
              </div>
              <div className="mt-5 space-y-3">
                {(template.budget?.breakdown || []).map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center justify-between rounded-2xl border border-white/40 bg-white/80 px-4 py-3",
                      "text-sm text-brand-dark/80"
                    )}
                  >
                    <span>{item.label}</span>
                    <span className="font-semibold text-brand-dark">
                      {item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TemplateDetails;
