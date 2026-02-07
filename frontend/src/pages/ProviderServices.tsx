
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Organization } from "@/api/entities";
import { Service } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SpinnerGap, Plus, Pencil, Trash, Briefcase, CheckCircle, Clock, WarningCircle, MagnifyingGlass } from "@phosphor-icons/react";
import { toast } from "sonner";
import RoleGuard from "../components/auth/RoleGuard";
import ProviderPortalLayout from "../components/provider/ProviderPortalLayout";

const serviceCategories = [
  "Venue",
  "Food & Beverage",
  "Decor",
  "Entertainment & Media",
  "Transportation",
  "Beauty and Fashion",
  "Catering",
  "Event Management",
  "Rentals",
  "Lighting & Effects",
  "Invitations & Printing",
  "Jewelry & Accessories",
  "Gifts & Souvenirs",
  "Bakery & Cakes",
  "Drinks & Beverages",
  "Security & Bouncers",
  "Event Technology (AV/Stage)",
  "Florist & Fresh Flowers",
  "Photography & Videography",
  "Kids Entertainment",
  "Fireworks & Special Effects",
  "Makeup & Styling",
  "Event Furniture",
  "Audio & DJ Services",
  "Live Performers & Bands",
  "Cultural Performances",
  "Travel & Tour Packages",
  "Destination Management",
  "Health & Wellness",
  "Childcare & Babysitting",
  "Cleaning & Housekeeping",
  "Event Insurance",
  "Transportation – Luxury Cars",
  "Transportation – Limousines",
  "Transportation – Buses",
  "Stage & Set Design"
];

const eventTypeFilters = {
  "corporate": ["Venue", "Catering", "Event Technology (AV/Stage)", "Event Management", "Transportation", "Audio & DJ Services"],
  "wedding": ["Venue", "Catering", "Photography & Videography", "Florist & Fresh Flowers", "Entertainment & Media", "Beauty and Fashion", "Bakery & Cakes"],
  "social": ["Venue", "Entertainment & Media", "Catering", "Photography & Videography", "Audio & DJ Services", "Decor"],
  "conference": ["Venue", "Event Technology (AV/Stage)", "Catering", "Event Management", "Transportation"],
  "all": serviceCategories
};

const US_STATES = [
  { name: "Alabama", abbreviation: "AL" }, { name: "Alaska", abbreviation: "AK" }, { name: "Arizona", abbreviation: "AZ" },
  { name: "Arkansas", abbreviation: "AR" }, { name: "California", abbreviation: "CA" }, { name: "Colorado", abbreviation: "CO" },
  { name: "Connecticut", abbreviation: "CT" }, { name: "Delaware", abbreviation: "DE" }, { name: "Florida", abbreviation: "FL" },
  { name: "Georgia", abbreviation: "GA" }, { name: "Hawaii", abbreviation: "HI" }, { name: "Idaho", abbreviation: "ID" },
  { name: "Illinois", abbreviation: "IL" }, { name: "Indiana", abbreviation: "IN" }, { name: "Iowa", abbreviation: "IA" },
  { name: "Kansas", abbreviation: "KS" }, { name: "Kentucky", abbreviation: "KY" }, { name: "Louisiana", abbreviation: "LA" },
  { name: "Maine", abbreviation: "ME" }, { name: "Maryland", abbreviation: "MD" }, { name: "Massachusetts", abbreviation: "MA" },
  { name: "Michigan", abbreviation: "MI" }, { name: "Minnesota", abbreviation: "MN" }, { name: "Mississippi", abbreviation: "MS" },
  { name: "Missouri", abbreviation: "MO" }, { name: "Montana", abbreviation: "MT" }, { name: "Nebraska", abbreviation: "NE" },
  { name: "Nevada", abbreviation: "NV" }, { name: "New Hampshire", abbreviation: "NH" }, { name: "New Jersey", abbreviation: "NJ" },
  { name: "New Mexico", abbreviation: "NM" }, { name: "New York", abbreviation: "NY" }, { name: "North Carolina", abbreviation: "NC" },
  { name: "North Dakota", abbreviation: "ND" }, { name: "Ohio", abbreviation: "OH" }, { name: "Oklahoma", abbreviation: "OK" },
  { name: "Oregon", abbreviation: "OR" }, { name: "Pennsylvania", abbreviation: "PA" }, { name: "Rhode Island", abbreviation: "RI" },
  { name: "South Carolina", abbreviation: "SC" }, { name: "South Dakota", abbreviation: "SD" }, { name: "Tennessee", abbreviation: "TN" },
  { name: "Texas", abbreviation: "TX" }, { name: "Utah", abbreviation: "UT" }, { name: "Vermont", abbreviation: "VT" },
  { name: "Virginia", abbreviation: "VA" }, { name: "Washington", abbreviation: "WA" }, { name: "West Virginia", abbreviation: "WV" },
  { name: "Wisconsin", abbreviation: "WI" }, { name: "Wyoming", abbreviation: "WY" }
];


