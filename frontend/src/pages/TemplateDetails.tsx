import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  SealCheck,
  Clock,
  CurrencyDollar,
  SquaresFour,
  ShieldCheck,
  ShieldWarning,
  Users,
  SpeakerHigh,
  Buildings,
  ForkKnife,
  Sparkle,
  Broadcast,
  SpinnerGap
} from "@phosphor-icons/react";
import { toast } from "sonner";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";
import { cn } from "@/lib/utils";
import { dummyTemplates } from "@/data/dummyTemplates";
import type { DummyTemplate } from "@/data/dummyTemplates";
import { fetchTemplateById } from "@/api/templates";
import SpacePlannerSchematic from "@/components/os/SpacePlannerSchematic";
import TemplateGallery from "@/components/templates/detail/TemplateGallery";
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
const defaultGalleryImages = [
  "https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=80"
];

const parseCurrency = (value?: string) => {
  if (!value) {
    return 0;
  }
  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const TemplateDetails: React.FC = () => {
  const { id } = useParams();
  const [template, setTemplate] = React.useState<DummyTemplate | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchTemplateById(id)
      .then((item) => {
        if (cancelled) return;
        // Fall back to dummyTemplates if API returns nothing (e.g. old slug-based IDs)
        setTemplate(item ?? dummyTemplates.find((t) => t.id === id));
      })
      .catch(() => {
        if (!cancelled) setTemplate(dummyTemplates.find((t) => t.id === id));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const [layoutMode, setLayoutMode] = React.useState<LayoutMode>("optimized");
  React.useEffect(() => {
    if (template?.recommendedMode) setLayoutMode(template.recommendedMode);
  }, [template?.recommendedMode]);
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
    Venue: Buildings,
    Catering: ForkKnife,
    Production: SquaresFour,
    Entertainment: Sparkle,
    PR: Broadcast,
    Wellness: ShieldCheck,
    Facilitation: SealCheck
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

  if (loading) {
    return (
      <div className="pb-24 pt-12">
        <Container>
          <div className="flex justify-center py-20">
            <SpinnerGap className="h-8 w-8 animate-spin text-brand-teal" />
          </div>
        </Container>
      </div>
    );
  }

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
    <div className="pb-24 pt-10 bg-[#F8F7F4] min-h-screen">
      <Container>
        {/* Breadcrumb & Header */}
        <FadeIn>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
              <Link to="/templates" className="transition hover:text-brand-dark">
                Templates
              </Link>
              <ArrowRight className="h-3 w-3" />
              <span className="text-brand-dark/70">{template.title}</span>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-8">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal mb-2">
                  Blueprint Detail
                </p>
                <h1 className="text-3xl font-bold text-brand-dark md:text-4xl">
                  {template.title}
                </h1>
                <p className="mt-4 text-base text-brand-dark/70 leading-relaxed">
                  {template.fullDetails || template.description}
                </p>
              </div>

              {/* KPI Stats */}
              <div className="grid w-full gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Est. Total Cost",
                    value: budgetTotalLabel,
                    icon: CurrencyDollar
                  },
                  {
                    label: "Cost per Attendee",
                    value: costPerAttendee ? `$${costPerAttendee.toLocaleString()}` : "—",
                    icon: Users
                  },
                  {
                    label: "Execution Confidence",
                    value: `${executionConfidence.percent}% - ${executionConfidence.label}`,
                    valueColor: executionConfidence.percent > 80 ? "text-brand-teal" : "text-brand-dark",
                    icon: ShieldCheck
                  }
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="flex flex-col justify-center rounded-2xl bg-white px-5 py-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <kpi.icon className="h-3.5 w-3.5 text-brand-dark/40" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/40">
                        {kpi.label}
                      </p>
                    </div>
                    <p className={cn("text-lg font-bold", kpi.valueColor || "text-brand-dark")}>
                      {kpi.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.05} className="mt-10">
          <TemplateGallery
            title="Blueprint Reference Gallery"
            images={template.images ?? defaultGalleryImages}
            templateTitle={template.title}
          />
        </FadeIn>

        {/* Main Grid: Space & Service Stack */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          
          {/* Left Column: Space Transformation */}
          <FadeIn delay={0.1}>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-brand-dark">Space Transformation</h3>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-brand-teal/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                    <Sparkle className="h-3 w-3" />
                    Optimal Flow
                  </span>
                </div>
              </div>

              {layout ? (
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-brand-dark/5">
                  <div className="grid gap-4 items-center mb-6 md:grid-cols-[1fr_auto_1fr]">
                    {/* Before View */}
                    <div className="flex flex-col gap-3">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">BEFORE: EMPTY SHELL</p>
                       <div className="relative overflow-hidden rounded-xl bg-[#F8F7F4] p-2 border border-brand-dark/5">
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

                    {/* Arrow */}
                    <div className="mt-6 hidden text-brand-teal/50 md:block">
                      <ArrowRight className="h-5 w-5" />
                    </div>

                    {/* After View */}
                    <div className="flex flex-col gap-3">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">AFTER: STRUCTURED LAYOUT</p>
                       <div className="relative overflow-hidden rounded-xl bg-brand-teal/5 p-2 border border-brand-teal/20 shadow-sm">
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
                  
                  <div>
                    <p className="text-sm text-brand-dark/60 leading-relaxed mb-6">
                      This layout prioritizes clear sightlines for the {template.title} while separating 
                      high-noise catering zones from the main presentation area. Allows for 15% 
                      overflow capacity without compromising egress routes.
                    </p>
                    <button className="w-full rounded-xl bg-brand-teal py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99]">
                      Approve Layout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl bg-white p-12 text-center text-brand-dark/50">
                  Visual layout not available for this venue.
                </div>
              )}
            </div>
          </FadeIn>

          {/* Right Column: Service Stack */}
          <FadeIn delay={0.2}>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-brand-dark">Service Stack</h3>
                <div className="flex rounded-full bg-white p-1 shadow-sm border border-brand-dark/5">
                  <button
                    onClick={() => setServiceTier("standard")}
                    className={cn(
                      "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                      serviceTier === "standard" ? "bg-brand-dark text-white" : "text-brand-dark/60 hover:text-brand-dark"
                    )}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setServiceTier("premium")}
                    className={cn(
                      "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                      serviceTier === "premium" ? "bg-brand-dark text-white" : "text-brand-dark/60 hover:text-brand-dark"
                    )}
                  >
                    Premium
                  </button>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm border border-brand-dark/5 space-y-6">
                <p className="text-xs text-brand-dark/50">Required vendors for this blueprint</p>
                
                {serviceStack.map((vendor) => {
                  const Icon = vendorIconMap[vendor.category] || Buildings;
                  return (
                    <div key={vendor.name} className="flex gap-4">
                      <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-brand-dark/5 flex items-center justify-center">
                        <SealCheck className="h-3.5 w-3.5 text-brand-dark/40" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-brand-dark">{vendor.category}</p>
                          <span className="text-xs font-semibold text-brand-dark/40">$$</span>
                        </div>
                        <p className="text-sm text-brand-dark/80">{vendor.name}</p>
                        <p className="text-xs text-brand-dark/50 mt-1">{vendor.note}</p>
                      </div>
                    </div>
                  );
                })}

                <div className="flex gap-4 opacity-60">
                   <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full border border-brand-dark/20 flex items-center justify-center">
                   </div>
                   <div>
                     <p className="text-sm font-bold text-brand-dark">Security</p>
                     <p className="text-xs text-brand-dark/50 mt-1">Optional but recommended for &gt;100 guests</p>
                   </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Risk & Compliance */}
        <FadeIn delay={0.3} className="mt-12">
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold text-brand-dark">Risk & Compliance</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Insurance Required", desc: "Liability series pending upload.", icon: ShieldWarning, color: "bg-red-50 text-red-600 border-red-100" },
                { title: "Noise Limit", desc: "Venue cap: 90dB after 10 PM.", icon: SpeakerHigh, color: "bg-amber-50 text-amber-600 border-amber-100" },
                { title: "Capacity Cap", desc: "Max occupancy: 350 per SFM.", icon: Users, color: "bg-orange-50 text-orange-600 border-orange-100" }
              ].map((item) => (
                <div key={item.title} className={cn("flex items-start gap-3 rounded-2xl border p-4", item.color)}>
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="text-xs opacity-80 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Timeline & Budget Grid */}
        <div className="mt-12 grid gap-12 lg:grid-cols-2">
           {/* Timeline */}
           <FadeIn delay={0.4}>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-brand-dark">Timeline & Dependencies</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Execution Plan</span>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-sm border border-brand-dark/5 relative">
                <div className="absolute left-8 top-8 bottom-8 w-px bg-brand-dark/10" />
                <div className="space-y-8 relative z-10">
                  {(template.timeline || []).map((event, i) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="w-2 h-2 rounded-full bg-brand-teal ring-4 ring-white mt-1.5 flex-shrink-0" />
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">{event.time}</span>
                          {i === 0 && <span className="rounded-full bg-brand-teal/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-brand-teal">Start</span>}
                        </div>
                        <p className="font-bold text-brand-dark mt-1">{event.title}</p>
                        <p className="text-sm text-brand-dark/60 mt-1">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Budget Simulation */}
          <FadeIn delay={0.5}>
            <div className="flex flex-col gap-6">
               <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-brand-dark">Budget Simulation</h3>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark/40">Total Estimated</p>
                  <p className="text-lg font-bold text-brand-dark">{budgetTotalLabel}</p>
                </div>
              </div>

              <div className="flex gap-6 rounded-3xl bg-white p-8 shadow-sm border border-brand-dark/5">
                {/* Donut Chart Visual */}
                <div className="relative h-40 w-40 flex-shrink-0 flex items-center justify-center">
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{ background: `conic-gradient(${donutGradient})`, maskImage: "radial-gradient(transparent 55%, black 56%)", WebkitMaskImage: "radial-gradient(transparent 55%, black 56%)" }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-brand-teal">$</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-brand-dark/60">Optimal</span>
                  </div>
                </div>

                {/* Breakdown List */}
                <div className="flex-1 space-y-3">
                  {budgetSlices.map((slice) => (
                    <div key={slice.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: slice.color }} />
                        <span className="font-medium text-brand-dark">{slice.label}</span>
                      </div>
                      <span className="font-bold text-brand-dark/60">{slice.percent}%</span>
                    </div>
                  ))}

                  <div className="mt-4 rounded-xl bg-yellow-50 p-3 border border-yellow-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-700 mb-1">Trade-off Available</p>
                    <p className="text-xs text-yellow-800 leading-snug">
                      Downgrade AV Package to save $4,000 for upgraded catering options.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </div>
  );
};

export default TemplateDetails;
