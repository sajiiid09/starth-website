import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Event } from "@/api/entities";
import { Plan } from "@/api/entities";
import { User } from "@/api/entities";
import { Favorite } from "@/api/entities";
import { Reminder } from "@/api/entities";
import { Venue } from "@/api/entities";
import { Service } from "@/api/entities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import VenueGrid from "@/components/marketplace/VenueGrid";
import ServiceProviderGrid from "@/components/marketplace/ServiceProviderGrid";
import MarketplaceFilters from "@/components/marketplace/MarketplaceFilters";
import { 
  Plus, 
  Sparkles, 
  Calendar, 
  LayoutList, 
  ArrowRight,
  Loader2,
  Heart,
  Bell,
  MapPin,
  Users,
  DollarSign,
  CheckCircle,
  TrendingUp,
  Box
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({
    activeEvents: 0,
    savedPlans: 0,
    favoriteVenues: 0,
    upcomingReminders: 0
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [venues, setVenues] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    state: "",
    city: "",
    capacity: "",
    priceRange: "",
    category: "",
    eventType: ""
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const filterData = () => {
      let filteredV = venues.filter(venue => {
        const matchesSearch = !searchQuery || 
          (venue.name && venue.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (venue.city && venue.city.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesState = !filters.state || venue.state === filters.state;
        const matchesCity = !filters.city || venue.city === filters.city;
        const matchesCapacity = !filters.capacity || 
          (filters.capacity === "small" && venue.capacity_max < 50) ||
          (filters.capacity === "medium" && venue.capacity_max >= 50 && venue.capacity_max <= 150) ||
          (filters.capacity === "large" && venue.capacity_max > 150);
        const matchesPrice = !filters.priceRange ||
          (filters.priceRange === "budget" && venue.rate_card_json?.base_rate < 3000) ||
          (filters.priceRange === "mid" && venue.rate_card_json?.base_rate >= 3000 && venue.rate_card_json?.base_rate <= 7000) ||
          (filters.priceRange === "premium" && venue.rate_card_json?.base_rate > 7000);
        const matchesEventType = !filters.eventType || (venue.tags && venue.tags.includes(filters.eventType));
        
        return matchesSearch && matchesState && matchesCity && matchesCapacity && matchesPrice && matchesEventType;
      });
      setFilteredVenues(filteredV);

      let filteredS = services.filter(service => {
        const matchesSearch = !searchQuery ||
          (service.name && service.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (service.category && service.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (service.city && service.city.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = !filters.category || service.category === filters.category;
        
        // State filtering
        const stateMatch = !filters.state || 
          service.state === filters.state || 
          (service.coverage_regions && service.coverage_regions.some(r => {
            const regionLower = r.toLowerCase();
            return regionLower.includes(filters.state.toLowerCase()) || 
                   (regionLower.startsWith("all of") && regionLower.includes(filters.state.toLowerCase()));
          }));
        
        // City filtering
        const cityMatch = !filters.city || 
          service.city === filters.city ||
          (service.coverage_regions && service.coverage_regions.some(r => {
            const regionLower = r.toLowerCase();
            return regionLower.includes(filters.city.toLowerCase());
          }));
        
        const matchesEventType = !filters.eventType || (service.event_types && service.event_types.includes(filters.eventType));

        return matchesSearch && matchesCategory && stateMatch && cityMatch && matchesEventType;
      });
      setFilteredServices(filteredS);
    };

    if (activeTab === 'marketplace') {
      filterData();
    }
  }, [venues, services, searchQuery, filters, activeTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const cachedUser = sessionStorage.getItem('currentUser');
      let currentUser;
      if (cachedUser) {
        currentUser = JSON.parse(cachedUser);
      } else {
        currentUser = await User.me();
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
      setUser(currentUser);

      const [eventsData, plansData, favoritesData, remindersData, venuesData, servicesData] = await Promise.all([
        Event.filter({ organizer_id: currentUser.id }),
        Plan.filter({ organizer_id: currentUser.id }),
        Favorite.filter({ user_id: currentUser.id }),
        Reminder.filter({ user_id: currentUser.id, completed: false }),
        Venue.filter({ status: "active" }),
        Service.filter({ status: "active" })
      ]);

      setEvents(eventsData.slice(0, 3));
      setPlans(plansData.slice(0, 3));
      setFavorites(favoritesData.slice(0, 5));
      setReminders(remindersData.slice(0, 5));
      setVenues(venuesData);
      setServices(servicesData);
      setFilteredVenues(venuesData);
      setFilteredServices(servicesData);

      setStats({
        activeEvents: eventsData.filter(e => e.status !== 'completed' && e.status !== 'cancelled').length,
        savedPlans: plansData.length,
        favoriteVenues: favoritesData.filter(f => f.entity_type === 'venue').length,
        upcomingReminders: remindersData.length
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const markReminderComplete = async (reminder) => {
    try {
      await Reminder.update(reminder.id, { completed: true });
      setReminders(reminders.filter(r => r.id !== reminder.id));
      setStats(prev => ({ ...prev, upcomingReminders: prev.upcomingReminders - 1 }));
      toast.success("Reminder marked as complete");
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast.error("Failed to update reminder");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.full_name || 'Organizer'}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your events</p>
          </div>

          {user?.roles && user.roles.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Switch to:</span>
              <div className="flex gap-2">
                {user.roles.includes('venue_owner') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      localStorage.setItem('activeRole', 'venue_owner');
                      window.location.href = createPageUrl('VenuePortal');
                    }}
                  >
                    Venue Owner
                  </Button>
                )}
                {user.roles.includes('service_provider') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      localStorage.setItem('activeRole', 'service_provider');
                      window.location.href = createPageUrl('ProviderPortal');
                    }}
                  >
                    Service Provider
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai">AI Planner</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Events</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeEvents}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Saved Plans</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.savedPlans}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <LayoutList className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Favorites</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.favoriteVenues}</p>
                </div>
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Reminders</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.upcomingReminders}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Recent Events
                  </CardTitle>
                  <CardDescription>Your upcoming and active events</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Link to={createPageUrl("CreateEvent")}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      New Event
                    </Button>
                  </Link>
                  <Link to={createPageUrl("EventBuilder")}>
                    <Button size="sm" variant="outline">
                      <Box className="w-4 h-4 mr-2" />
                      Event Builder
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No events yet</p>
                    <Link to={createPageUrl("CreateEvent")}>
                      <Button variant="outline">Create Your First Event</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{event.event_type}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(event.date_start).toLocaleDateString()}
                              </span>
                              {event.guest_count && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {event.guest_count} guests
                                </span>
                              )}
                            </div>
                          </div>
                          <Link to={createPageUrl("EventDetails") + `?id=${event.id}`}>
                            <Button size="sm" variant="ghost">
                              View <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                    <Link to={createPageUrl("Events")}>
                      <Button variant="outline" className="w-full">View All Events</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Plans
                  </CardTitle>
                  <CardDescription>Your saved AI-generated plans</CardDescription>
                </div>
                <Link to={createPageUrl("AIPlanner")}>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Plan with AI
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {plans.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No plans yet</p>
                    <Link to={createPageUrl("AIPlanner")}>
                      <Button variant="outline">Start Planning with AI</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {plans.map((plan) => (
                      <div key={plan.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Created {new Date(plan.created_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Link to={createPageUrl("PlanDetails") + `?id=${plan.id}`}>
                            <Button size="sm" variant="ghost">
                              View <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  Favorite Venues
                </CardTitle>
                <CardDescription>Quick access to your favorites</CardDescription>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-6">
                    <Heart className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No favorites yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {favorites.slice(0, 3).map((fav) => (
                      <div key={fav.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <p className="font-medium text-gray-900">{fav.entity_type === 'venue' ? 'Venue' : 'Service'}</p>
                        <p className="text-gray-600">ID: {fav.entity_id.slice(0, 8)}...</p>
                      </div>
                    ))}
                    <Link to={createPageUrl("Marketplace")}>
                      <Button variant="outline" size="sm" className="w-full">Browse Marketplace</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  Reminders
                </CardTitle>
                <CardDescription>Stay on track with your tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {reminders.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">All caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reminders.map((reminder) => (
                      <div key={reminder.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{reminder.title}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(reminder.due_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => markReminderComplete(reminder)}
                            className="flex-shrink-0"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>


          </div>
        </div>
          </TabsContent>

          <TabsContent value="ai">
            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white mb-8">
              <CardContent className="p-8">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-4">AI Event Planner</h2>
                  <p className="text-blue-100 mb-6 text-lg max-w-2xl mx-auto">
                    Let our AI find the perfect venues and vendors for your event in seconds. Just describe your event and we'll do the rest.
                  </p>
                  <Link to={createPageUrl("AIPlanner")}>
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Planning with AI
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Recent AI Plans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {plans.length === 0 ? (
                    <div className="text-center py-8">
                      <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No plans yet</p>
                      <Link to={createPageUrl("AIPlanner")}>
                        <Button variant="outline">Create Your First Plan</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {plans.map((plan) => (
                        <div key={plan.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Created {new Date(plan.created_date).toLocaleDateString()}
                              </p>
                            </div>
                            <Link to={createPageUrl("PlanDetails") + `?id=${plan.id}`}>
                              <Button size="sm" variant="ghost">
                                View <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>How AI Planning Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Describe Your Event</h4>
                      <p className="text-sm text-gray-600">Tell us about your event type, location, guest count, and budget</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">AI Finds Matches</h4>
                      <p className="text-sm text-gray-600">Our AI searches venues and vendors that perfectly match your needs</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Review & Book</h4>
                      <p className="text-sm text-gray-600">Review recommendations, save plans, and contact vendors directly</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="marketplace">
            <Card className="border-none shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search venues, services, or locations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <MarketplaceFilters 
                  filters={filters}
                  setFilters={setFilters}
                  activeTab="venues"
                />
              </CardContent>
            </Card>

            <Tabs defaultValue="venues" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                <TabsTrigger value="venues">Venues ({filteredVenues.length})</TabsTrigger>
                <TabsTrigger value="providers">Services ({filteredServices.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="venues">
                <VenueGrid venues={filteredVenues} />
              </TabsContent>

              <TabsContent value="providers">
                <ServiceProviderGrid services={filteredServices} />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}