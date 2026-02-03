import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchItem, MatchesState } from "@/features/planner/types";

type RelevantMatchesPanelProps = {
  matches: MatchesState;
  onTabChange: (tab: MatchesState["activeTab"]) => void;
  onOpenItem: (item: MatchItem) => void;
  heightClass?: string;
};

const tabConfig: Array<{ label: string; value: MatchesState["activeTab"] }> = [
  { label: "Templates", value: "templates" },
  { label: "Marketplace", value: "marketplace" }
];

const RelevantMatchesPanel: React.FC<RelevantMatchesPanelProps> = ({
  matches,
  onTabChange,
  onOpenItem,
  heightClass = "h-[72vh] min-h-[520px]"
}) => {
  const activeItems =
    matches.activeTab === "templates" ? matches.templates : matches.marketplace;

  const showSkeleton = activeItems.length === 0;

  return (
    <aside
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm ${heightClass}`}
    >
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-5 py-5 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          RELEVANT MATCHES
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">
          Curated templates and marketplace options.
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Refined from your active planning session in real time.
        </p>

        <div className="mt-4 grid w-full grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1">
          {tabConfig.map((tab) => {
            const isActive = matches.activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onTabChange(tab.value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand-teal/35 ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                aria-pressed={isActive}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {showSkeleton
          ? Array.from({ length: 3 }).map((_, index) => (
              <article
                key={`matches-skeleton-${index}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
              >
                <Skeleton className="h-16 w-16 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </article>
            ))
          : activeItems.map((item) => (
              <article
                key={item.id}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_1px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)]"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">{item.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full border border-slate-200 bg-white text-slate-600 transition-colors duration-200 hover:text-brand-teal focus-visible:ring-brand-teal/40"
                  onClick={() => onOpenItem(item)}
                  aria-label={`Open ${item.title}`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </article>
            ))}
      </div>
    </aside>
  );
};

export default RelevantMatchesPanel;
