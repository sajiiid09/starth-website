import React, { useState, useEffect } from "react";
import RoleGuard from "../components/auth/RoleGuard";
import VenuePortalLayout from "../components/venue/VenuePortalLayout";
import { User } from "@/api/entities";
import { Organization } from "@/api/entities";
import { Venue } from "@/api/entities";
import { Booking } from "@/api/entities";
import { ConversationParticipant } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Building, 
  CalendarCheck, 
  DollarSign, 
  Mail, 
  Loader2,
  ArrowRight,
  TrendingUp,
  Eye,
  Clock
} from "lucide-react";

export default function VenuePortalPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    venues: 0,
    activeVenues: 0,
    bookings: 0,
    revenue: 0,
    messages: 0,
    monthlyRevenue: 0,
    pendingBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [topVenues, setTopVenues] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const orgs = await Organization.filter({ owner_user_id: currentUser.id, type: "venue_owner" });
      if (orgs.length === 0) {
        setLoading(false);
        return;
      }
      const org = orgs[0];

      const venues = await Venue.filter({ org_id: org.id });
      const activeVenues = venues.filter(v => v.status === "active");
      const venueIds = venues.map(v => v.id);

      let totalBookings = 0;
      let totalRevenue = 0;
      let monthlyRevenue = 0;
      let pendingBookings = 0;
      let bookingsData = [];
      const venueBookingCounts = {};

      if (venueIds.length > 0) {
        const allBookings = await Booking.filter({ venue_id: { $in: venueIds } });
        
        // Calculate venue booking counts for top venues
        allBookings.forEach(booking => {
          const venueId = booking.venue_id;
          venueBookingCounts[venueId] = (venueBookingCounts[venueId] || 0) + 1;
        });

        bookingsData = allBookings
          .filter(b => ["confirmed", "paid", "completed"].includes(b.status))
          .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        totalBookings = bookingsData.length;
        totalRevenue = bookingsData.reduce((acc, booking) => acc + (booking.total_cents || 0), 0);
        
        monthlyRevenue = bookingsData
          .filter(b => {
            const bookingDate = new Date(b.created_date);
            return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
          })
          .reduce((acc, booking) => acc + (booking.total_cents || 0), 0);

        pendingBookings = allBookings.filter(b => b.status === "pending").length;
        
        setRecentBookings(bookingsData.slice(0, 5));
      }

      // Get top venues by booking count
      const topVenuesList = venues
        .map(venue => ({
          ...venue,
          bookingCount: venueBookingCounts[venue.id] || 0
        }))
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 3);

      setTopVenues(topVenuesList);

      const conversations = await ConversationParticipant.filter({ user_id: currentUser.id });

      setStats({
        venues: venues.length,
        activeVenues: activeVenues.length,
        bookings: totalBookings,
        revenue: totalRevenue / 100,
        monthlyRevenue: monthlyRevenue / 100,
        messages: conversations.length,
        pendingBookings
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <RoleGuard requiredRole="venue_owner">
        <VenuePortalLayout>
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        </VenuePortalLayout>
      </RoleGuard>
    );
  }

  const StatCard = ({ title, value, icon, description, trend, color = "blue" }) => (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          {React.cloneElement(icon, { className: `h-4 w-4 text-${color}-600` })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="flex items-center justify-between">
          {title === "Total Bookings" ? (
            <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-800 text-xs font-medium">
              {description}
            </Badge>
          ) : (
            <p className="text-xs text-gray-500">{description}</p>
          )}
          {trend && (
            <div className="flex items-center text-green-600 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <RoleGuard requiredRole="venue_owner">
      <VenuePortalLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.full_name?.split(' ')[0] || 'Partner'}!
                  </h1>
                  <p className="text-lg text-gray-600">
                    Here's how your venues are performing
                  </p>
                </div>
                
                {user?.roles && user.roles.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Switch to:</span>
                    <div className="flex gap-2">
                      {user.roles.includes('organizer') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            localStorage.setItem('activeRole', 'organizer');
                            window.location.href = createPageUrl('Dashboard');
                          }}
                        >
                          Organizer
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
                          Provider
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Key Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard
                title="Total Venues"
                value={stats.venues}
                icon={<Building />}
                description={`${stats.activeVenues} active listings`}
                color="blue"
              />
              <StatCard
                title="Total Bookings"
                value={stats.bookings}
                icon={<CalendarCheck />}
                description={`${stats.pendingBookings} pending approval`}
                color="green"
              />
              <StatCard
                title="Total Revenue"
                value={stats.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                icon={<DollarSign />}
                description="All-time earnings"
                color="purple"
              />
              <StatCard
                title="This Month"
                value={stats.monthlyRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                icon={<TrendingUp />}
                description="Current month revenue"
                trend="+12%"
                color="orange"
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Bookings */}
              <Card className="lg:col-span-2 border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-green-600" />
                    Recent Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentBookings.length > 0 ? (
                    <div className="space-y-4">
                      {recentBookings.map(booking => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <CalendarCheck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                Booking #{booking.id.slice(-6)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(booking.created_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={
                              booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {booking.status}
                            </Badge>
                            <span className="font-semibold text-gray-900">
                              {(booking.total_cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </span>
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No bookings yet</p>
                      <p className="text-sm text-gray-400">Your bookings will appear here once you start receiving them</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Performing Venues */}
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    Top Venues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topVenues.length > 0 ? (
                    <div className="space-y-4">
                      {topVenues.map((venue, index) => (
                        <div key={venue.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {venue.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {venue.city}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {venue.bookingCount} bookings
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {venue.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">No venue data yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 text-center">
              <div className="inline-flex gap-4">
                <Link to={createPageUrl("VenueListings")}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Manage Venues
                  </Button>
                </Link>
                <Link to={createPageUrl("VenueAvailability")}>
                  <Button variant="outline">
                    Update Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </VenuePortalLayout>
    </RoleGuard>
  );
}