export default function ProviderServicesPage() {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    city: "", // New field
    state: "", // New field
    coverage_regions: [] as string[] | string,
    rate_card_json: { base_rate: "", hourly_rate: "", notes: "" },
    website: "",
    event_types: [] as string[],
    searchQuery: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const orgs = await Organization.filter({ owner_user_id: currentUser.id, type: "service_provider" });
      let org = null;
      if (orgs.length > 0) {
        org = orgs[0];
        setOrganization(org);
      }
      
      // Fetch services - try both org_id and provider_id to ensure we get all services
      let servicesList = [];
      if (org) {
        // Try org_id first
        servicesList = await Service.filter({ org_id: org.id });
      }
      
      // If no services found with org_id, try provider_id
      if (servicesList.length === 0) {
        servicesList = await Service.filter({ provider_id: currentUser.id });
      }
      
      console.log("Fetched services on Services page:", servicesList);
      setServices(servicesList);

    } catch (error) {
      console.error("Error fetching services data:", error);
      toast.error("Failed to load services");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      city: "", // Reset new field
      state: "", // Reset new field
      coverage_regions: [],
      rate_card_json: { base_rate: "", hourly_rate: "", notes: "" },
      website: "",
      event_types: [],
      searchQuery: ""
    });
    setEditingService(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (service) => {
    setFormData({
      name: service.name || "",
      category: service.category || "",
      description: service.description || "",
      city: service.city || "", // Populate new field
      state: service.state || "", // Populate new field
      coverage_regions: service.coverage_regions || [],
      rate_card_json: service.rate_card_json || { base_rate: "", hourly_rate: "", notes: "" },
      website: service.website || "",
      event_types: service.event_types || [],
      searchQuery: "" // Reset search query when opening edit dialog
    });
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await Service.delete(serviceId);
        toast.success("Service deleted successfully");
        fetchData();
      } catch (error) {
        console.error("Error deleting service:", error);
        toast.error("Failed to delete service");
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!organization) {
      toast.error("No organization found. Please create one first.");
      return;
    }

    setIsSaving(true);

    const serviceData = {
      ...formData,
      // Ensure city and state are included
      city: formData.city,
      state: formData.state,
      coverage_regions: typeof formData.coverage_regions === 'string'
        ? formData.coverage_regions.split(',').map(r => r.trim()).filter(Boolean) // Filter out empty strings
        : formData.coverage_regions.filter(Boolean), // Ensure it's an array and clean
      rate_card_json: {
        base_rate: parseFloat(formData.rate_card_json.base_rate) || 0,
        hourly_rate: parseFloat(formData.rate_card_json.hourly_rate) || 0,
        notes: formData.rate_card_json.notes || ""
      },
      status: editingService ? editingService.status : "draft", // Preserve status on edit, or set to draft for new
      org_id: organization.id,
      provider_id: user.id
    };

    try {
      if (editingService) {
        await Service.update(editingService.id, serviceData);
        toast.success("Service updated successfully!");
      } else {
        await Service.create(serviceData);
        toast.success("Service created successfully!");
      }
      fetchData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service.");
    }
    setIsSaving(false);
  };

  const handleStatusToggle = async (service, isLive) => {
    const newStatus = isLive ? "submitted" : "hidden";

    // Optimistic UI update
    const originalServices = [...services];
    const updatedServices = services.map(s =>
      s.id === service.id ? { ...s, status: newStatus } : s
    );
    setServices(updatedServices);

    try {
      await Service.update(service.id, { status: newStatus });
      toast.success(`Service status updated to ${newStatus}.`);

      if (newStatus === "submitted") {
        await SendEmail({
          to: "info@renzairegroup.com",
          subject: `Service Submission for Approval: ${service.name}`,
          body: `
            <p>A service has been submitted for approval:</p>
            <ul>
              <li><strong>Service Name:</strong> ${service.name}</li>
              <li><strong>Provider:</strong> ${user.full_name} (${user.email})</li>
              <li><strong>Organization:</strong> ${organization.name}</li>
            </ul>
            <p>Please review and approve it in the admin dashboard.</p>
          `
        });
        toast.info("An approval request has been sent to the admin.");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update service status.");
      // Revert UI on failure
      setServices(originalServices);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "draft":
        return { icon: Pencil, color: "text-gray-500", label: "Draft" };
      case "submitted":
        return { icon: Clock, color: "text-yellow-600", label: "Pending Approval" };
      case "active":
        return { icon: CheckCircle, color: "text-green-600", label: "Live" };
      case "hidden":
        return { icon: WarningCircle, color: "text-red-600", label: "Hidden" };
      default:
        return { icon: Pencil, color: "text-gray-500", label: "Unknown" };
    }
  };

  const getFilteredCategories = (eventType) => {
    return eventTypeFilters[eventType] || serviceCategories;
  };

  const handleEventTypeChange = (eventType) => {
    setFormData(prev => {
      const newEventTypes = prev.event_types.includes(eventType)
        ? prev.event_types.filter(t => t !== eventType)
        : [...prev.event_types, eventType];
      return { ...prev, event_types: newEventTypes };
    });
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(formData.searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(formData.searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(formData.searchQuery.toLowerCase()) ||
    (service.city && service.city.toLowerCase().includes(formData.searchQuery.toLowerCase())) ||
    (service.state && service.state.toLowerCase().includes(formData.searchQuery.toLowerCase())) ||
    (service.coverage_regions && service.coverage_regions.some(region => region.toLowerCase().includes(formData.searchQuery.toLowerCase())))
  );

  if (loading) {
    return (
      <RoleGuard requiredRole="service_provider">
        <ProviderPortalLayout>
          <div className="flex items-center justify-center h-64">
            <SpinnerGap className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        </ProviderPortalLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="service_provider">
      <ProviderPortalLayout>
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">Services</h1>
                <p className="text-gray-600">Manage your service offerings</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search services..."
                    value={formData.searchQuery}
                    onChange={(e) => setFormData(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="pl-9"
                  />
                </div>
                <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </div>

            {filteredServices.length > 0 ? (
              <div className="grid gap-6">
                {filteredServices.map((service) => {
                  const statusInfo = getStatusInfo(service.status);
                  return (
                    <Card key={service.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Briefcase className="w-5 h-5 text-gray-500" />
                              <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                            </div>
                            <Badge variant="outline" className="mb-2">{service.category}</Badge>
                            <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                            {(service.city || service.state) && (
                                <p className="text-xs text-gray-500 mt-2">
                                <strong>Location:</strong> {service.city}{service.city && service.state ? ", " : ""}{service.state}
                                </p>
                            )}
                            {service.coverage_regions && service.coverage_regions.length > 0 && (
                                <p className="text-xs text-gray-500">
                                <strong>Additional Coverage:</strong> {service.coverage_regions.join(', ')}
                                </p>
                            )}
                          </div>

                          <div className="flex-shrink-0 flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Marketplace Status</span>
                              <Switch
                                checked={service.status === "active" || service.status === "submitted"}
                                onCheckedChange={(checked) => handleStatusToggle(service, checked)}
                                disabled={service.status === 'active' || service.status === 'draft'}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
                              <span className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                                <Pencil className="w-3 h-3 mr-1" /> Edit
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(service.id)}>
                                <Trash className="w-3 h-3 mr-1" /> Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-none shadow-lg">
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-gray-900 mb-3">No services yet</h3>
                  <p className="text-gray-600 mb-6">Add your first service to start receiving leads</p>
                  <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Service
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Add/Edit Service Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Wedding Photography"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="e.g., Boston"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {US_STATES.map((state) => (
                            <SelectItem key={state.abbreviation} value={state.abbreviation}>
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Types</label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {Object.keys(eventTypeFilters).filter(t => t !== 'all').map(eventType => (
                        <div key={eventType} className="flex items-center space-x-2">
                          <Checkbox
                            id={eventType}
                            checked={formData.event_types.includes(eventType)}
                            onCheckedChange={() => handleEventTypeChange(eventType)}
                          />
                          <label htmlFor={eventType} className="text-sm capitalize">{eventType}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {serviceCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your service..."
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Coverage Areas (Optional)</label>
                    <Input
                      value={Array.isArray(formData.coverage_regions) ? formData.coverage_regions.join(', ') : formData.coverage_regions}
                      onChange={(e) => setFormData(prev => ({ ...prev, coverage_regions: e.target.value }))}
                      placeholder="e.g., Cambridge, Newton, Somerville"
                    />
                    <p className="text-xs text-gray-500 mt-1">Additional cities or regions you serve beyond your primary location</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Base Rate ($)</label>
                      <Input
                        type="number"
                        value={formData.rate_card_json.base_rate}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          rate_card_json: { ...prev.rate_card_json, base_rate: e.target.value }
                        }))}
                        placeholder="Starting price"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate ($)</label>
                      <Input
                        type="number"
                        value={formData.rate_card_json.hourly_rate}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          rate_card_json: { ...prev.rate_card_json, hourly_rate: e.target.value }
                        }))}
                        placeholder="Per hour rate"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Notes</label>
                    <Textarea
                      value={formData.rate_card_json.notes}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        rate_card_json: { ...prev.rate_card_json, notes: e.target.value }
                      }))}
                      placeholder="Additional pricing information..."
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                      {isSaving ? <SpinnerGap className="w-4 h-4 mr-2 animate-spin" /> : null}
                      {editingService ? 'Update Service' : 'Add Service'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </ProviderPortalLayout>
    </RoleGuard>
  );
}
