import React, { useState } from "react";
import { Event } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Users, DollarSign, Sparkles } from "lucide-react";
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
  corporate: ["Team Building Activities", "Professional Catering", "AV Equipment & Tech", "Meeting Facilitation", "Transportation Services"],
  wedding: ["Wedding Photography", "Floral Arrangements", "Wedding Catering", "Music & Entertainment", "Wedding Planning"],
  conference: ["Speaker Management", "Registration & Check-in", "AV Equipment & Streaming", "Catering & Refreshments", "Networking Facilitation"],
  product_launch: ["Event Marketing", "Product Demonstration Setup", "Media & Press Coverage", "Premium Catering", "Brand Activation"],
  networking: ["Icebreaker Activities", "Professional Catering", "Name Badge Services", "Follow-up Coordination", "Venue Setup"],
  fundraiser: ["Auction Management", "Donation Processing", "Entertainment", "Catering Services", "Marketing & Promotion"],
  social: ["Entertainment & Music", "Party Planning", "Catering & Bar Service", "Photography", "Decorations"],
  other: ["Custom Event Planning", "Catering Services", "AV Equipment", "Photography", "General Support"]
};

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    event_type: "",
    description: "",
    date_start: null,
    date_end: null,
    city: "",
    guest_count: "",
    budget_target: "",
    style_tags: [],
    selected_categories: [],
    eventbrite_enabled: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

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

  const handleSave = async (publish = false) => {
    if (publish) setIsPublishing(true);
    else setIsSubmitting(true);

    try {
      const user = await User.me();
      
      const eventData = {
        ...formData,
        organizer_id: user.id,
        date_start: formData.date_start?.toISOString(),
        date_end: formData.date_end?.toISOString(),
        guest_count: formData.guest_count ? parseInt(formData.guest_count) : null,
        budget_target: formData.budget_target ? parseFloat(formData.budget_target) : null,
        status: publish ? "published" : "draft"
      };

      await Event.create(eventData);
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error creating event:", error);
    }
    
    if (publish) setIsPublishing(false);
    else setIsSubmitting(false);
  };

  const selectedEventType = eventTypes.find(t => t.value === formData.event_type);
  const availableCategories = formData.event_type ? eventCategories[formData.event_type] || [] : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Create Event
          </h1>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Describe what you want to do:
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Event Type Selection */}
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

            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
              <Input
                placeholder="Enter your event title..."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Textarea
                placeholder="A brief summary of your event..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="City, State or Address"
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
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
                      initialFocus
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
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Describe your event need:
                </label>
                <div className="space-y-2">
                  {availableCategories.map((category, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Checkbox
                        id={`category-${index}`}
                        checked={formData.selected_categories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <label 
                        htmlFor={`category-${index}`}
                        className="text-sm text-gray-700 cursor-pointer flex-1"
                      >
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
                Automatically create an Eventbrite event with tickets for this event
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                onClick={() => handleSave(false)}
                disabled={!formData.title || !formData.event_type || isSubmitting || isPublishing}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 text-lg font-semibold"
              >
                {isSubmitting ? "Saving Draft..." : "Save as Draft"}
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={!formData.title || !formData.event_type || isSubmitting || isPublishing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
              >
                {isPublishing ? "Publishing..." : "Publish Event"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}