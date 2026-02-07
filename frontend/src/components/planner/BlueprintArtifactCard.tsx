import React from "react";
import { ChartBar, CurrencyDollar, Target, ArrowSquareOut } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type BlueprintArtifactCardProps = {
  title: string;
  summary: string;
  kpis?: {
    totalCost: number;
    costPerAttendee: number;
    confidencePct: number;
  };
  onOpen: () => void;
};

const formatCurrency = (value: number) =>
  Number.isFinite(value) ? `$${Math.round(value).toLocaleString()}` : "-";

const BlueprintArtifactCard: React.FC<BlueprintArtifactCardProps> = ({
  title,
  summary,
  kpis,
  onOpen
}) => {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group w-full rounded-2xl border border-brand-teal/20 bg-gradient-to-br from-white via-brand-light/30 to-white p-4 text-left shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-brand-teal/35 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/35"
      )}
      aria-label={`Open blueprint artifact: ${title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-teal">
            Blueprint Artifact
          </p>
          <h3 className="mt-1 truncate text-base font-semibold text-slate-900">{title}</h3>
        </div>
        <div className="rounded-full border border-brand-teal/20 bg-white p-1.5 text-brand-teal transition-transform duration-200 group-hover:scale-105">
          <ArrowSquareOut className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-slate-600">{summary}</p>

      {kpis && (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white/90 px-2.5 py-2">
            <div className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              <CurrencyDollar className="h-3.5 w-3.5" />
              Total Cost
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-800">{formatCurrency(kpis.totalCost)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/90 px-2.5 py-2">
            <div className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              <ChartBar className="h-3.5 w-3.5" />
              Cost / Guest
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatCurrency(kpis.costPerAttendee)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/90 px-2.5 py-2">
            <div className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              <Target className="h-3.5 w-3.5" />
              Confidence
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-800">{Math.round(kpis.confidencePct)}%</p>
          </div>
        </div>
      )}
    </button>
  );
};

export default BlueprintArtifactCard;
