
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { clearAuthTokens } from "@/api/authStorage";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  // SidebarMenuButton, // This component is no longer needed as Link will directly be the clickable element
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  SquaresFour,
  Briefcase,
  Buildings,
  Shield,
  FileText,
  Gear,
  Sparkle,
  Envelope,
} from "@phosphor-icons/react";

const navigationItems = [
  {
    title: "Overview",
    url: createPageUrl("ProviderPortal"),
    icon: SquaresFour,
    description: "Dashboard & key metrics",
  },
  {
    title: "Messages",
    url: createPageUrl("ProviderMessages"),
    icon: Envelope,
    description: "View & reply to leads",
  },
  {
    title: "Organization",
    url: createPageUrl("ProviderOrganization"),
    icon: Buildings,
    description: "Your business details",
  },
  {
    title: "Services",
    url: createPageUrl("ProviderServices"),
    icon: Briefcase,
    description: "Manage your services",
  },
  {
    title: "Insurance",
    url: createPageUrl("ProviderInsurance"),
    icon: Shield,
    description: "Your insurance policies",
  },
  {
    title: "Documents",
    url: createPageUrl("ProviderDocuments"),
    icon: FileText,
    description: "Required uploads",
  },
  {
    title: "Settings",
    url: createPageUrl("ProviderSettings"),
    icon: Gear,
    description: "Account & notifications",
  },
];

export default function ProviderPortalLayout({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();

    const handleProfileUpdate = (event) => {
      setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser };
        if (event.detail.full_name !== undefined) {
          updatedUser.full_name = event.detail.full_name;
        }
        if (event.detail.profile_picture_url !== undefined) {
          updatedUser.profile_picture_url = event.detail.profile_picture_url;
        }
        
        // Store updated user in sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        return updatedUser;
      });
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
  }, []);

  const fetchUser = async () => {
    try {
      const cachedUser = sessionStorage.getItem('currentUser');
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
        return;
      }

      const currentUser = await User.me();
      setUser(currentUser);
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    } catch (error) {
      console.error("Error fetching user:", error);
      sessionStorage.removeItem('currentUser');
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthTokens();
      sessionStorage.removeItem('currentUser');
      localStorage.removeItem("activeRole");
      window.location.href = createPageUrl("Home");
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 p-6">
            <Link
              to={createPageUrl("Home")}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <Sparkle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-lg">Strathwell</h2>
                <p className="text-xs text-green-600 font-medium">
                  Provider Portal
                </p>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                Provider Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <Link
                        to={item.url}
                        className={`flex items-start gap-3 p-3 min-h-[60px] w-full rounded-lg mb-2 text-left hover:bg-green-50 hover:text-green-700 transition-colors ${
                          location.pathname === item.url
                            ? "bg-green-50 text-green-700"
                            : "text-gray-600"
                        }`}
                      >
                        <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium mb-1">{item.title}</div>
                          <div className="text-xs text-gray-500 leading-normal">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 p-4 space-y-3">
            {user && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {user.profile_picture_url ? (
                    <img 
                      src={user.profile_picture_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-700 font-semibold text-sm">
                      {user.full_name?.[0]?.toUpperCase() ||
                        user.email?.[0]?.toUpperCase() ||
                        "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {user.full_name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Service Provider
                  </p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 py-2"
            >
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
