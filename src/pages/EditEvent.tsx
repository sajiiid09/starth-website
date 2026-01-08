import React, { useState, useEffect, useCallback } from "react";
import { Event } from "@/api/entities";
import { EventbriteSync } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Users, DollarSign, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const eventTypes = [
  { value: "corporate", label: "Corporate Event", icon: "🏢" },
  { value: "wedding", label: "Wedding", icon: "💒" },
  { value: "conference", label: "Conference", icon: "🎯" },
  { value: "product_launch", label: "Product Launch", icon: "🚀" },
  { value: "networking", label: "Networking", icon: "🤝" },
  { value: "fundraiser", label: "Fundraiser", icon: "💝" },
  { value: "social", label: "Social Event", icon: "🎉" },
  { value: "other", label: "Other", icon: "📅" }
];

const eventCategories = {
  corporate: ["Team Building", "Catering", "AV Equipment", "Facilitation", "Transportation"],
  wedding: ["Photography", "Floral", "Catering", "Entertainment", "Planning"],
  conference: ["Speaker Management", "Registration", "AV & Streaming", "Catering", "Networking"],
  product_launch: ["Marketing", "Demo Setup", "Media Coverage", "Catering", "Brand Activation"],
  networking: ["Icebreakers", "Catering", "Name Badges", "Follow-up", "Venue Setup"],
  fundraiser: ["Auction Management", "Donation Processing", "Entertainment", "Catering", "Marketing"],
  social: ["Entertainment", "Party Planning", "Catering & Bar", "Photography", "Decorations"],
  other: ["Custom Planning", "Catering", "AV Equipment", "Photography", "General Support"]
};

const eventStatuses = ["draft", "planning", "published", "booked", "completed", "cancelled"];

export default function EditEventPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState(null);

  const loadEvent = useCallback(async (eventId) => {
    if (!eventId) return;
    try {
      const eventToEdit = await Event.get(eventId);
      if (eventToEdit) {
        setFormData({
          ...eventToEdit,
          date_start: eventToEdit.date_start ? new Date(eventToEdit.date_start) : null,
          date_end: eventToEdit.date_end ? new Date(eventToEdit.date_end) : null,
          selected_categories: eventToEdit.selected_categories || [],
          style_tags: eventToEdit.style_tags || [],
        });
      }
    } catch (error) {
      console.error("Error loading event:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    setId(eventId);
    loadEvent(eventId);
  }, [loadEvent]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      selected_categories: prev.selected_categories.includes(category)
        ? prev.selected_categories.filter(c => c !== category)
        : [...prev.selected_categories, category]
    }));
  };

  const handleSubmit = async () => {
    if (!formData || !id) return;
    setIsSubmitting(true);
    try {
      const eventData = {
        ...formData,
        date_start: formData.date_start?.toISOString(),
        date_end: formData.date_end?.toISOString(),
        guest_count: formData.guest_count ? parseInt(formData.guest_count) : null,
        budget_target: formData.budget_target ? parseFloat(formData.budget_target) : null,
      };
      
      await Event.update(id, eventData);

      if (eventData.status === 'published' && eventData.eventbrite_enabled) {
        const existingSync = await EventbriteSync.filter({ event_id: id });
        if (existingSync.length === 0) {
          await EventbriteSync.create({
            event_id: id,
            eb_org_id: "ORG123", // Placeholder
            eb_event_id: `EVT${Date.now()}`, // Placeholder
            eb_ticket_url: `https://www.eventbrite.com/e/${Date.now()}`, // Placeholder
            last_synced_at: new Date().toISOString()
          });
        }
      }

      navigate(createPageUrl("Events"));
    } catch (error) {
      console.error("Error updating event:", error);
    }
    setIsSubmitting(false);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!formData) {
    return <div className="text-center p-8">Event not found.</div>;
  }
  
  const availableCategories = formData.event_type ? eventCategories[formData.event_type] || [] : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Events")}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {eventStatuses.map(status => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Event Type</label>
              <div className="grid grid-cols-2 gap-3">
                {eventTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleInputChange("event_type", type.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.event_type === type.value
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="font-medium text-gray-900">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Event Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
              <Input
                placeholder="Enter your event name..."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Textarea
                placeholder="Describe your event..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="City, State"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date_start ? format(formData.date_start, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date_start}
                      onSelect={(date) => handleInputChange("date_start", date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date_end ? format(formData.date_end, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date_end}
                      onSelect={(date) => handleInputChange("date_end", date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Guest Count & Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guest Count</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="number"
                    placeholder="Expected guests"
                    value={formData.guest_count}
                    onChange={(e) => handleInputChange("guest_count", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Target</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="number"
                    placeholder="Total budget"
                    value={formData.budget_target}
                    onChange={(e) => handleInputChange("budget_target", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Event Categories */}
            {formData.event_type && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Event Needs</label>
                <div className="space-y-2">
                  {availableCategories.map((category, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Checkbox
                        id={`category-${index}`}
                        checked={formData.selected_categories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <label htmlFor={`category-${index}`} className="text-sm text-gray-700 cursor-pointer flex-1">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Eventbrite Integration */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="eventbrite"
                  checked={formData.eventbrite_enabled}
                  onCheckedChange={(checked) => handleInputChange("eventbrite_enabled", checked)}
                />
                <label htmlFor="eventbrite" className="text-sm font-medium text-gray-700">
                  Enable Eventbrite Ticketing
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                If status is 'Published', this will create/update an Eventbrite event.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-6">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}