
import React, { useState, useEffect } from "react";
import { Event } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users as UsersIcon, 
  CurrencyDollar, 
  DotsThreeVertical,
  Pencil,
  Trash,
  SpinnerGap
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true); // Added: Set loading to true when data starts loading
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const userEvents = await Event.filter({ organizer_id: currentUser.id }, "-created_date");
      setEvents(userEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    }
    setLoading(false);
  };

  const deleteEvent = async (eventId) => {
    try {
      await Event.delete(eventId);
      loadData(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      planning: "bg-yellow-100 text-yellow-800", // Changed color
      published: "bg-blue-100 text-blue-800", // Added new status
      booked: "bg-green-100 text-green-800",
      completed: "bg-purple-100 text-purple-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || colors.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <SpinnerGap className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
              My Events
            </h1>
            <p className="text-lg text-gray-600">
              Manage and track all your events in one place
            </p>
          </div>
          <Link to={createPageUrl("CreateEvent")}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-4 md:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="grid gap-6">
            {events.map((event) => (
              <Card key={event.id} className="border-none shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="max-w-md">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                            {event.title}
                          </h3>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="flex-shrink-0">
                              <DotsThreeVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {/* FIX: Use asChild prop for DropdownMenuItem to properly integrate with Link */}
                            <DropdownMenuItem asChild>
                              <Link to={createPageUrl(`EditEvent?id=${event.id}`)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Event
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => deleteEvent(event.id)}
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Delete Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(event.date_start).toLocaleDateString()}
                          </span>
                        </div>
                        {event.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.city}</span>
                          </div>
                        )}
                        {event.guest_count && (
                          <div className="flex items-center gap-2">
                            <UsersIcon className="w-4 h-4" />
                            <span>{event.guest_count} guests</span>
                          </div>
                        )}
                        {event.budget_target && (
                          <div className="flex items-center gap-2">
                            <CurrencyDollar className="w-4 h-4" />
                            <span>${event.budget_target.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4 md:mt-0 md:border-l md:pl-6 flex-shrink-0">
                      <Link to={createPageUrl(`EventDetails?id=${event.id}`)}>
                        <Button variant="outline">
                          View Details
                        </Button>
                      </Link>
                      {(event.status === 'draft' || event.status === 'planning') && (
                         <Link to={createPageUrl(`EditEvent?id=${event.id}`)}>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                              Continue Planning
                            </Button>
                         </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              No events yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by creating your first event. Use our AI planner to get matched with perfect venues and vendors.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={createPageUrl("AIPlanner")}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Start with AI Planner
                </Button>
              </Link>
              <Link to={createPageUrl("CreateEvent")}>
                <Button variant="outline">
                  Create Manually
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
