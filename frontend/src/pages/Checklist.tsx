import React, { useState, useEffect } from "react";
import { Event } from "@/api/entities";
import { EventChecklist } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Circle, 
  MapPin, 
  ForkKnife, 
  MusicNotes, 
  Camera, 
  Flower, 
  Palette,
  Monitor,
  Car,
  ShieldCheck,
  FileText,
  Megaphone,
  SpinnerGap,
  Calendar,
  CurrencyDollar,
  User as UserIcon,
  Phone,
  PencilSimple,
  Eye,
  Plus
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

const eventTypeCategories = {
  corporate: ["venue", "catering", "av_tech", "transportation", "photography", "permits"],
  wedding: ["venue", "catering", "photography", "flowers", "entertainment", "decor", "transportation"],
  conference: ["venue", "catering", "av_tech", "photography", "marketing", "permits"],
  product_launch: ["venue", "catering", "av_tech", "photography", "marketing", "decor"],
  networking: ["venue", "catering", "entertainment", "photography", "permits"],
  fundraiser: ["venue", "catering", "entertainment", "photography", "marketing", "decor"],
  social: ["venue", "catering", "entertainment", "photography", "flowers", "decor"],
  other: ["venue", "catering", "entertainment", "photography"]
};

const categoryConfig = {
  venue: { label: "Venue", icon: MapPin, color: "blue" },
  catering: { label: "Food & Beverage", icon: ForkKnife, color: "green" },
  entertainment: { label: "Entertainment & Media", icon: MusicNotes, color: "purple" },
  photography: { label: "Photography", icon: Camera, color: "pink" },
  flowers: { label: "Florist & Fresh Flowers", icon: Flower, color: "rose" },
  decor: { label: "Decor", icon: Palette, color: "orange" },
  av_tech: { label: "AV & Technology", icon: Monitor, color: "indigo" },
  transportation: { label: "Transportation", icon: Car, color: "gray" },
  security: { label: "Security", icon: ShieldCheck, color: "red" },
  permits: { label: "Permits & Licenses", icon: FileText, color: "yellow" },
  marketing: { label: "Marketing", icon: Megaphone, color: "cyan" }
};

const statusConfig = {
  not_started: { label: "Not Started", color: "bg-gray-100 text-gray-800", icon: Circle },
  researching: { label: "Researching", color: "bg-blue-100 text-blue-800", icon: Circle },
  contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-800", icon: Circle },
  booked: { label: "Booked", color: "bg-green-100 text-green-800", icon: CheckCircle },
  confirmed: { label: "Confirmed", color: "bg-green-100 text-green-800", icon: CheckCircle }
};

