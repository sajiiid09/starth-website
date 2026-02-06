
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Event } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventMarketingDashboard from "./EventMarketingDashboard";
import CollaborationTab from "../components/events/CollaborationTab"; // Added import
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  CurrencyDollar,
  Calendar,
  SpinnerGap,
  SquaresFour,
  Megaphone
} from "@phosphor-icons/react";

export default function EventDetailsPage() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventId, setEventId] = useState(null);

  useEffect(() => {
    const loadEventData = async () => {
      setLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      setEventId(id);
      
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const events = await Event.filter();
        const foundEvent = events.find(e => e.id === id);
        setEvent(foundEvent);

        // Removed EventbriteSync fetching logic
      } catch (error) {
        console.error("Error loading event data:", error);
      }
      setLoading(false);
    };

    loadEventData();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      planning: "bg-blue-100 text-blue-800",
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

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
              <Badge className={getStatusColor(event.status)}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Badge>
            </div>
          </div>
          {/* Removed Eventbrite button */}
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mb-6">
            <TabsTrigger value="overview"><SquaresFour className="w-4 h-4 mr-2"/>Overview</TabsTrigger>
            <TabsTrigger value="collaboration"><Users className="w-4 h-4 mr-2"/>Team</TabsTrigger> {/* Added Team tab */}
            <TabsTrigger value="marketing"><Megaphone className="w-4 h-4 mr-2"/>Marketing</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle>Event Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{event.description || "No description provided."}</p>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle>Key Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Date</p>
                        <p className="text-sm text-gray-600">
                          {new Date(event.date_start).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">{event.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Guests</p>
                        <p className="text-sm text-gray-600">{event.guest_count} expected</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CurrencyDollar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">Budget</p>
                        <p className="text-sm text-gray-600">${event.budget_target?.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="collaboration"> {/* Added Collaboration tab content */}
            <CollaborationTab eventId={eventId} eventTitle={event.title} />
          </TabsContent>
          <TabsContent value="marketing">
            <EventMarketingDashboard eventId={eventId} />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
