import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  sidebarUser
} from "@/config/sidebarUser";
import { clearAuthTokens } from "@/api/authStorage";
import { getSidebarVendor } from "@/config/sidebarVendor";
import { sidebarAdmin } from "@/config/sidebarAdmin";
import OrganizerSidebar from "@/features/immersive/OrganizerSidebar";
import {
  PlannerSessionsProvider,
  usePlannerSessions
} from "@/features/planner/PlannerSessionsContext";
import { AppRole, clearRole, getCurrentRole } from "@/utils/role";
import {
  getSessionState,
  setVendorOnboardingStatus,
  setVendorType,
  updateVendorProfileDraft
} from "@/utils/session";
import { isAdminReadOnly } from "@/features/admin/config";
import { cn } from "@/lib/utils";

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
  const { sessions, activeSessionId, setActiveSession, createNewSession } = usePlannerSessions();
  const useImmersiveNav = role === "user";
  const isOrganizerPlannerRoute = useImmersiveNav && AI_PLANNER_ALIASES.includes(location.pathname);

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
    clearAuthTokens();
    sessionStorage.removeItem("currentUser");
    clearRole();
    setVendorType(null);
    setVendorOnboardingStatus("draft");
    updateVendorProfileDraft({});
    navigate("/appentry");
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

  return (
    <div
      className={cn(
        "flex w-full bg-gray-50",
        isOrganizerPlannerRoute ? "h-screen overflow-hidden" : "min-h-screen"
      )}
    >
      {useImmersiveNav ? (
        <OrganizerSidebar
          plannerSessions={sessions}
          activeSessionId={activeSessionId}
          onSelectPlannerSession={handleSelectPlannerSession}
          onCreatePlannerSession={handleCreatePlannerSession}
          onSignOut={handleSignOut}
        />
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
                                {item.badge as React.ReactNode}
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

      <main
        className={cn(
          "flex-1 min-w-0",
          isOrganizerPlannerRoute ? "flex h-screen flex-col overflow-hidden" : ""
        )}
      >
        <header className="shrink-0 flex items-center justify-between bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-gray-700">
              {role ? `${role.charAt(0).toUpperCase()}${role.slice(1)} Dashboard` : "Dashboard"}
            </div>
          </div>
        </header>
        {role === "admin" && isAdminReadOnly && (
          <div className="mx-6 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Admin read-only mode is enabled. Mutating actions are currently disabled.
          </div>
        )}
        <div
          className={cn(
            "px-6",
            isOrganizerPlannerRoute
              ? "flex-1 min-h-0 overflow-hidden py-6"
              : "py-8"
          )}
        >
          {children}
        </div>
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
