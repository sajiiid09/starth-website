import React from "react";
import { CurrencyCircleDollar, Gauge, Lock, Wallet, Calendar, Package } from "@phosphor-icons/react";
import { PlannerState } from "@/features/planner/types";
import { cn } from "@/lib/utils";

type PlanPreviewHighlightSection =
  | "overview"
  | "kpis"
  | "venue"
  | "inventory"
  | "timeline"
  | "budget";

type PlanPreviewCanvasProps = {
  planData: PlannerState | null;
  highlightSection?: PlanPreviewHighlightSection;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const donutColors = ["#0f766e", "#14b8a6", "#3b82f6", "#8b5cf6", "#64748b"];

const BudgetDonut: React.FC<{ breakdown: PlannerState["budget"]["breakdown"] }> = ({
  breakdown
}) => {
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const totalPct = Math.max(1, breakdown.reduce((sum, item) => sum + item.pct, 0));

  let accumulated = 0;
  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
        {breakdown.map((entry, index) => {
          const pctNormalized = entry.pct / totalPct;
          const segmentLength = pctNormalized * circumference;
          // Adding a small gap between segments for a modern look
          const gap = 2; 
          const dashOffset = circumference - accumulated;
          accumulated += segmentLength;

          return (
            <circle
              key={`${entry.label}-${index}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={donutColors[index % donutColors.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength - gap} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-semibold uppercase tracking-tighter text-slate-400">Total</span>
        <span className="text-sm font-semibold text-slate-900">Budget</span>
      </div>
    </div>
  );
};

const PlanPreviewCanvas: React.FC<PlanPreviewCanvasProps> = ({
  planData,
  highlightSection
}) => {
  if (!planData) {
    return <aside className="h-full min-h-0 bg-slate-50/50" aria-label="Canvas preview panel" />;
  }

  const hasTimelineEntries = planData.timeline.length > 0;
  const hasBudgetBreakdown = planData.budget.breakdown.length > 0;

  return (
    <aside className="h-full min-h-0 overflow-y-auto overscroll-y-contain bg-slate-50/30 pb-10" aria-label="Canvas preview panel">
      {/* Sticky Glass Header */}
      <header
        id="canvas-overview"
        className={cn(
          "sticky top-0 z-20 border-b border-slate-200/60 bg-white/80 px-6 py-5 backdrop-blur-xl transition-colors duration-500",
          highlightSection === "overview" && "bg-brand-teal/5"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-teal animate-pulse" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Live Blueprint
              </p>
            </div>
            <h2 className="mt-1 truncate text-xl font-semibold tracking-tight text-slate-900">{planData.title}</h2>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{planData.summary}</p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
            <Lock weight="fill" className="h-3 w-3 text-brand-teal/60" />
            AI Managed
          </div>
        </div>
      </header>

      <div className="space-y-6 p-6">
        {/* KPI Grid - Glass Effect */}
        <section
          id="canvas-kpis"
          className={cn(
            "grid grid-cols-3 gap-3 rounded-2xl transition-all duration-500",
            highlightSection === "kpis" && "ring-2 ring-brand-teal/20 ring-offset-4"
          )}
        >
          {[
            { label: "Total Cost", value: currencyFormatter.format(planData.kpis.totalCost), icon: Wallet },
            { label: "Per Attendee", value: currencyFormatter.format(planData.kpis.costPerAttendee), icon: CurrencyCircleDollar },
            { label: "Confidence", value: `${planData.kpis.confidencePct}%`, icon: Gauge },
          ].map((kpi, i) => (
            <article key={i} className="group relative overflow-hidden rounded-2xl border border-white bg-white/60 p-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 group-hover:text-brand-teal transition-colors">
                <kpi.icon weight="duotone" className="h-4 w-4" />
                {kpi.label}
              </div>
              <p className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                {kpi.value}
              </p>
            </article>
          ))}
        </section>

        {/* Space & Inventory */}
        <section
          id="canvas-inventory"
          className={cn(
            "space-y-4 rounded-[24px] border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-500",
            highlightSection === "inventory" && "border-brand-teal/30 bg-brand-teal/5"
          )}
        >
          <div className="flex items-center gap-2">
            <Package weight="duotone" className="h-5 w-5 text-brand-teal" />
            <h3 className="text-sm font-semibold text-slate-900">Logistics & Inventory</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Baseline State</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{planData.spacePlan.beforeLabel}</p>
            </div>
            <div className="rounded-xl border border-brand-teal/10 bg-brand-teal/5 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-teal/60">Optimized Layout</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{planData.spacePlan.afterLabel}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Object.entries(planData.spacePlan.inventory).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs shadow-sm">
                <span className="capitalize font-medium text-slate-500">{key}</span>
                <span className="font-semibold text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline - Roadmap Style */}
        <section
          id="canvas-timeline"
          className={cn(
            "space-y-4 rounded-[24px] border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-500",
            highlightSection === "timeline" && "border-brand-teal/30 bg-brand-teal/5"
          )}
        >
          <div className="flex items-center gap-2">
            <Calendar weight="duotone" className="h-5 w-5 text-brand-teal" />
            <h3 className="text-sm font-semibold text-slate-900">Execution Timeline</h3>
          </div>
          
          {hasTimelineEntries && (
            <div className="relative ml-2 space-y-6 border-l-2 border-slate-100 pl-6">
              {planData.timeline.map((item, index) => (
                <article key={index} className="relative">
                  <span className="absolute -left-[1.95rem] top-1 h-4 w-4 rounded-full border-4 border-white bg-brand-teal shadow-sm" />
                  <p className="text-xs font-semibold text-slate-900">
                    {item.time} — <span className="text-brand-teal font-semibold">{item.title}</span>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.notes}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Budget Simulation */}
        <section
          id="canvas-budget"
          className={cn(
            "rounded-[24px] border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-500",
            highlightSection === "budget" && "border-brand-teal/30 bg-brand-teal/5"
          )}
        >
          <h3 className="mb-6 text-sm font-semibold text-slate-900">Financial Orchestration</h3>
          {hasBudgetBreakdown && (
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
              <BudgetDonut breakdown={planData.budget.breakdown} />
              
              <div className="w-full flex-1 space-y-3">
                {planData.budget.breakdown.map((item, index) => (
                  <div key={item.label} className="group flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-2.5 w-2.5 rounded-full shadow-sm"
                        style={{ backgroundColor: donutColors[index % donutColors.length] }}
                      />
                      <span className="font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{item.label}</span>
                    </div>
                    <span className="font-semibold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md">{item.pct}%</span>
                  </div>
                ))}
                
                <div className="mt-6 space-y-3 pt-4 border-t border-slate-50">
                   <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Calculated Total</span>
                    <span className="text-sm font-semibold text-brand-teal">{currencyFormatter.format(planData.budget.total)}</span>
                  </div>
                  {planData.budget.tradeoffNote && (
                    <div className="rounded-xl bg-amber-50/50 border border-amber-100/50 px-4 py-3">
                      <p className="text-[11px] leading-relaxed text-amber-800 font-medium italic">
                        &ldquo;{planData.budget.tradeoffNote}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </aside>
  );
};

export default PlanPreviewCanvas;