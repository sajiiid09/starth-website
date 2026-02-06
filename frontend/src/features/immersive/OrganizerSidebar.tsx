import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CaretDoubleLeft,
  CaretDoubleRight,
  List,
  Plus,
  SignOut,
  Sparkle
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { organizerNavItems, isNavItemActive } from "@/features/immersive/navItems";
import { PlannerSession } from "@/features/planner/types";
import { cn } from "@/lib/utils";

type OrganizerSidebarProps = {
  plannerSessions: PlannerSession[];
  activeSessionId: string | null;
  onSelectPlannerSession: (sessionId: string) => void;
  onCreatePlannerSession: () => void;
  onSignOut: () => void;
};

const SIDEBAR_EXPANDED_KEY = "organizerSidebarExpanded";

const OrganizerSidebar: React.FC<OrganizerSidebarProps> = ({
  plannerSessions,
  activeSessionId,
  onSelectPlannerSession,
  onCreatePlannerSession,
  onSignOut
}) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = React.useState(true);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_EXPANDED_KEY);
    if (stored === null) return;
    setIsExpanded(stored === "true");
  }, []);

  const toggleExpanded = React.useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_EXPANDED_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out md:flex",
          isExpanded ? "w-64" : "w-16"
        )}
      >
        <header className="flex h-16 items-center border-b border-slate-200 px-3">
        <div
            className={cn(
                "flex items-center gap-3 overflow-hidden transition-all duration-300",
                isExpanded ? "flex-1 opacity-100" : "w-0 opacity-0"
            )}
        >
            <img 
                src="/images/strathwell_logo_clean.png" 
                alt="Strathwell" 
                className="h-8 w-8 shrink-0 rounded-lg"
            />
            <span className="truncate font-semibold tracking-tight text-slate-900">Strathwell</span>
        </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl text-slate-500 hover:bg-slate-100"
            onClick={toggleExpanded}
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? (
              <CaretDoubleLeft weight="bold" className="h-4 w-4" />
            ) : (
              <CaretDoubleRight weight="bold" className="h-4 w-4" />
            )}
          </Button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden p-3">
          <nav className="space-y-1">
            {organizerNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavItemActive(item, location.pathname);

              const content = (
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200",
                    isActive
                      ? "border-brand-teal/20 bg-brand-teal/5 font-semibold text-brand-teal"
                      : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive ? "text-brand-teal" : "text-slate-500"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm transition-all duration-300",
                      isExpanded ? "opacity-100" : "w-0 overflow-hidden opacity-0"
                    )}
                  >
                    {item.label}
                  </span>
                  {item.badge && isExpanded && (
                    <Badge className="ml-auto h-5 min-w-[20px] rounded-full bg-brand-coral px-1.5 text-[10px] font-semibold text-white border-none">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );

              if (isExpanded) {
                return <div key={item.id}>{content}</div>;
              }

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{content}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          <div className={cn("space-y-3 transition-all duration-300", !isExpanded && "opacity-0")}
          >
            {isExpanded && (
              <section className="animate-in fade-in slide-in-from-left-2 duration-500">
                <div className="mb-2 flex items-center justify-between px-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Sessions
                  </p>
                  <button
                    type="button"
                    onClick={onCreatePlannerSession}
                    className="rounded-md p-1 text-brand-teal transition-colors hover:bg-brand-teal/10"
                    aria-label="Create new planner session"
                  >
                    <Plus weight="bold" className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {plannerSessions.slice(0, 5).map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => onSelectPlannerSession(session.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors",
                        session.id === activeSessionId
                          ? "bg-brand-teal/10 font-medium text-brand-teal"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <span className="flex-1 truncate">{session.title}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <footer className="mt-auto border-t border-slate-100 p-3">
          <Button
            variant="ghost"
            onClick={onSignOut}
            className={cn(
              "w-full rounded-xl text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600",
              isExpanded ? "justify-start px-3" : "justify-center px-0"
            )}
          >
            <SignOut weight="bold" className="h-5 w-5 shrink-0" />
            <span
              className={cn(
                "ml-3 text-sm font-medium transition-opacity",
                isExpanded ? "opacity-100" : "hidden"
              )}
            >
              Sign Out
            </span>
          </Button>
        </footer>
      </aside>
    </TooltipProvider>
  );
};

export default OrganizerSidebar;
