import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
const AI_PLANNER_ROUTE = "/dashboard/plan-with-ai";

type DashboardShellProps = {
  children: React.ReactNode;
};

const formatSessionTimestamp = (timestamp: number) => {
  const now = Date.now();
  const diffMinutes = Math.floor((now - timestamp) / (1000 * 60));

  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffMinutes < 60 * 24) return `${Math.floor(diffMinutes / 60)}h`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

type DashboardShellContentProps = DashboardShellProps & {
  role: AppRole | null;
};

const DashboardShellContent: React.FC<DashboardShellContentProps> = ({ children, role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isChatHistoryOpen, setIsChatHistoryOpen] = React.useState(true);
  const { sessions, activeSessionId, setActiveSession, createNewSession } = usePlannerSessions();

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
    setIsChatHistoryOpen(true);
    navigate(AI_PLANNER_ROUTE);
  };

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
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
                  const isPlannerItem = role === "user" && item.href === AI_PLANNER_ROUTE;
                  const isItemActive =
                    location.pathname === item.href ||
                    (isPlannerItem && location.pathname === "/dashboard");

                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild className={isItemActive ? "bg-gray-100" : ""}>
                        <Link to={item.href} className="flex items-center gap-3 p-3">
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto rounded-full bg-brand-teal/10 px-2 py-0.5 text-xs text-brand-teal">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>

                      {isPlannerItem && (
                        <div className="mt-1 group-data-[collapsible=icon]:hidden">
                          <Collapsible open={isChatHistoryOpen} onOpenChange={setIsChatHistoryOpen}>
                            <div className="flex items-center justify-between gap-1 px-2">
                              <CollapsibleTrigger asChild>
                                <button
                                  type="button"
                                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                                >
                                  {isChatHistoryOpen ? (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  )}
                                  Chat History
                                </button>
                              </CollapsibleTrigger>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-brand-teal hover:text-brand-teal"
                                onClick={handleCreatePlannerSession}
                              >
                                <Plus className="mr-1 h-3.5 w-3.5" />
                                New chat
                              </Button>
                            </div>

                            <CollapsibleContent>
                              <SidebarMenuSub className="mt-1 border-slate-200">
                                {sessions.map((session) => (
                                  <SidebarMenuSubItem key={session.id}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={session.id === activeSessionId}
                                      size="sm"
                                    >
                                      <button
                                        type="button"
                                        className="h-auto py-1.5"
                                        onClick={() => handleSelectPlannerSession(session.id)}
                                      >
                                        <div className="flex w-full items-center justify-between gap-2">
                                          <span className="truncate text-xs">{session.title}</span>
                                          <span className="shrink-0 text-[10px] text-slate-400">
                                            {formatSessionTimestamp(session.updatedAt)}
                                          </span>
                                        </div>
                                      </button>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                                {sessions.length === 0 && (
                                  <p className="px-2 py-1 text-xs text-slate-500">
                                    No chats yet.
                                  </p>
                                )}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      )}
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

      <main className="flex-1">
        <header className="flex items-center justify-between bg-white px-6 py-4">
          <div className="text-sm font-semibold text-gray-700">
            {role ? `${role.charAt(0).toUpperCase()}${role.slice(1)} Dashboard` : "Dashboard"}
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
