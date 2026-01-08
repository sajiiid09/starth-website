
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  Menu,
  LayoutGrid,
  CheckCircle2,
  Megaphone,
  MessageSquare,
  Settings
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/api/entities";
import HomeNav from "@/components/home-v2/HomeNav";
import { NavThemeProvider } from "@/components/home-v2/state/navThemeStore";

const publicPages = [
  "Home",
  "AIPlanner",
  "Marketplace",
  "CaseStudies",
  "About",
  "Contact",
  "Terms",
  "Privacy",
  "DashboardPreview",
  "DFY",
  "VerifyEmail",
  "ResetPassword",
  "VirtualRobotics",
  "WhyStrathwell",
  "Templates",
  "Vendors",
  "Legals",
  "Reviews"
];

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutGrid,
    description: "Your event command center"
  },
  {
    title: "Checklist",
    url: createPageUrl("Checklist"),
    icon: CheckCircle2,
    description: "Track your event planning progress"
  },
  {
    title: "My Events",
    url: createPageUrl("Events"),
    icon: Calendar,
    description: "Manage your events"
  },
  {
    title: "Messages",
    url: createPageUrl("Messages"),
    icon: MessageSquare,
    description: "Chat with venues & vendors"
  },
  {
    title: "Marketing",
    url: createPageUrl("Marketing"),
    icon: Megaphone,
    description: "Campaigns & sponsorships"
  },
  {
    title: "Profile Settings",
    url: createPageUrl("ProfileSettings"),
    icon: Settings,
    description: "Edit your profile & settings"
  }
];

type LayoutProps = {
  children: React.ReactNode;
  currentPageName: string;
};

export default function Layout({ children, currentPageName }: LayoutProps) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  console.log("Layout render:", { currentPageName, loading, user, isPublic: publicPages.includes(currentPageName) });

  React.useEffect(() => {
    const isPublic = publicPages.includes(currentPageName);
    checkUser(isPublic);
  }, [currentPageName]);

  const checkUser = async (isPublic) => {
    const cachedUser = sessionStorage.getItem('currentUser');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
        setLoading(false);
        return;
      } catch (e) {
        sessionStorage.removeItem('currentUser');
      }
    }

    try {
      const currentUser = await User.me();
      setUser(currentUser);
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    } catch (error) {
      setUser(null);
      sessionStorage.removeItem('currentUser');
      if (!isPublic) {
        window.location.href = createPageUrl("Home");
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    sessionStorage.removeItem('currentUser');
    window.location.href = createPageUrl("Home");
  };

  const isPublicPage = publicPages.includes(currentPageName);

  // If user is authenticated and on AIPlanner, use authenticated layout
  if (user && currentPageName === "AIPlanner") {
    // Fall through to authenticated layout below
  } else if (isPublicPage) {
    return (
      <NavThemeProvider>
        <div className="min-h-screen bg-white">
          <HomeNav />
          <main className="pt-24">{children}</main>
        </div>
      </NavThemeProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200 hidden md:flex flex-col">
          <SidebarHeader className="border-b p-6">
            <Link to={createPageUrl("Home")}>
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/ddf404508_Elegant_Simple_Aesthetic_Real_Estate_Logo__1_-removebg-preview.png" alt="Strathwell" className="h-24 w-auto" />
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-3 flex-1 overflow-y-auto">
            <SidebarGroup>
              <SidebarGroupLabel>Platform</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-3">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className={location.pathname === item.url ? 'bg-gray-100' : ''}>
                        <Link to={item.url} className="flex items-start gap-3 p-3 min-h-[60px]">
                          <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium">{item.title}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            {user && (
              <>
                <div className="mb-3">
                  <p className="font-medium text-sm">{user.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                {user.roles && user.roles.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-start mb-2">
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        {(() => {
                          const activeRole = localStorage.getItem('activeRole') || user.roles[0];
                          return activeRole === 'venue_owner' ? 'Venue Owner' :
                                 activeRole === 'service_provider' ? 'Service Provider' :
                                 'Event Organizer';
                        })()}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[240px]">
                      {(() => {
                        const activeRole = localStorage.getItem('activeRole') || user.roles[0];
                        return (
                          <>
                            {user.roles.includes('organizer') && activeRole !== 'organizer' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  localStorage.setItem('activeRole', 'organizer');
                                  window.location.href = createPageUrl('Dashboard');
                                }}
                              >
                                <Users className="w-4 h-4 mr-2" />
                                Switch to Organizer
                              </DropdownMenuItem>
                            )}
                            {user.roles.includes('venue_owner') && activeRole !== 'venue_owner' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  localStorage.setItem('activeRole', 'venue_owner');
                                  window.location.href = createPageUrl('VenuePortal');
                                }}
                              >
                                <MapPin className="w-4 h-4 mr-2" />
                                Switch to Venue Owner
                              </DropdownMenuItem>
                            )}
                            {user.roles.includes('service_provider') && activeRole !== 'service_provider' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  localStorage.setItem('activeRole', 'service_provider');
                                  window.location.href = createPageUrl('ProviderPortal');
                                }}
                              >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Switch to Service Provider
                              </DropdownMenuItem>
                            )}
                          </>
                        );
                      })()}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}

            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <header className="bg-white border-b px-4 py-4 md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="w-6 h-6" />
            </button>
          </header>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
