import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NavItem, isNavItemActive } from "@/features/immersive/navItems";

type RailNavProps = {
  items: NavItem[];
  onOpenDrawer: () => void;
};

const RailNav: React.FC<RailNavProps> = ({ items, onOpenDrawer }) => {
  const location = useLocation();

  return (
    <aside className="hidden h-screen w-16 shrink-0 border-r border-slate-200 bg-white/95 md:flex md:flex-col">
      <div className="flex h-16 items-center justify-center border-b border-slate-200">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              onClick={onOpenDrawer}
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
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
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-200 ${
                    isActive
                      ? "border-brand-teal/30 bg-brand-teal/10 text-brand-teal"
                      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
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
