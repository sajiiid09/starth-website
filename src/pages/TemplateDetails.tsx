import React from "react";
import { Link, useParams } from "react-router-dom";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";
import { cn } from "@/lib/utils";
import { dummyTemplates } from "@/data/dummyTemplates";
import SpacePlannerSchematic from "@/components/os/SpacePlannerSchematic";
import { venues } from "@/data/venues";
import { venueLayouts, type LayoutMode } from "@/data/venueLayouts";
import {
  computeFitStatus,
  estimateRequiredSqft,
  suggestAdjustments,
  suggestAlternativeVenues
} from "@/utils/spaceFit";

const TemplateDetails: React.FC = () => {
  const { id } = useParams();
  const template = dummyTemplates.find((item) => item.id === id);
  const [layoutMode, setLayoutMode] = React.useState<LayoutMode>(
    template?.recommendedMode ?? "optimized"
  );
  const [showComparison, setShowComparison] = React.useState(false);
  const featuredVenue = venues.find((venue) => venue.id === template?.venueId) ?? venues[0];
  const layout =
    venueLayouts.find(
      (item) => item.venueId === featuredVenue.id && item.mode === layoutMode
    ) ?? venueLayouts.find((item) => item.venueId === featuredVenue.id);

  const initialGuestCount = React.useMemo(() => {
    if (template?.defaultGuestCount) {
      return template.defaultGuestCount;
    }
    const fromStats =
      template?.stats?.reduce((value, stat) => {
        if (value) {
          return value;
        }
        if (!/guest|attendee/i.test(stat.label)) {
          return value;
        }
        const parsed = Number.parseInt(stat.value.replace(/[^0-9]/g, ""), 10);
        return Number.isNaN(parsed) ? value : parsed;
      }, 0) ?? 0;
    return fromStats || layout?.guestRangeRecommended.min || 120;
  }, [layout?.guestRangeRecommended.min, template?.defaultGuestCount, template?.stats]);

  const [guestCount, setGuestCount] = React.useState(initialGuestCount);

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
          <div className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
                  Event OS Simulation
                </p>
                <div className="flex flex-wrap items-center gap-3 text-base font-semibold text-brand-dark">
                  <span>{featuredVenue.name}</span>
                  <span className="text-sm font-medium text-brand-dark/50">
                    {featuredVenue.sqft.toLocaleString()} sq ft · {featuredVenue.location}
                  </span>
                </div>
              </div>
              {layout && (
                <div className="flex flex-wrap items-center gap-3">
                  {(() => {
                    const requiredSqft = estimateRequiredSqft(
                      guestCount,
                      layoutMode,
                      layout.baselineInventory
                    );
                    const fitStatus = computeFitStatus(featuredVenue.sqft, requiredSqft);
                    const fitClasses =
                      fitStatus === "FIT"
                        ? "bg-brand-teal/15 text-brand-teal"
                        : fitStatus === "TIGHT"
                        ? "bg-brand-coral/15 text-brand-coral"
                        : "bg-brand-dark text-brand-light";
                    return (
                      <span
                        className={cn(
                          "rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
                          fitClasses
                        )}
                      >
                        {fitStatus}
                      </span>
                    );
                  })()}
                  <div className="text-sm font-semibold text-brand-dark">
                    {template.budget?.total} est.
                  </div>
                </div>
              )}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-brand-dark/10 bg-white px-3 py-2">
                <button
                  type="button"
                  onClick={() => setGuestCount((prev) => Math.max(10, prev - 10))}
                  className="h-8 w-8 rounded-full border border-brand-dark/10 text-sm font-semibold text-brand-dark/70 transition hover:border-brand-dark/30 hover:text-brand-dark"
                >
                  –
                </button>
                <span className="min-w-[120px] text-center text-sm font-semibold text-brand-dark">
                  {guestCount} guests
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setGuestCount((prev) =>
                      Math.min(template.maxGuestCount ?? prev + 10, prev + 10)
                    )
                  }
                  className="h-8 w-8 rounded-full border border-brand-dark/10 text-sm font-semibold text-brand-dark/70 transition hover:border-brand-dark/30 hover:text-brand-dark"
                >
                  +
                </button>
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
              </div>
            </div>
          </div>
        </FadeIn>

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
                  Space Transformation Plan
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

        {layout && (
          <FadeIn className="mt-10 rounded-3xl border border-white/40 bg-white/70 p-8 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
                  Inventory & Utilization
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-brand-dark">
                  Inventory optimizer
                </h2>
                <p className="mt-2 text-sm text-brand-dark/60">
                  Counts update as you adjust guest load and layout mode.
                </p>
              </div>
            </div>
            {(() => {
              const scalingFactor = Math.min(
                1.3,
                Math.max(
                  0.7,
                  guestCount / Math.max(layout.guestRangeRecommended.max, 1)
                )
              );
              const recommendedInventory = {
                chairs: Math.ceil(layout.baselineInventory.chairs * scalingFactor),
                tables: Math.max(6, Math.ceil(layout.baselineInventory.tables * scalingFactor)),
                stageModules: Math.max(2, Math.ceil(layout.baselineInventory.stageModules)),
                buffetStations: Math.max(1, Math.ceil(layout.baselineInventory.buffetStations)),
                cocktailTables: Math.max(
                  2,
                  Math.ceil(layout.baselineInventory.cocktailTables * scalingFactor)
                )
              };
              const requiredSqft = estimateRequiredSqft(
                guestCount,
                layoutMode,
                recommendedInventory
              );
              const fitStatus = computeFitStatus(featuredVenue.sqft, requiredSqft);
              const alternativeVenues =
                fitStatus === "OVER"
                  ? suggestAlternativeVenues(venues, requiredSqft)
                  : [];
              const adjustments =
                fitStatus === "OVER"
                  ? suggestAdjustments({
                      venueSqft: featuredVenue.sqft,
                      guestCount,
                      mode: layoutMode,
                      inventoryMix: recommendedInventory
                    })
                  : [];

              return (
                <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { label: "Chairs", value: recommendedInventory.chairs },
                      { label: "Tables", value: recommendedInventory.tables },
                      { label: "Stage Modules", value: recommendedInventory.stageModules },
                      { label: "Buffet Stations", value: recommendedInventory.buffetStations },
                      { label: "Cocktail Tables", value: recommendedInventory.cocktailTables }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/40 bg-white/80 px-4 py-3"
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-brand-dark/50">
                          {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-brand-dark">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/40 bg-white/80 px-4 py-4 text-sm text-brand-dark/70">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
                        Space utilization
                      </p>
                      <p className="mt-3 text-lg font-semibold text-brand-dark">
                        {requiredSqft.toLocaleString()} sq ft required
                      </p>
                      <p className="mt-2">
                        {fitStatus === "OVER"
                          ? "Current plan exceeds the venue footprint. Suggested pivots below."
                          : fitStatus === "TIGHT"
                          ? "This plan is tight. Expect closer seating and tighter circulation."
                          : "This configuration fits with comfortable circulation."}
                      </p>
                    </div>
                    {fitStatus === "OVER" && (
                      <div className="rounded-2xl border border-white/40 bg-white/80 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
                          Adjustments
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-brand-dark/70">
                          {adjustments.map((adjustment, index) => (
                            <li key={`${adjustment.type}-${index}`}>
                              {adjustment.type === "reduce-guest-count" &&
                                `Reduce guest count to ${adjustment.suggestedGuestCount}.`}
                              {adjustment.type === "reduce-stage-modules" &&
                                `Reduce stage modules to ${adjustment.suggestedStageModules}.`}
                              {adjustment.type === "reduce-tables" &&
                                `Reduce tables to ${adjustment.suggestedTables}.`}
                              {adjustment.type === "switch-mode" &&
                                `Switch to ${adjustment.suggestedMode} mode.`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {fitStatus === "OVER" && alternativeVenues.length > 0 && (
                      <div className="rounded-2xl border border-white/40 bg-white/80 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
                          Alternative venues
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-brand-dark/70">
                          {alternativeVenues.map((venue) => (
                            <li key={venue.id}>
                              {venue.name} · {venue.sqft.toLocaleString()} sq ft ·{" "}
                              {venue.location}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </FadeIn>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <FadeIn className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-card">
            <h2 className="text-2xl font-semibold text-brand-dark">Timeline & Dependencies</h2>
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
              <h2 className="text-2xl font-semibold text-brand-dark">Risk & Compliance</h2>
              <div className="mt-6 space-y-3 text-sm text-brand-dark/70">
                <p>
                  Venue notes: {featuredVenue.notes || "Standard safety protocols apply."}
                </p>
                <p>
                  Staffing buffer: add 10% for guest services, AV, and wayfinding.
                </p>
                <p>
                  Compliance: confirm load-in windows and fire-code occupancy before final
                  production.
                </p>
              </div>
            </FadeIn>

            <FadeIn className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-card">
              <h2 className="text-2xl font-semibold text-brand-dark">Vendor Coverage</h2>
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
              <h2 className="text-2xl font-semibold text-brand-dark">Budget Simulation</h2>
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
