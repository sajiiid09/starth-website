import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { sidebarUser } from "@/config/sidebarUser";
import { getSidebarVendor } from "@/config/sidebarVendor";
import { sidebarAdmin } from "@/config/sidebarAdmin";
import RailNav from "@/features/immersive/RailNav";
import NavDrawerOverlay from "@/features/immersive/NavDrawerOverlay";
import { organizerNavItems } from "@/features/immersive/navItems";
import {
  PlannerSessionsProvider,
  usePlannerSessions
} from "@/features/planner/PlannerSessionsContext";
import { AppRole, clearRole, getCurrentRole, getRoleHomePath, setCurrentRole } from "@/utils/role";
import {
  getSessionState,
  setVendorOnboardingStatus,
  setVendorType,
  updateVendorProfileDraft
} from "@/utils/session";
import { isAdminReadOnly } from "@/features/admin/config";

const isDev = import.meta.env.MODE !== "production";
const AI_PLANNER_ROUTE = "/dashboard/ai-planner";
const AI_PLANNER_ALIASES = [AI_PLANNER_ROUTE, "/dashboard/plan-with-ai"];

type DashboardShellProps = {
  children: React.ReactNode;
};

type DashboardShellContentProps = DashboardShellProps & {
  role: AppRole | null;
};

const DashboardShellContent: React.FC<DashboardShellContentProps> = ({ children, role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isImmersiveDrawerOpen, setIsImmersiveDrawerOpen] = React.useState(false);
  const { sessions, activeSessionId, setActiveSession, createNewSession } = usePlannerSessions();
  const useImmersiveNav = role === "user";

  const navItems = React.useMemo(() => {
    if (role === "admin") return sidebarAdmin;
    if (role === "vendor") {
      const session = getSessionState();
      return getSidebarVendor({
        vendorType: session.vendorType,
        status: session.vendorOnboardingStatus
      });
    }
    return sidebarUser;
  }, [role]);

  const handleSignOut = () => {
    sessionStorage.removeItem("currentUser");
    clearRole();
    setVendorType(null);
    setVendorOnboardingStatus("draft");
    updateVendorProfileDraft({});
    navigate("/appentry");
  };

  const handleRoleSwitch = (nextRole: AppRole) => {
    setCurrentRole(nextRole);
    navigate(getRoleHomePath(nextRole));
  };

  const handleSelectPlannerSession = (sessionId: string) => {
    setActiveSession(sessionId);
    navigate(AI_PLANNER_ROUTE);
  };

  const handleCreatePlannerSession = () => {
    const created = createNewSession();
    setActiveSession(created.id);
    navigate(AI_PLANNER_ROUTE);
  };

  React.useEffect(() => {
    setIsImmersiveDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      {useImmersiveNav ? (
        <>
          <RailNav
            items={organizerNavItems}
            onOpenDrawer={() => setIsImmersiveDrawerOpen(true)}
          />
          <NavDrawerOverlay
            isOpen={isImmersiveDrawerOpen}
            onClose={() => setIsImmersiveDrawerOpen(false)}
            items={organizerNavItems}
            onSignOut={handleSignOut}
            plannerSessions={sessions}
            activeSessionId={activeSessionId}
            onSelectPlannerSession={handleSelectPlannerSession}
            onCreatePlannerSession={handleCreatePlannerSession}
          />
        </>
      ) : (
        <Sidebar className="hidden md:flex flex-col bg-white">
          <SidebarHeader className="p-6">
            <Link to="/" className="inline-flex items-center">
              <img
                src="/images/strathwell_logo_clean.png"
                alt="Strathwell"
                className="h-16 w-auto sm:h-20 md:h-[88px]"
              />
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-3 flex-1 overflow-y-auto">
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {navItems.map((item) => {
                    const isPlannerAliasActive =
                      item.href === AI_PLANNER_ROUTE && AI_PLANNER_ALIASES.includes(location.pathname);
                    const isItemActive = location.pathname === item.href || isPlannerAliasActive;

                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton asChild className={isItemActive ? "bg-gray-100" : ""}>
                          <Link to={item.href} className="flex items-center gap-3 p-3">
                            <item.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{item.label}</span>
                            {"badge" in item && item.badge && (
                              <span className="ml-auto rounded-full bg-brand-teal/10 px-2 py-0.5 text-xs text-brand-teal">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>
      )}

      <main className="flex-1 min-w-0">
        <header className="flex items-center justify-between bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            {useImmersiveNav && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl md:hidden"
                onClick={() => setIsImmersiveDrawerOpen(true)}
                aria-label="Open organizer navigation menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            <div className="text-sm font-semibold text-gray-700">
              {role ? `${role.charAt(0).toUpperCase()}${role.slice(1)} Dashboard` : "Dashboard"}
            </div>
          </div>
          {isDev && (
            <Select value={role || "user"} onValueChange={(value) => handleRoleSwitch(value as AppRole)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Switch role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          )}
        </header>
        {role === "admin" && isAdminReadOnly && (
          <div className="mx-6 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Admin read-only mode is enabled. Mutating actions are currently disabled.
          </div>
        )}
        <div className="px-6 py-8">{children}</div>
      </main>
    </div>
  );
};

const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const role = getCurrentRole();

  return (
    <SidebarProvider>
      <PlannerSessionsProvider enabled={role === "user"}>
        <DashboardShellContent role={role}>{children}</DashboardShellContent>
      </PlannerSessionsProvider>
    </SidebarProvider>
  );
};

export default DashboardShell;
