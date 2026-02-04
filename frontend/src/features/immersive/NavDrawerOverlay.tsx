import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavItem, isNavItemActive } from "@/features/immersive/navItems";
import { PlannerSession } from "@/features/planner/types";

type NavDrawerOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
  onSignOut: () => void;
  plannerSessions: PlannerSession[];
  activeSessionId: string | null;
  onSelectPlannerSession: (sessionId: string) => void;
  onCreatePlannerSession: () => void;
};

const NavDrawerOverlay: React.FC<NavDrawerOverlayProps> = ({
  isOpen,
  onClose,
  items,
  onSignOut,
  plannerSessions,
  activeSessionId,
  onSelectPlannerSession,
  onCreatePlannerSession
}) => {
  const location = useLocation();

  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-40 transition-opacity duration-200 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/35"
        aria-label="Close navigation menu"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Organizer navigation menu"
        className={`absolute bottom-4 left-16 top-4 w-[min(22rem,calc(100vw-5rem))] rounded-2xl border border-slate-200 bg-white shadow-2xl transition-transform duration-200 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Organizer
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">Workspace Menu</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              onClick={onClose}
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto p-4">
            <nav className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = isNavItemActive(item, location.pathname);

                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors duration-200 ${
                      isActive
                        ? "border-brand-teal/30 bg-brand-teal/10 font-medium text-brand-teal"
                        : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Planner Sessions
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 rounded-lg px-2 text-xs text-brand-teal hover:bg-brand-teal/10 hover:text-brand-teal"
                  onClick={() => {
                    onCreatePlannerSession();
                    onClose();
                  }}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  New chat
                </Button>
              </div>

              <div className="space-y-1.5">
                {plannerSessions.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 bg-white px-2 py-2 text-xs text-slate-500">
                    No chats yet.
                  </p>
                ) : (
                  plannerSessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2 py-2 text-left text-xs transition-colors ${
                        session.id === activeSessionId
                          ? "border-brand-teal/25 bg-brand-teal/10 text-brand-teal"
                          : "border-transparent bg-white text-slate-700 hover:border-slate-200"
                      }`}
                      onClick={() => {
                        onSelectPlannerSession(session.id);
                        onClose();
                      }}
                    >
                      <span className="truncate">{session.title}</span>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {new Date(session.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric"
                        })}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </section>
          </div>

          <footer className="border-t border-slate-200 p-4">
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
              onClick={() => {
                onClose();
                onSignOut();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </footer>
        </div>
      </aside>
    </div>
  );
};

export default NavDrawerOverlay;
