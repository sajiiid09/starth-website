import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  DollarSign,
  LayoutGrid,
  ShieldCheck,
  ShieldAlert,
  Users,
  Volume2,
  FileCheck,
  Building,
  Utensils,
  Sparkles,
  Radio
} from "lucide-react";
import { toast } from "sonner";
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

type BudgetSlice = {
  label: string;
  amount: string;
  value: number;
  percent: number;
  color: string;
};

const budgetColors = ["#1F2937", "#1FB6AA", "#F7B27D", "#6FB1FC"];

const parseCurrency = (value?: string) => {
  if (!value) {
    return 0;
  }
  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const TemplateDetails: React.FC = () => {
  const { id } = useParams();
  const template = dummyTemplates.find((item) => item.id === id);
  const [layoutMode, setLayoutMode] = React.useState<LayoutMode>(
    template?.recommendedMode ?? "optimized"
  );
  const [showComparison, setShowComparison] = React.useState(true);
  const [serviceTier, setServiceTier] = React.useState<"standard" | "premium">(
    "standard"
  );
  const featuredVenue =
    venues.find((venue) => venue.id === template?.venueId) ?? venues[0];
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

  const requiredSqft = layout
    ? estimateRequiredSqft(guestCount, layoutMode, layout.baselineInventory)
    : 0;
  const fitStatus = layout
    ? computeFitStatus(featuredVenue.sqft, requiredSqft)
    : "FIT";

  const totalBudgetValue = React.useMemo(
    () => parseCurrency(template?.budget?.total),
    [template?.budget?.total]
  );
  const resolvedBudgetTotal =
    totalBudgetValue || Math.round((guestCount || 120) * 350);
  const budgetTotalLabel =
    template?.budget?.total || `$${resolvedBudgetTotal.toLocaleString()}`;
  const costPerAttendee =
    resolvedBudgetTotal && guestCount
      ? Math.round(resolvedBudgetTotal / guestCount)
      : 0;

  const executionConfidence = React.useMemo(() => {
    if (fitStatus === "FIT") {
      return { percent: 85, label: "High" };
    }
    if (fitStatus === "TIGHT") {
      return { percent: 68, label: "Medium" };
    }
    return { percent: 45, label: "Low" };
  }, [fitStatus]);

  const spaceStatusLabel =
    fitStatus === "FIT" ? "Optimal flow" : fitStatus === "TIGHT" ? "Tight fit" : "Over capacity";
  const spaceStatusTone =
    fitStatus === "FIT"
      ? "bg-brand-teal/15 text-brand-teal"
      : fitStatus === "TIGHT"
      ? "bg-brand-coral/15 text-brand-coral"
      : "bg-brand-dark text-brand-light";

  const budgetSlices = React.useMemo<BudgetSlice[]>(() => {
    const breakdown = template?.budget?.breakdown ?? [];
    if (!breakdown.length) {
      const fallbackTotal = resolvedBudgetTotal || 52000;
      const fallbackItems = [
        { label: "Venue", percent: 35 },
        { label: "Food & beverage", percent: 33 },
        { label: "Production", percent: 18 },
        { label: "Decor & florals", percent: 14 }
      ];
      return fallbackItems.map((item, index) => ({
        label: item.label,
        amount: `$${Math.round((fallbackTotal * item.percent) / 100).toLocaleString()}`,
        value: Math.round((fallbackTotal * item.percent) / 100),
        percent: item.percent,
        color: budgetColors[index % budgetColors.length]
      }));
    }

    const parsed = breakdown.map((item) => ({
      ...item,
      value: parseCurrency(item.amount)
    }));
    const total = parsed.reduce((sum, item) => sum + item.value, 0) || resolvedBudgetTotal;
    const safeTotal = total || 1;

    return parsed.map((item, index) => ({
      label: item.label,
      amount: item.amount,
      value: item.value,
      percent: Math.round((item.value / safeTotal) * 100),
      color: budgetColors[index % budgetColors.length]
    }));
  }, [resolvedBudgetTotal, template?.budget?.breakdown]);

  const donutGradient = React.useMemo(() => {
    let start = 0;
    return budgetSlices
      .map((slice, index) => {
        const isLast = index === budgetSlices.length - 1;
        const end = isLast ? 100 : Math.min(100, start + slice.percent);
        const segment = `${slice.color} ${start}% ${end}%`;
        start = end;
        return segment;
      })
      .join(", ");
  }, [budgetSlices]);

  const vendorIconMap: Record<string, React.ElementType> = {
    Venue: Building,
    Catering: Utensils,
    Production: LayoutGrid,
    Entertainment: Sparkles,
    PR: Radio,
    Wellness: ShieldCheck,
    Facilitation: BadgeCheck
  };

  const serviceStack = React.useMemo(() => {
    const basePricing: Record<string, number> = {
      Venue: 18000,
      Catering: 22000,
      Entertainment: 9500,
      Production: 16000,
      PR: 8000,
      Wellness: 4500,
      Facilitation: 7200
    };

    return (template?.vendors ?? []).map((vendor, index) => {
      const base = basePricing[vendor.category] ?? 6000 + index * 1400;
      const multiplier = serviceTier === "premium" ? 1.25 : 1;
      const price = Math.round(base * multiplier);
      return {
        ...vendor,
        price: `$${price.toLocaleString()}`,
        tier: serviceTier === "premium" ? "Premium" : "Standard"
      };
    });
  }, [serviceTier, template?.vendors]);

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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
              <Link to="/templates" className="transition hover:text-brand-dark">
                Templates
              </Link>
              <ArrowRight className="h-3 w-3" />
              <span className="text-brand-dark/70">{template.title}</span>
            </div>
            <span className="rounded-full border border-brand-dark/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-dark/50">
              Blueprint detail
            </span>
          </div>
        </FadeIn>

        <FadeIn className="mt-5">
          <div className="grid gap-6 rounded-3xl border border-white/40 bg-white/80 p-6 shadow-card lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
                  {featuredVenue.name}
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-brand-dark md:text-4xl">
                  {template.title}
                </h1>
                <p className="mt-3 text-base text-brand-dark/70">
                  {template.description || template.fullDetails}
                </p>
                <p className="mt-3 text-sm text-brand-dark/60">
                  {template.fullDetails}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-brand-dark/60">
                <span className="flex items-center gap-2 rounded-full border border-brand-dark/10 bg-white px-3 py-1">
                  <LayoutGrid className="h-4 w-4 text-brand-dark/50" />
                  {featuredVenue.sqft.toLocaleString()} sq ft
                </span>
                <span className="flex items-center gap-2 rounded-full border border-brand-dark/10 bg-white px-3 py-1">
                  <Users className="h-4 w-4 text-brand-dark/50" />
                  {guestCount} guests
                </span>
                <span className="flex items-center gap-2 rounded-full border border-brand-dark/10 bg-white px-3 py-1">
                  <BadgeCheck className="h-4 w-4 text-brand-dark/50" />
                  {featuredVenue.location}
                </span>
              </div>
              <div className="rounded-2xl border border-white/40 bg-brand-cream/60 p-4">
                <img
                  src={template.image}
                  alt={template.title}
                  className="h-40 w-full object-contain"
                  loading="lazy"
                />
              </div>
              {template.stats && template.stats.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {template.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/40 bg-white/80 px-4 py-3"
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
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                {
                  label: "Est. total cost",
                  value: budgetTotalLabel,
                  icon: DollarSign
                },
                {
                  label: "Cost per attendee",
                  value: costPerAttendee ? `$${costPerAttendee.toLocaleString()}` : "—",
                  icon: Users
                },
                {
                  label: "Execution confidence",
                  value: `${executionConfidence.percent}% · ${executionConfidence.label}`,
                  icon: ShieldCheck
                }
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="flex items-center gap-4 rounded-2xl border border-white/60 bg-white/90 px-4 py-4 shadow-soft"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-dark/10 bg-brand-cream/60">
                    <kpi.icon className="h-5 w-5 text-brand-dark" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-dark/50">
                      {kpi.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-brand-dark">
                      {kpi.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/40 bg-white/70 px-5 py-4 shadow-card">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
                  spaceStatusTone
                )}
              >
                {spaceStatusLabel}
              </span>
              <span className="text-sm font-semibold text-brand-dark">
                {budgetTotalLabel} est.
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
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

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {layout && (
            <FadeIn className="lg:col-start-1 lg:row-start-1">
              <div className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
                      Space Transformation
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-brand-dark">
                      Blueprint layout simulation
                    </h2>
                    <p className="mt-2 text-sm text-brand-dark/60">
                      Visualize the raw shell and the structured layout built for this
                      guest load.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
                        spaceStatusTone
                      )}
                    >
                      {spaceStatusLabel}
                    </span>
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

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  {showComparison && (
                    <div className="rounded-2xl border border-white/40 bg-white/80 p-4">
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
                        <span>Before: empty shell</span>
                        <span>Raw space · {featuredVenue.sqft.toLocaleString()} sq ft</span>
                      </div>
                      <div className="mt-4">
                        <SpacePlannerSchematic
                          venue={featuredVenue}
                          layout={layout}
                          guestCount={guestCount}
                          inventory={layout.baselineInventory}
                          mode={layoutMode}
                          variant="before"
                        />
                      </div>
                    </div>
                  )}
                  <div className="rounded-2xl border border-white/40 bg-white/80 p-4">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
                      <span>After: structured layout</span>
                      <span>{layoutMode === "optimized" ? "Optimized" : "Max"} mode</span>
                    </div>
                    <div className="mt-4">
                      <SpacePlannerSchematic
                        venue={featuredVenue}
                        layout={layout}
                        guestCount={guestCount}
                        inventory={layout.baselineInventory}
                        mode={layoutMode}
                        variant="after"
                      />
                    </div>
                  </div>
                </div>

                {(() => {
                  const scalingFactor = Math.min(
                    1.3,
                    Math.max(0.7, guestCount / Math.max(layout.guestRangeRecommended.max, 1))
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
                    <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          { label: "Chairs", value: recommendedInventory.chairs },
                          { label: "Tables", value: recommendedInventory.tables },
                          { label: "Stage modules", value: recommendedInventory.stageModules },
                          { label: "Cocktail tables", value: recommendedInventory.cocktailTables }
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-2xl border border-white/40 bg-white/90 px-4 py-3"
                          >
                            <p className="text-xs uppercase tracking-[0.2em] text-brand-dark/50">
                              {item.label}
                            </p>
                            <p className="mt-2 text-xl font-semibold text-brand-dark">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <div className="rounded-2xl border border-white/40 bg-white/90 px-4 py-4 text-sm text-brand-dark/70">
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
                        {(adjustments.length > 0 || alternativeVenues.length > 0) && (
                          <div className="rounded-2xl border border-white/40 bg-white/90 px-4 py-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
                              Suggested fixes
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
                              {alternativeVenues.slice(0, 2).map((venue) => (
                                <li key={venue.id}>
                                  Consider {venue.name} ({venue.sqft.toLocaleString()} sq ft)
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm text-brand-dark/70">
                  <span>
                    Layout logic keeps sightlines clear and optimizes circulation for the
                    flow of this blueprint.
                  </span>
                  <button
                    type="button"
                    onClick={() => toast.success("Layout approved. We'll lock the schematic.")}
                    className="rounded-full bg-brand-dark px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-light transition hover:bg-brand-dark/90"
                  >
                    Approve layout
                  </button>
                </div>
              </div>
            </FadeIn>
          )}

          <FadeIn className="lg:col-start-2 lg:row-start-1">
            <div className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
                    Service Stack
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-brand-dark">
                    Vendor coverage
                  </h2>
                  <p className="mt-2 text-sm text-brand-dark/60">
                    Toggle between standard and premium vendor mixes.
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-brand-dark/10 bg-white p-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  <button
                    type="button"
                    onClick={() => setServiceTier("standard")}
                    className={cn(
                      "rounded-full px-3 py-1",
                      serviceTier === "standard"
                        ? "bg-brand-dark text-brand-light"
                        : "text-brand-dark/60"
                    )}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceTier("premium")}
                    className={cn(
                      "rounded-full px-3 py-1",
                      serviceTier === "premium"
                        ? "bg-brand-dark text-brand-light"
                        : "text-brand-dark/60"
                    )}
                  >
                    Premium
                  </button>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {serviceStack.map((vendor) => {
                  const Icon = vendorIconMap[vendor.category] ?? Building;
                  return (
                    <div
                      key={`${vendor.category}-${vendor.name}`}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/40 bg-white/90 px-4 py-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-brand-dark/10 bg-brand-cream/60">
                          <Icon className="h-5 w-5 text-brand-dark" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-brand-dark/50">
                            {vendor.category}
                          </p>
                          <p className="mt-1 text-base font-semibold text-brand-dark">
                            {vendor.name}
                          </p>
                          <p className="text-sm text-brand-dark/60">{vendor.note}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/40">
                          {vendor.tier}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-brand-dark">
                          {vendor.price}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          <FadeIn className="lg:col-start-2 lg:row-start-2">
            <div className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
                    Budget Simulation
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-brand-dark">
                    Spend distribution
                  </h2>
                </div>
                <span className="rounded-full border border-brand-dark/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
                  Total estimated: {budgetTotalLabel}
                </span>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/40 bg-white/90 px-4 py-6">
                  <div
                    className="relative h-36 w-36 rounded-full"
                    style={{ background: `conic-gradient(${donutGradient})` }}
                  >
                    <div className="absolute inset-4 rounded-full bg-white/90 shadow-soft" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-brand-dark/50">
                      Total
                    </p>
                    <p className="mt-1 text-lg font-semibold text-brand-dark">
                      {budgetTotalLabel}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {budgetSlices.map((slice) => (
                    <div
                      key={slice.label}
                      className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/90 px-4 py-3 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: slice.color }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-brand-dark">
                            {slice.label}
                          </p>
                          <p className="text-xs text-brand-dark/50">
                            {slice.percent}% of budget
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-brand-dark">
                        {slice.amount}
                      </span>
                    </div>
                  ))}
                  <div className="rounded-2xl border border-brand-teal/30 bg-brand-teal/10 px-4 py-4 text-sm text-brand-dark/70">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-teal">
                      Trade-off idea
                    </p>
                    <p className="mt-2">
                      Swap to a condensed AV package and save approximately $4,000 while
                      keeping stage moments intact.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn className="lg:col-start-1 lg:row-start-2">
            <div className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
                Risk & Compliance
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-brand-dark">
                Safety signals
              </h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {[
                  {
                    label: "Insurance required",
                    detail: "COI pending upload",
                    icon: ShieldAlert
                  },
                  {
                    label: "Noise limit",
                    detail: "90dB after 10 PM",
                    icon: Volume2
                  },
                  {
                    label: "Capacity cap",
                    detail: `${featuredVenue.capacity} max`,
                    icon: Users
                  },
                  {
                    label: "Permit check",
                    detail: "Load-in clearance",
                    icon: FileCheck
                  }
                ].map((chip) => (
                  <div
                    key={chip.label}
                    className="flex items-center gap-3 rounded-full border border-white/40 bg-white/90 px-4 py-2 text-sm text-brand-dark/70"
                  >
                    <chip.icon className="h-4 w-4 text-brand-dark/50" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
                        {chip.label}
                      </p>
                      <p className="text-sm font-medium text-brand-dark/70">
                        {chip.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm text-brand-dark/60">
                Venue notes: {featuredVenue.notes || "Standard safety protocols apply."}
              </p>
            </div>
          </FadeIn>

          <FadeIn className="lg:col-start-1 lg:row-start-3">
            <div className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
                Timeline & Dependencies
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-brand-dark">
                Critical moments
              </h2>
              <div className="mt-6 space-y-5">
                {(template.timeline || []).map((item, index) => (
                  <div key={item.time} className="flex gap-4">
                    <div className="flex min-w-[110px] items-start gap-2 text-sm font-semibold text-brand-teal">
                      <Clock className="mt-1 h-4 w-4" />
                      {item.time}
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-brand-dark">
                          {item.title}
                        </p>
                        <span className="rounded-full border border-brand-dark/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
                          {index % 2 === 0 ? "Delay risk" : "Vendor hold"}
                        </span>
                      </div>
                      <p className="text-sm text-brand-dark/70">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </div>
  );
};

export default TemplateDetails;
