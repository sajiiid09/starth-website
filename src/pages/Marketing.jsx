import React, { useState, useEffect } from "react";
import { Event } from "@/api/entities";
import { User } from "@/api/entities";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Megaphone } from "lucide-react";
import EventMarketingDashboard from "./EventMarketingDashboard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MarketingPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await User.me();
        const userEvents = await Event.filter({ 
          organizer_id: currentUser.id, 
          status: { $in: ["draft", "planning", "published", "booked"] }
        });
        setEvents(userEvents);
        
        if (userEvents.length > 0) {
          setSelectedEvent(userEvents[0]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleEventChange = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Marketing</h1>
            <p className="text-lg text-gray-600">Manage campaigns, sponsorships, and outreach for your events.</p>
          </div>
          
          {events.length > 0 && (
            <div className="mt-4 md:mt-0">
              <Select value={selectedEvent?.id || ""} onValueChange={handleEventChange}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {selectedEvent ? (
          <EventMarketingDashboard eventId={selectedEvent.id} />
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-lg">
            <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-3">No Events to Market</h3>
            <p className="text-gray-600 mb-6">You need to create an event before you can manage its marketing.</p>
            <Link to={createPageUrl("CreateEvent")}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Create Your First Event
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}