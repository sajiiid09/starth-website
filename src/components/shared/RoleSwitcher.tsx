import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, LayoutGrid, Building, Briefcase } from 'lucide-react';
import { cn } from "@/lib/utils";

const roleConfig = {
  organizer: { label: "Organizer", icon: LayoutGrid },
  venue_owner: { label: "Venue Owner", icon: Building },
  service_provider: { label: "Service Provider", icon: Briefcase },
};

export default function RoleSwitcher({ userRoles, activeRole, onRoleChange, className }) {
  if (!userRoles || userRoles.length <= 1) {
    return null;
  }

  const activeRoleInfo = roleConfig[activeRole] || { label: activeRole, icon: LayoutGrid };
  const otherRoles = userRoles.filter(r => r !== activeRole);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-between items-center bg-gray-100 hover:bg-gray-200 border-gray-200", className)}
        >
          <div className="flex items-center gap-2">
            <activeRoleInfo.icon className="w-4 h-4 text-gray-700" />
            <span className="font-medium text-gray-900">{activeRoleInfo.label}</span>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]" align="end">
        {otherRoles.map((role) => {
          const roleInfo = roleConfig[role] || { label: role, icon: LayoutGrid };
          return (
            <DropdownMenuItem key={role} onClick={() => onRoleChange(role)} className="flex items-center gap-2">
              <roleInfo.icon className="w-4 h-4" />
              <span>Switch to {roleInfo.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}