import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Plan } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, SpinnerGap, MapPin, Users, CurrencyDollar, Clock, Sparkle, FolderOpen, FloppyDisk, PencilSimple, Check, X } from "@phosphor-icons/react";
import VenueCard from "../components/planner/VenueCard";
import VendorCard from "../components/planner/VendorCard";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const StatusSelector = ({ value, onChange }) => {
  const statusOptions = [
    { value: "not_contacted", label: "Not Contacted", color: "bg-gray-100 text-gray-800" },
    { value: "contacted", label: "Contacted", color: "bg-blue-100 text-blue-800" },
    { value: "booked", label: "Booked", color: "bg-green-100 text-green-800" },
  ];
  const selectedStatus = statusOptions.find(s => s.value === value) || statusOptions[0];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-40 border-none h-8 text-xs ${selectedStatus.color}`}>
        <SelectValue placeholder="Set Status" />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map(option => (
          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default function PlanDetailsPage() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [id, setId] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('id');
    if (planId) {
      setId(planId);
      fetchPlan(planId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPlan = async (planId) => {
    setLoading(true);
    try {
      const planData = await Plan.get(planId);
      setPlan(planData);
      setEditedTitle(planData.title);
    } catch (error) {
      console.error("Error fetching plan:", error);
    }
    setLoading(false);
  };

  const handleStatusChange = (type, index, newStatus) => {
    const updatedPlan = { ...plan };
    updatedPlan.recommendations_json[type][index].status = newStatus;
    setPlan(updatedPlan);
  };
  
  const handleRequestQuote = (item) => {
    // This would trigger a messaging flow in a full implementation
    alert(`Quote requested for ${item.name}. (This would open a chat in a full app)`);
  };

  const handleSavePlan = async () => {
    if (!plan) return;
    setIsSaving(true);
    try {
      await Plan.update(plan.id, {
        recommendations_json: plan.recommendations_json
      });
      toast.success("Plan saved successfully!");
    } catch(error) {
      console.error("Failed to save plan:", error);
      toast.error("Failed to save plan");
    }
    setIsSaving(false);
  };

  const handleSaveTitle = async () => {
    if (!editedTitle.trim()) {
      toast.error("Plan name cannot be empty");
      return;
    }
    try {
      await Plan.update(plan.id, { title: editedTitle });
      setPlan({ ...plan, title: editedTitle });
      setIsEditingTitle(false);
      toast.success("Plan renamed successfully!");
    } catch (error) {
      console.error("Failed to rename plan:", error);
      toast.error("Failed to rename plan");
    }
  };

  const handleCancelEdit = () => {
    setEditedTitle(plan.title);
    setIsEditingTitle(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><SpinnerGap className="w-8 h-8 animate-spin" /></div>;
  }

  if (!plan) {
    return <div className="text-center py-12">Plan not found.</div>;
  }
  
  const { venues = [], vendors = [], suggested_categories = [] } = plan.recommendations_json || {};

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div className="flex-1">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-2xl font-semibold h-12"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveTitle}>
                    <Check className="w-5 h-5 text-green-600" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                    <X className="w-5 h-5 text-red-600" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-3xl font-semibold text-gray-900">{plan.title}</h1>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => setIsEditingTitle(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <PencilSimple className="w-4 h-4 text-gray-500" />
                  </Button>
                </div>
              )}
              <p className="text-gray-600">
                {plan.event_date ? new Date(plan.event_date).toLocaleDateString() : "No date set"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSavePlan} disabled={isSaving} variant="outline">
              {isSaving ? <SpinnerGap className="w-4 h-4 mr-2 animate-spin" /> : <FloppyDisk className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
            <Link to={createPageUrl("EventBuilder") + `?planId=${plan.id}`}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Sparkle className="w-4 h-4 mr-2" />
                Create Event from Plan
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Venues */}
            <Card className="border-none shadow-lg">
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /> Recommended Venues</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                {venues.length > 0 ? venues.map((venue, index) => (
                  <div key={index}>
                    <VenueCard venue={venue} onRequestQuote={handleRequestQuote} />
                    <div className="flex justify-end -mt-4 mr-4">
                       <StatusSelector value={venue.status} onChange={(status) => handleStatusChange('venues', index, status)} />
                    </div>
                  </div>
                )) : <p className="text-gray-500">No venues recommended.</p>}
              </CardContent>
            </Card>

            {/* Vendors */}
            <Card className="border-none shadow-lg">
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-green-600" /> Recommended Vendors</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                {vendors.length > 0 ? vendors.map((vendor, index) => (
                  <div key={index}>
                    <VendorCard vendor={vendor} />
                     <div className="flex justify-end -mt-4 mr-4">
                       <StatusSelector value={vendor.status} onChange={(status) => handleStatusChange('vendors', index, status)} />
                    </div>
                  </div>
                )) : <p className="text-gray-500">No vendors recommended.</p>}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Suggested Categories */}
            <Card className="border-none shadow-lg">
              <CardHeader><CardTitle className="flex items-center gap-2"><Sparkle className="w-5 h-5 text-yellow-500" /> AI Suggestions</CardTitle></CardHeader>
              <CardContent>
                <h4 className="font-semibold text-sm mb-2">Suggested Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {suggested_categories.length > 0 ? suggested_categories.map((cat, i) => (
                    <Badge key={i} variant="secondary">{cat}</Badge>
                  )) : <p className="text-gray-500 text-sm">No categories suggested.</p>}
                </div>
              </CardContent>
            </Card>
            
            {/* Budget */}
            {plan.budget_json && (
              <Card className="border-none shadow-lg">
                <CardHeader><CardTitle className="flex items-center gap-2"><CurrencyDollar className="w-5 h-5 text-purple-600" /> Budget Summary</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Venue Estimate:</span> <span className="font-medium">${plan.budget_json.venue?.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Vendor Estimates:</span> <span className="font-medium">${plan.budget_json.vendors?.toLocaleString()}</span></div>
                    <div className="flex justify-between font-semibold border-t pt-2 mt-2"><span>Total Estimate:</span> <span>${plan.budget_json.total?.toLocaleString()}</span></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            {plan.timeline_json && (
              <Card className="border-none shadow-lg">
                <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-orange-600" /> Suggested Timeline</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {plan.timeline_json.timeline?.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm"><div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5" /><p>{item}</p></div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}