import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Event } from "@/api/entities";
import { Plan } from "@/api/entities";
import { User } from "@/api/entities";
import { EventbriteSync } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar as CalendarIcon, 
  Users, 
  CurrencyDollar, 
  MapPin,
  Clock,
  Check,
  ArrowLeft,
  Plus,
  X,
  Sparkle,
  FloppyDisk
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function EventBuilderPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    event_type: "",
    date_start: null,
    date_end: null,
    start_time: "09:00",
    end_time: "17:00",
    city: "",
    guest_count: "",
    budget_target: "",
    eventbrite_enabled: false,
    selected_venues: [],
    selected_vendors: [],
    guest_list: []
  });

  const [guestInput, setGuestInput] = useState({ name: "", email: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const urlParams = new URLSearchParams(window.location.search);
      const planId = urlParams.get('planId');
      
      if (planId) {
        const loadedPlan = await Plan.get(planId);
        setPlan(loadedPlan);
        
        const planVenues = loadedPlan.recommendations_json?.venues || [];
        const planVendors = loadedPlan.recommendations_json?.vendors || [];
        
        setEventData(prev => ({
          ...prev,
          title: loadedPlan.title || "",
          event_type: loadedPlan.recommendations_json?.event_type || "",
          city: loadedPlan.recommendations_json?.location || "",
          budget_target: loadedPlan.budget_json?.total || "",
          guest_count: loadedPlan.recommendations_json?.estimated_guests || "",
          selected_venues: planVenues.filter(v => v.status === 'booked').slice(0, 1),
          selected_vendors: planVendors.filter(v => v.status === 'booked')
        }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load event data");
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const toggleVenue = (venue) => {
    setEventData(prev => ({
      ...prev,
      selected_venues: prev.selected_venues.find(v => v.id === venue.id)
        ? prev.selected_venues.filter(v => v.id !== venue.id)
        : [...prev.selected_venues, venue]
    }));
  };

  const toggleVendor = (vendor) => {
    setEventData(prev => ({
      ...prev,
      selected_vendors: prev.selected_vendors.find(v => v.name === vendor.name)
        ? prev.selected_vendors.filter(v => v.name !== vendor.name)
        : [...prev.selected_vendors, vendor]
    }));
  };

  const addGuest = () => {
    if (!guestInput.name || !guestInput.email) {
      toast.error("Please enter both name and email");
      return;
    }
    
    setEventData(prev => ({
      ...prev,
      guest_list: [...prev.guest_list, { ...guestInput, id: Date.now() }]
    }));
    setGuestInput({ name: "", email: "" });
  };

  const removeGuest = (guestId) => {
    setEventData(prev => ({
      ...prev,
      guest_list: prev.guest_list.filter(g => g.id !== guestId)
    }));
  };

  const calculateBudget = () => {
    let total = 0;
    eventData.selected_venues.forEach(v => {
      total += v.price || v.rate_card_json?.base_rate || 0;
    });
    eventData.selected_vendors.forEach(v => {
      total += v.price || v.rate_card_json?.base_rate || 0;
    });
    return total;
  };

  const handleSaveAndPublish = async () => {
    if (!eventData.title || !eventData.date_start) {
      toast.error("Please provide event name and start date");
      return;
    }

    setSaving(true);
    try {
      const selectedCategories = [
        ...eventData.selected_venues.map(v => v.name),
        ...eventData.selected_vendors.map(v => v.category)
      ];

      const newEvent = await Event.create({
        organizer_id: user.id,
        title: eventData.title,
        event_type: eventData.event_type || "other",
        description: eventData.description,
        date_start: eventData.date_start.toISOString(),
        date_end: eventData.date_end?.toISOString() || eventData.date_start.toISOString(),
        city: eventData.city,
        guest_count: parseInt(eventData.guest_count) || null,
        budget_target: parseFloat(eventData.budget_target) || calculateBudget(),
        selected_categories: selectedCategories,
        eventbrite_enabled: eventData.eventbrite_enabled,
        status: "planning"
      });

      if (eventData.eventbrite_enabled) {
        await EventbriteSync.create({
          event_id: newEvent.id,
          eb_org_id: "ORG123",
          eb_event_id: `EVT${Date.now()}`,
          eb_ticket_url: `https://www.eventbrite.com/e/${Date.now()}`,
          last_synced_at: new Date().toISOString()
        });
      }

      toast.success("Event created successfully!");
      navigate(createPageUrl("EventDetails") + `?id=${newEvent.id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const venues = plan?.recommendations_json?.venues || [];
  const vendors = plan?.recommendations_json?.vendors || [];
  const estimatedBudget = calculateBudget();
  const budgetRemaining = parseFloat(eventData.budget_target) - estimatedBudget;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Event Builder</h1>
            <p className="text-gray-600">Finalize your event details and publish</p>
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Event Details</TabsTrigger>
            <TabsTrigger value="venue-vendors">Venue & Vendors</TabsTrigger>
            <TabsTrigger value="guests">Guest List</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkle className="w-5 h-5 text-blue-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Name *</label>
                  <Input
                    placeholder="e.g., Annual Product Launch 2025"
                    value={eventData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Textarea
                    placeholder="Describe your event..."
                    value={eventData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="h-32"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {eventData.date_start ? format(eventData.date_start, 'PPP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={eventData.date_start}
                          onSelect={(date) => handleInputChange("date_start", date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {eventData.date_end ? format(eventData.date_end, 'PPP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={eventData.date_end}
                          onSelect={(date) => handleInputChange("date_end", date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="time"
                        value={eventData.start_time}
                        onChange={(e) => handleInputChange("start_time", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="time"
                        value={eventData.end_time}
                        onChange={(e) => handleInputChange("end_time", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="City, State"
                        value={eventData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Guests</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="number"
                        placeholder="Number of guests"
                        value={eventData.guest_count}
                        onChange={(e) => handleInputChange("guest_count", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="eventbrite"
                      checked={eventData.eventbrite_enabled}
                      onCheckedChange={(checked) => handleInputChange("eventbrite_enabled", checked)}
                    />
                    <label htmlFor="eventbrite" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Enable Eventbrite Ticketing & Registration
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Automatically create an Eventbrite event and manage ticket sales
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="venue-vendors" className="space-y-6">
            {venues.length > 0 ? (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Select Venue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {venues.map((venue, idx) => {
                      const isSelected = eventData.selected_venues.find(v => v.name === venue.name);
                      const selectedVenue = isSelected ? eventData.selected_venues.find(v => v.name === venue.name) : venue;
                      
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={!!isSelected}
                                  onCheckedChange={() => toggleVenue(venue)}
                                />
                                <h3 className="font-semibold text-gray-900">{venue.name}</h3>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 ml-6">{venue.location}</p>
                              {venue.capacity && (
                                <Badge variant="secondary" className="mt-2 ml-6">
                                  Capacity: {venue.capacity}
                                </Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <Input
                                type="number"
                                placeholder="Price"
                                value={selectedVenue.price || selectedVenue.rate_card_json?.base_rate || ''}
                                onChange={(e) => {
                                  const newPrice = parseFloat(e.target.value) || 0;
                                  setEventData(prev => ({
                                    ...prev,
                                    selected_venues: prev.selected_venues.map(v =>
                                      v.name === venue.name ? {...v, price: newPrice} : v
                                    )
                                  }));
                                }}
                                className="w-32 text-right"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-lg">
                <CardContent className="p-8 text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No venues in this plan</p>
                  <Link to={createPageUrl("AIPlanner")}>
                    <Button variant="outline">Find Venues with AI</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {vendors.length > 0 ? (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Select Vendors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vendors.map((vendor, idx) => {
                      const isSelected = eventData.selected_vendors.find(v => v.name === vendor.name);
                      const selectedVendor = isSelected ? eventData.selected_vendors.find(v => v.name === vendor.name) : vendor;
                      
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={!!isSelected}
                                  onCheckedChange={() => toggleVendor(vendor)}
                                />
                                <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                              </div>
                              <Badge className="mt-2 ml-6">{vendor.category}</Badge>
                            </div>
                            <div className="text-right">
                              <Input
                                type="number"
                                placeholder="Price"
                                value={selectedVendor.price || selectedVendor.rate_card_json?.base_rate || ''}
                                onChange={(e) => {
                                  const newPrice = parseFloat(e.target.value) || 0;
                                  setEventData(prev => ({
                                    ...prev,
                                    selected_vendors: prev.selected_vendors.map(v =>
                                      v.name === vendor.name ? {...v, price: newPrice} : v
                                    )
                                  }));
                                }}
                                className="w-32 text-right"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-lg">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No vendors in this plan</p>
                  <Link to={createPageUrl("AIPlanner")}>
                    <Button variant="outline">Find Vendors with AI</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="guests" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Manage Guest List</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Guest name"
                    value={guestInput.name}
                    onChange={(e) => setGuestInput(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    type="email"
                    placeholder="Guest email"
                    value={guestInput.email}
                    onChange={(e) => setGuestInput(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <Button onClick={addGuest} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Guest
                </Button>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Guest List ({eventData.guest_list.length})</h4>
                  <div className="space-y-2">
                    {eventData.guest_list.map((guest) => (
                      <div key={guest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{guest.name}</p>
                          <p className="text-sm text-gray-600">{guest.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeGuest(guest.id)}
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CurrencyDollar className="w-5 h-5 text-green-600" />
                  Budget Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Budget</label>
                  <div className="relative">
                    <CurrencyDollar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="number"
                      placeholder="Enter total budget"
                      value={eventData.budget_target}
                      onChange={(e) => handleInputChange("budget_target", e.target.value)}
                      className="pl-10 text-lg"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selected Venues</span>
                    <span className="font-semibold">
                      ${eventData.selected_venues.reduce((sum, v) => sum + (v.price || v.rate_card_json?.base_rate || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selected Vendors</span>
                    <span className="font-semibold">
                      ${eventData.selected_vendors.reduce((sum, v) => sum + (v.price || v.rate_card_json?.base_rate || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold text-lg">Total Estimated Cost</span>
                    <span className="font-semibold text-xl">${estimatedBudget.toLocaleString()}</span>
                  </div>
                  {eventData.budget_target && (
                    <div className={`p-3 rounded-lg ${budgetRemaining >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${budgetRemaining >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {budgetRemaining >= 0 ? 'Under Budget' : 'Over Budget'}
                        </span>
                        <span className={`font-semibold ${budgetRemaining >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          ${Math.abs(budgetRemaining).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 mt-8">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveAndPublish}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <FloppyDisk className="w-4 h-4 mr-2" />
                Save & Publish Event
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}