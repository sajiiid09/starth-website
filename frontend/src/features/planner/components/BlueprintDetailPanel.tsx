import React from "react";
import { CheckCircle2, CircleDollarSign, Gauge, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlannerState } from "@/features/planner/types";

type BlueprintChangedSections = {
  header?: boolean;
  kpis?: boolean;
  inventory?: boolean;
  timeline?: boolean;
  budget?: boolean;
};

type BlueprintDetailPanelProps = {
  plannerState: PlannerState;
  plannerStateUpdatedAt?: number;
  changedSections?: BlueprintChangedSections;
  onApproveLayout?: () => void;
  heightClass?: string;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const statusStyles: Record<
  PlannerState["status"],
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "border border-slate-200 bg-slate-100 text-slate-700"
  },
  ready_for_review: {
    label: "Ready for review",
    className: "border border-amber-200 bg-amber-50 text-amber-700"
  },
  approved: {
    label: "Approved",
    className: "border border-emerald-200 bg-emerald-50 text-emerald-700"
  }
};

const donutColors = ["#0f766e", "#1d4ed8", "#ea580c", "#9333ea", "#475569"];

const formatUpdatedLabel = (timestamp?: number) => {
  if (!timestamp) return "Not updated yet";

  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return "Updated just now";
  if (seconds < 60) return `Updated ${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Updated ${minutes}m ago`;
  return `Updated ${new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
};

const BudgetDonut: React.FC<{ breakdown: PlannerState["budget"]["breakdown"] }> = ({
  breakdown
}) => {
  const size = 144;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const totalPct = Math.max(
    1,
    breakdown.reduce((sum, item) => sum + item.pct, 0)
  );

  let accumulated = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={strokeWidth}
      />
      {breakdown.map((entry, index) => {
        const pctNormalized = entry.pct / totalPct;
        const segmentLength = pctNormalized * circumference;
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
            strokeDasharray={`${segmentLength} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
          />
        );
      })}
    </svg>
  );
};

const BlueprintDetailPanel: React.FC<BlueprintDetailPanelProps> = ({
  plannerState,
  plannerStateUpdatedAt,
  changedSections,
  onApproveLayout,
  heightClass = "h-[72vh] min-h-[520px]"
}) => {
  const status = statusStyles[plannerState.status];
  const isApproved = plannerState.status === "approved";

  return (
    <aside
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${heightClass}`}
    >
      <header
        className={`sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur transition-colors duration-700 ${
          changedSections?.header ? "bg-brand-teal/5" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Blueprint Detail
            </p>
            <h2 className="mt-1 truncate text-lg font-semibold text-slate-900">
              {plannerState.title}
            </h2>
            <p className="mt-1 line-clamp-2 text-xs text-slate-600">{plannerState.summary}</p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              {formatUpdatedLabel(plannerStateUpdatedAt)}
            </p>
          </div>
          <Badge variant="secondary" className={status.className}>
            {status.label}
          </Badge>
        </div>
        <Button
          className="mt-3 h-9 w-full rounded-xl bg-brand-teal text-white hover:bg-brand-teal/90 disabled:bg-emerald-600 disabled:text-white disabled:opacity-100"
          onClick={onApproveLayout}
          disabled={isApproved}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {isApproved ? "Approved" : "Approve layout"}
        </Button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <section
          className={`grid grid-cols-3 gap-2 rounded-2xl p-1 transition-colors duration-700 ${
            changedSections?.kpis ? "bg-brand-teal/5" : ""
          }`}
        >
          <article className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">
              <WalletCards className="h-3.5 w-3.5" />
              Total Cost
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {currencyFormatter.format(plannerState.kpis.totalCost)}
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">
              <CircleDollarSign className="h-3.5 w-3.5" />
              Cost / Attendee
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {currencyFormatter.format(plannerState.kpis.costPerAttendee)}
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">
              <Gauge className="h-3.5 w-3.5" />
              Confidence
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {plannerState.kpis.confidencePct}%
            </p>
          </article>
        </section>

        <section
          className={`space-y-3 rounded-2xl border border-slate-200 p-4 transition-colors duration-700 ${
            changedSections?.inventory ? "bg-brand-teal/5" : "bg-slate-50/60"
          }`}
        >
          <h3 className="text-sm font-semibold text-slate-900">Space Transformation</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Before</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {plannerState.spacePlan.beforeLabel}
              </p>
            </div>
            <div className="rounded-xl border border-brand-teal/20 bg-white p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-brand-teal">After</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {plannerState.spacePlan.afterLabel}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(plannerState.spacePlan.inventory).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <span className="capitalize text-slate-500">{key}</span>
                <span className="font-semibold text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          className={`space-y-3 rounded-2xl border border-slate-200 p-4 transition-colors duration-700 ${
            changedSections?.timeline ? "bg-brand-teal/5" : "bg-white"
          }`}
        >
          <h3 className="text-sm font-semibold text-slate-900">Timeline & Dependencies</h3>
          <div className="space-y-3 border-l border-slate-200 pl-3">
            {plannerState.timeline.map((item, index) => (
              <article key={`${item.time}-${index}`} className="relative">
                <span className="absolute -left-[1.01rem] top-1 h-2.5 w-2.5 rounded-full bg-brand-teal" />
                <p className="text-xs font-semibold text-slate-900">
                  {item.time} - {item.title}
                </p>
                <p className="mt-1 text-xs text-slate-600">{item.notes}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className={`space-y-3 rounded-2xl border border-slate-200 p-4 transition-colors duration-700 ${
            changedSections?.budget ? "bg-brand-teal/5" : "bg-white"
          }`}
        >
          <h3 className="text-sm font-semibold text-slate-900">Budget Simulation</h3>
          <div className="flex items-center gap-4">
            <BudgetDonut breakdown={plannerState.budget.breakdown} />
            <div className="flex-1 space-y-2">
              {plannerState.budget.breakdown.map((item, index) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: donutColors[index % donutColors.length] }}
                    />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{item.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-900">
            Total: {currencyFormatter.format(plannerState.budget.total)}
          </p>
          {plannerState.budget.tradeoffNote && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {plannerState.budget.tradeoffNote}
            </div>
          )}
        </section>
      </div>
    </aside>
  );
};

export default BlueprintDetailPanel;
