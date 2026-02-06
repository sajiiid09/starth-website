import React from "react";
import { Link, useLocation } from "react-router-dom";
import { List } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NavItem, isNavItemActive } from "@/features/immersive/navItems";

type RailNavProps = {
  items: NavItem[];
  onOpenDrawer: (trigger?: HTMLElement | null) => void;
  menuButtonRef?: React.RefObject<HTMLButtonElement | null>;
};

const RailNav: React.FC<RailNavProps> = ({ items, onOpenDrawer, menuButtonRef }) => {
  const location = useLocation();

  return (
    <aside className="hidden h-screen w-16 shrink-0 border-r border-slate-200 bg-white/95 md:flex md:flex-col">
      <div className="flex h-16 items-center justify-center border-b border-slate-200">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={menuButtonRef}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              onClick={(event) => onOpenDrawer(event.currentTarget)}
              aria-label="Open navigation menu"
            >
              <List weight="bold" className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Open menu</TooltipContent>
        </Tooltip>
      </div>

      <nav className="flex flex-1 flex-col items-center gap-2 py-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = isNavItemActive(item, location.pathname);

          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Link
                  to={item.to}
                  aria-label={item.label}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-200 ${
                    isActive
                      ? "border-brand-teal/30 bg-brand-teal/10 text-brand-teal"
                      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.badge && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-coral px-1 text-[10px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
};

export default RailNav;
