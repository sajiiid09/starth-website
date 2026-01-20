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

const VendorOnboardingService: React.FC = () => {
  const navigate = useNavigate();
  const session = getSessionState();
  const [formData, setFormData] = React.useState({
    businessName: (session.vendorProfileDraft.businessName as string) || "",
    serviceCategory: (session.vendorProfileDraft.serviceCategory as string) || "",
    serviceArea: (session.vendorProfileDraft.serviceArea as string) || "",
    pricing: (session.vendorProfileDraft.pricing as string) || ""
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    const nextData = { ...formData, [field]: value };
    setFormData(nextData);
    updateVendorProfileDraft(nextData);
  };

  const handleSubmit = () => {
    setVendorOnboardingStatus("submitted");
    toast.success("Service profile submitted for review.");
    navigate("/vendor/submission");
  };

  return (
    <div className="space-y-8">
      <VendorStatusBanner />

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Service onboarding
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">
          Build your service profile
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Share your specialties so organizers can request quotes faster.
        </p>
      </div>

      <div className="grid gap-4 rounded-3xl border border-white/40 bg-white/80 p-6 shadow-card sm:grid-cols-2">
        <div>
          <Label htmlFor="businessName">Business name</Label>
          <Input
            id="businessName"
            placeholder="Lumen AV"
            value={formData.businessName}
            onChange={(e) => handleChange("businessName", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="serviceCategory">Primary category</Label>
          <Input
            id="serviceCategory"
            placeholder="AV, Catering, Security"
            value={formData.serviceCategory}
            onChange={(e) => handleChange("serviceCategory", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="serviceArea">Service area</Label>
          <Input
            id="serviceArea"
            placeholder="Greater Boston"
            value={formData.serviceArea}
            onChange={(e) => handleChange("serviceArea", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pricing">Starting price</Label>
          <Input
            id="pricing"
            placeholder="$1,500 per event"
            value={formData.pricing}
            onChange={(e) => handleChange("pricing", e.target.value)}
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

export default VendorOnboardingService;