export default function ChecklistPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        
        const userEvents = await Event.filter({ organizer_id: currentUser.id, status: ["draft", "planning", "published", "booked"] });
        setEvents(userEvents);
        
        if (userEvents.length > 0) {
          await loadEventChecklist(userEvents[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const loadEventChecklist = async (event) => {
    setSelectedEvent(event);
    
    try {
      let items = await EventChecklist.filter({ event_id: event.id });
      
      // If no checklist exists, create initial items based on event type
      if (items.length === 0) {
        const categories = eventTypeCategories[event.event_type] || eventTypeCategories.other;
        const eventDate = new Date(event.date_start);
        
        for (const category of categories) {
          // Calculate suggested due dates (venue first, then others)
          let dueDate = new Date(eventDate);
          if (category === 'venue') {
            dueDate.setDate(dueDate.getDate() - 60); // 2 months before
          } else if (['permits', 'photography', 'entertainment'].includes(category)) {
            dueDate.setDate(dueDate.getDate() - 30); // 1 month before
          } else {
            dueDate.setDate(dueDate.getDate() - 14); // 2 weeks before
          }
          
          await EventChecklist.create({
            event_id: event.id,
            category,
            due_date: dueDate.toISOString().split('T')[0]
          });
        }
        
        // Reload items after creation
        items = await EventChecklist.filter({ event_id: event.id });
      }
      
      setChecklistItems(items);
    } catch (error) {
      console.error("Error loading checklist:", error);
    }
  };

  const handleEventChange = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      loadEventChecklist(event);
    }
  };

  const updateChecklistItem = async (itemId, updates) => {
    try {
      await EventChecklist.update(itemId, updates);
      const updatedItems = await EventChecklist.filter({ event_id: selectedEvent.id });
      setChecklistItems(updatedItems);
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating checklist item:", error);
    }
  };

  const getCompletionPercentage = () => {
    if (checklistItems.length === 0) return 0;
    const completedItems = checklistItems.filter(item => ['booked', 'confirmed'].includes(item.status));
    return Math.round((completedItems.length / checklistItems.length) * 100);
  };

  const getOverallBudget = () => {
    const estimated = checklistItems.reduce((sum, item) => sum + (item.estimated_cost || 0), 0);
    const actual = checklistItems.reduce((sum, item) => sum + (item.actual_cost || 0), 0);
    return { estimated, actual };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <SpinnerGap className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const budget = getOverallBudget();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Event Planning Checklist</h1>
            <p className="text-lg text-gray-600">Track your progress across all event categories</p>
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
          <>
            {/* Event Overview */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Event Details</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Date:</span> {new Date(selectedEvent.date_start).toLocaleDateString()}</p>
                    <p><span className="font-medium">Type:</span> {selectedEvent.event_type.replace('_', ' ')}</p>
                    <p><span className="font-medium">Guests:</span> {selectedEvent.guest_count}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Progress</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Completion</span>
                      <span className="font-medium">{getCompletionPercentage()}%</span>
                    </div>
                    <Progress value={getCompletionPercentage()} className="h-2" />
                    <p className="text-xs text-gray-500">
                      {checklistItems.filter(item => ['booked', 'confirmed'].includes(item.status)).length} of {checklistItems.length} categories complete
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CurrencyDollar className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Budget</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Target Budget:</span>
                      <span className="font-medium">${selectedEvent.budget_target?.toLocaleString() || 'Not set'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Estimated:</span>
                      <span className="font-medium">${budget.estimated.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Actual:</span>
                      <span className="font-medium">${budget.actual.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add Category Button */}
            <Card className="border-none shadow-lg mb-4">
              <CardContent className="p-4">
                <Button
                  onClick={() => setEditingItem({ event_id: selectedEvent.id, category: '', status: 'not_started' })}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Category
                </Button>
              </CardContent>
            </Card>

            {/* Category Checklist */}
            <div className="grid gap-4">
              {checklistItems.map((item) => {
                const config = categoryConfig[item.category] || { label: item.category, icon: FileText, color: "gray" };
                const statusInfo = statusConfig[item.status];
                const Icon = config.icon;
                const StatusIcon = statusInfo.icon;
                const isCompleted = ['booked', 'confirmed'].includes(item.status);

                return (
                  <Card key={item.id} className={`border-none shadow-lg ${isCompleted ? 'bg-green-50' : 'bg-white'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-${config.color}-100 flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 text-${config.color}-600`} />
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{config.label}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <StatusIcon className="w-4 h-4" />
                                <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                              </div>
                              {item.due_date && (
                                <span>Due: {new Date(item.due_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {item.vendor_name && (
                            <div className="text-right text-sm">
                              <p className="font-medium text-gray-900">{item.vendor_name}</p>
                              {item.actual_cost && (
                                <p className="text-green-600">${item.actual_cost.toLocaleString()}</p>
                              )}
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingItem(item)}
                            >
                              <PencilSimple className="w-4 h-4" />
                            </Button>
                            <Link to={createPageUrl("Marketplace")}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>

                      {item.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600">{item.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Edit Modal */}
            {editingItem && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>
                      {editingItem.id ? `Edit ${categoryConfig[editingItem.category]?.label || editingItem.category}` : 'Add Custom Category'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!editingItem.id && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Category Name</label>
                        <Input
                          value={editingItem.category || ''}
                          onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                          placeholder="e.g., Lighting, Security, etc."
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <Select 
                        value={editingItem.status} 
                        onValueChange={(value) => setEditingItem({...editingItem, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Vendor Name</label>
                      <Input
                        value={editingItem.vendor_name || ''}
                        onChange={(e) => setEditingItem({...editingItem, vendor_name: e.target.value})}
                        placeholder="Enter vendor name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Contact</label>
                      <Input
                        value={editingItem.vendor_contact || ''}
                        onChange={(e) => setEditingItem({...editingItem, vendor_contact: e.target.value})}
                        placeholder="Phone or email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Actual Cost</label>
                      <Input
                        type="number"
                        value={editingItem.actual_cost || ''}
                        onChange={(e) => setEditingItem({...editingItem, actual_cost: parseFloat(e.target.value) || 0})}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Notes</label>
                      <Textarea
                        value={editingItem.notes || ''}
                        onChange={(e) => setEditingItem({...editingItem, notes: e.target.value})}
                        placeholder="Add notes or requirements"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={async () => {
                          if (editingItem.id) {
                            await updateChecklistItem(editingItem.id, editingItem);
                          } else {
                            if (!editingItem.category) {
                              toast.error("Please enter a category name");
                              return;
                            }
                            try {
                              await EventChecklist.create(editingItem);
                              const updatedItems = await EventChecklist.filter({ event_id: selectedEvent.id });
                              setChecklistItems(updatedItems);
                              setEditingItem(null);
                              toast.success("Category added successfully");
                            } catch (error) {
                              console.error("Error adding category:", error);
                              toast.error("Failed to add category");
                            }
                          }
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {editingItem.id ? 'Save Changes' : 'Add Category'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingItem(null)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-3">No Events Found</h3>
            <p className="text-gray-600 mb-6">Create an event to start planning with the checklist</p>
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