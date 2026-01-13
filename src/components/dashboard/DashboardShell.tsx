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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { sidebarUser } from "@/config/sidebarUser";
import { getSidebarVendor } from "@/config/sidebarVendor";
import { sidebarAdmin } from "@/config/sidebarAdmin";
import { AppRole, clearRole, getCurrentRole, getRoleHomePath, setCurrentRole } from "@/utils/role";
import {
  getSessionState,
  setVendorOnboardingStatus,
  setVendorType,
  updateVendorProfileDraft
} from "@/utils/session";

const isDev = import.meta.env.MODE !== "production";

type DashboardShellProps = {
  children: React.ReactNode;
};

const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = getCurrentRole();

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200 hidden md:flex flex-col">
          <SidebarHeader className="border-b p-6">
            <Link to="/" className="text-lg font-semibold text-gray-900">
              Strathwell
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-3 flex-1 overflow-y-auto">
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        asChild
                        className={location.pathname === item.href ? "bg-gray-100" : ""}
                      >
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
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1">
          <header className="flex items-center justify-between border-b bg-white px-6 py-4">
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
          <div className="px-6 py-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardShell;
