import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import VendorStatusBanner from "@/components/vendor/VendorStatusBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getSessionState,
  setVendorOnboardingStatus,
  updateVendorProfileDraft
} from "@/utils/session";

const VendorOnboardingVenue: React.FC = () => {
  const navigate = useNavigate();
  const session = getSessionState();
  const [formData, setFormData] = React.useState({
    venueName: (session.vendorProfileDraft.venueName as string) || "",
    venueCity: (session.vendorProfileDraft.venueCity as string) || "",
    capacity: (session.vendorProfileDraft.capacity as string) || "",
    availability: (session.vendorProfileDraft.availability as string) || ""
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    const nextData = { ...formData, [field]: value };
    setFormData(nextData);
    updateVendorProfileDraft(nextData);
  };

  const handleSubmit = () => {
    setVendorOnboardingStatus("submitted");
    toast.success("Venue profile submitted for review.");
    navigate("/vendor/submission");
  };

  return (
    <div className="space-y-8">
      <VendorStatusBanner />

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Venue onboarding
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">
          Build your venue profile
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Share space details so organizers can request the right fit.
        </p>
      </div>

      <div className="grid gap-4 rounded-3xl border border-white/40 bg-white/80 p-6 shadow-card sm:grid-cols-2">
        <div>
          <Label htmlFor="venueName">Venue name</Label>
          <Input
            id="venueName"
            placeholder="Harborview Hall"
            value={formData.venueName}
            onChange={(e) => handleChange("venueName", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="venueCity">City</Label>
          <Input
            id="venueCity"
            placeholder="Boston"
            value={formData.venueCity}
            onChange={(e) => handleChange("venueCity", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="capacity">Capacity range</Label>
          <Input
            id="capacity"
            placeholder="120 - 350 guests"
            value={formData.capacity}
            onChange={(e) => handleChange("capacity", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="availability">Availability notes</Label>
          <Input
            id="availability"
            placeholder="Weekdays after 5pm, weekends open"
            value={formData.availability}
            onChange={(e) => handleChange("availability", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => {
            setVendorOnboardingStatus("draft");
            toast.info("Draft saved.");
          }}
        >
          Save draft
        </Button>
        <Button className="rounded-full bg-brand-teal text-brand-light" onClick={handleSubmit}>
          Submit for review
        </Button>
      </div>
    </div>
  );
};

export default VendorOnboardingVenue;
