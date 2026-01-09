
import React, { useState, useEffect, useCallback } from "react";
import { Venue } from "@/api/entities";
import { Organization } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, DollarSign, Clock, Save, Loader2 } from "lucide-react";
import RoleGuard from "../components/auth/RoleGuard";
import VenuePortalLayout from "../components/venue/VenuePortalLayout";

const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Define initial state defaults outside the component to prevent re-creation on every render
const defaultRateCard = {
  base_rate: "",
  hourly_rate: "",
  half_day_rate: "",
  full_day_rate: "",
  weekend_multiplier: "1.5",
  holiday_multiplier: "2.0",
  cleaning_fee: "",
  security_deposit: ""
};

const defaultAvailabilityRules = {
  available_days: [1, 2, 3, 4, 5, 6, 0], // Monday to Sunday
  min_booking_hours: "4",
  max_booking_hours: "12",
  advance_booking_days: "30",
  blackout_dates: [],
  operating_hours: {
    start: "08:00",
    end: "22:00"
  }
};

export default function VenueAvailabilityPage() {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rateCard, setRateCard] = useState(defaultRateCard);
  const [availabilityRules, setAvailabilityRules] = useState(defaultAvailabilityRules);

  // useCallback to memoize loadVenueData function
  const loadVenueData = useCallback((venue) => {
    // Merge default values with venue-specific values, ensuring non-existent properties default correctly
    setRateCard({ ...defaultRateCard, ...(venue.rate_card_json || {}) });
    setAvailabilityRules({ ...defaultAvailabilityRules, ...(venue.availability_rules_json || {}) });
  }, []); // Dependencies are empty as it only uses stable setters and constants

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await User.me();
        const orgs = await Organization.filter({ owner_user_id: currentUser.id, type: "venue_owner" });
        
        if (orgs.length > 0) {
          setOrganization(orgs[0]);
          const venueList = await Venue.filter({ org_id: orgs[0].id });
          setVenues(venueList);
          
          if (venueList.length > 0) {
            setSelectedVenue(venueList[0]);
            loadVenueData(venueList[0]); // Call the memoized loadVenueData
          }
        }
      } catch (error) {
        console.error("Error fetching venues:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [loadVenueData]); // Add loadVenueData to dependencies as it's used inside fetchData

  const handleVenueSelect = (venueId) => {
    const venue = venues.find(v => v.id === venueId);
    setSelectedVenue(venue);
    if (venue) {
      loadVenueData(venue); // Call the memoized loadVenueData
    } else {
      // If no venue is selected (e.g., clearing selection), reset to defaults
      setRateCard(defaultRateCard);
      setAvailabilityRules(defaultAvailabilityRules);
    }
  };

  const handleRateChange = (field, value) => {
    setRateCard(prev => ({ ...prev, [field]: value }));
  };

  const handleAvailabilityChange = (field, value) => {
    // This is safe to directly update operating_hours like this if it's always an object.
    // If it could be null, add a guard.
    if (field === "operating_hours") {
      setAvailabilityRules(prev => ({
        ...prev,
        operating_hours: {
          ...prev.operating_hours,
          ...value // value here is expected to be { start: "...", end: "..." } or partial
        }
      }));
    } else {
      setAvailabilityRules(prev => ({ ...prev, [field]: value }));
    }
  };

  const toggleAvailableDay = (dayIndex) => {
    setAvailabilityRules(prev => ({
      ...prev,
      available_days: prev.available_days.includes(dayIndex)
        ? prev.available_days.filter(d => d !== dayIndex)
        : [...prev.available_days, dayIndex]
    }));
  };

  const handleSave = async () => {
    if (!selectedVenue) return;
    
    setSaving(true);
    try {
      await Venue.update(selectedVenue.id, {
        rate_card_json: rateCard,
        availability_rules_json: availabilityRules
      });
      
      // Refresh data to reflect changes immediately
      const currentUser = await User.me();
      const orgs = await Organization.filter({ owner_user_id: currentUser.id, type: "venue_owner" });
      
      if (orgs.length > 0) {
        // Assuming orgs[0] is the correct organization, consistent with initial fetch
        const currentOrgId = orgs[0].id;
        const venueList = await Venue.filter({ org_id: currentOrgId });
        setVenues(venueList);
        
        const updatedVenue = venueList.find(v => v.id === selectedVenue.id);
        if (updatedVenue) {
          setSelectedVenue(updatedVenue);
          loadVenueData(updatedVenue); // Load updated data for the currently selected venue
        } else {
          // If the selected venue was somehow removed, reset form state
          setSelectedVenue(null);
          setRateCard(defaultRateCard);
          setAvailabilityRules(defaultAvailabilityRules);
          console.warn("Selected venue not found after save refresh. It might have been deleted.");
        }
      } else {
        // This case should ideally not happen if an organization existed initially.
        // Resetting state in case owner status changed or organization was deleted.
        setVenues([]);
        setSelectedVenue(null);
        setOrganization(null);
        setRateCard(defaultRateCard);
        setAvailabilityRules(defaultAvailabilityRules);
        console.warn("No organizations found after saving. Data consistency issue or organization removed.");
      }
    } catch (error) {
      console.error("Error saving venue data:", error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <RoleGuard requiredRole="venue_owner">
        <VenuePortalLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        </VenuePortalLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="venue_owner">
      <VenuePortalLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Availability & Pricing</h1>
              <p className="text-gray-600">Manage your venue calendar and pricing structure</p>
            </div>
            <Button onClick={handleSave} disabled={saving || !selectedVenue} className="bg-blue-600 hover:bg-blue-700">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>

          {venues.length === 0 ? (
            <Card className="border-none shadow-lg">
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-3">No Venues Found</h3>
                <p className="text-gray-600 mb-6">Create a venue first to manage availability and pricing</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Venue Selector */}
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Select Venue</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedVenue?.id || ""} onValueChange={handleVenueSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a venue to configure" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name} - {venue.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {selectedVenue && (
                <>
                  {/* Pricing Structure */}
                  <Card className="border-none shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Pricing Structure
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="base_rate">Base Rate (per event)</Label>
                          <Input
                            id="base_rate"
                            type="number"
                            value={rateCard.base_rate}
                            onChange={(e) => handleRateChange("base_rate", e.target.value)}
                            placeholder="5000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="hourly_rate">Hourly Rate</Label>
                          <Input
                            id="hourly_rate"
                            type="number"
                            value={rateCard.hourly_rate}
                            onChange={(e) => handleRateChange("hourly_rate", e.target.value)}
                            placeholder="200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="half_day_rate">Half Day Rate</Label>
                          <Input
                            id="half_day_rate"
                            type="number"
                            value={rateCard.half_day_rate}
                            onChange={(e) => handleRateChange("half_day_rate", e.target.value)}
                            placeholder="2500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="full_day_rate">Full Day Rate</Label>
                          <Input
                            id="full_day_rate"
                            type="number"
                            value={rateCard.full_day_rate}
                            onChange={(e) => handleRateChange("full_day_rate", e.target.value)}
                            placeholder="4000"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="weekend_multiplier">Weekend Multiplier</Label>
                          <Select value={rateCard.weekend_multiplier} onValueChange={(value) => handleRateChange("weekend_multiplier", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1.0">1.0x (No increase)</SelectItem>
                              <SelectItem value="1.25">1.25x (+25%)</SelectItem>
                              <SelectItem value="1.5">1.5x (+50%)</SelectItem>
                              <SelectItem value="2.0">2.0x (+100%)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="holiday_multiplier">Holiday Multiplier</Label>
                          <Select value={rateCard.holiday_multiplier} onValueChange={(value) => handleRateChange("holiday_multiplier", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1.5">1.5x (+50%)</SelectItem>
                              <SelectItem value="2.0">2.0x (+100%)</SelectItem>
                              <SelectItem value="2.5">2.5x (+150%)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cleaning_fee">Cleaning Fee</Label>
                          <Input
                            id="cleaning_fee"
                            type="number"
                            value={rateCard.cleaning_fee}
                            onChange={(e) => handleRateChange("cleaning_fee", e.target.value)}
                            placeholder="500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="security_deposit">Security Deposit</Label>
                          <Input
                            id="security_deposit"
                            type="number"
                            value={rateCard.security_deposit}
                            onChange={(e) => handleRateChange("security_deposit", e.target.value)}
                            placeholder="1000"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Availability Rules */}
                  <Card className="border-none shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Availability Rules
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Available Days */}
                      <div>
                        <Label className="text-base font-medium mb-3 block">Available Days</Label>
                        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                          {dayOfWeek.map((day, index) => (
                            <div key={day} className="flex items-center space-x-2">
                              <Checkbox
                                id={`day-${index}`}
                                checked={availabilityRules.available_days.includes(index)}
                                onCheckedChange={() => toggleAvailableDay(index)}
                              />
                              <Label htmlFor={`day-${index}`} className="text-sm cursor-pointer">
                                {day.substring(0, 3)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Operating Hours */}
                      <div>
                        <Label className="text-base font-medium mb-3 block">Operating Hours</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="start_time">Start Time</Label>
                            <Input
                              id="start_time"
                              type="time"
                              value={availabilityRules.operating_hours?.start || "08:00"}
                              onChange={(e) => handleAvailabilityChange("operating_hours", {
                                ...availabilityRules.operating_hours,
                                start: e.target.value
                              })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="end_time">End Time</Label>
                            <Input
                              id="end_time"
                              type="time"
                              value={availabilityRules.operating_hours?.end || "22:00"}
                              onChange={(e) => handleAvailabilityChange("operating_hours", {
                                ...availabilityRules.operating_hours,
                                end: e.target.value
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Booking Rules */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="min_hours">Minimum Booking (hours)</Label>
                          <Input
                            id="min_hours"
                            type="number"
                            value={availabilityRules.min_booking_hours}
                            onChange={(e) => handleAvailabilityChange("min_booking_hours", e.target.value)}
                            placeholder="4"
                          />
                        </div>
                        <div>
                          <Label htmlFor="max_hours">Maximum Booking (hours)</Label>
                          <Input
                            id="max_hours"
                            type="number"
                            value={availabilityRules.max_booking_hours}
                            onChange={(e) => handleAvailabilityChange("max_booking_hours", e.target.value)}
                            placeholder="12"
                          />
                        </div>
                        <div>
                          <Label htmlFor="advance_days">Advance Booking (days)</Label>
                          <Input
                            id="advance_days"
                            type="number"
                            value={availabilityRules.advance_booking_days}
                            onChange={(e) => handleAvailabilityChange("advance_booking_days", e.target.value)}
                            placeholder="30"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </div>
      </VenuePortalLayout>
    </RoleGuard>
  );
}
