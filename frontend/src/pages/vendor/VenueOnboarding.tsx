import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VendorStatusBanner from "@/components/vendor/VendorStatusBanner";
import OnboardingWizardShell from "@/components/vendor/OnboardingWizardShell";
import { cn } from "@/lib/utils";
import {
  getSessionState,
  getVendorOnboardingPath,
  setVendorOnboardingStatus,
  type VendorType
} from "@/utils/session";
import { useVendorOnboarding } from "@/hooks/useVendorOnboarding";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timeWindows = ["Morning", "Afternoon", "Evening"];
const venueTypes = ["Hall", "Rooftop", "Restaurant", "Convention", "Outdoor", "Studio"];
const constraintOptions = [
  "pillars",
  "noise limit",
  "parking available",
  "indoor/outdoor"
];
const addOns = ["cleaning", "security", "AV package"];
const galleryImages = [
  "/images/marketplace/venue-hall.webp",
  "/images/marketplace/venue-rooftop.webp",
  "/images/marketplace/venue-garden.webp"
];

const steps = [
  {
    title: "Venue basics",
    subtitle: "Capture the essentials organizers need to understand your space."
  },
  {
    title: "Space & capacity",
    subtitle: "Define the footprint and realistic capacity ranges."
  },
  {
    title: "Availability",
    subtitle: "Let organizers know when your space is open."
  },
  {
    title: "Pricing",
    subtitle: "Share base pricing and add-ons to guide budget expectations."
  },
  {
    title: "Photos & preview",
    subtitle: "Choose images and review the listing summary."
  },
  {
    title: "Review & submit",
    subtitle: "Confirm details before submitting for approval."
  }
];

type FieldErrors = Record<string, string>;

const VenueOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const session = getSessionState();
  const vendorType = session.vendorType;

  React.useEffect(() => {
    if (vendorType && vendorType !== "venue_owner") {
      navigate(getVendorOnboardingPath(vendorType), { replace: true });
    }
  }, [navigate, vendorType]);

  const { draft, isSaved, updateVenueDraft } = useVendorOnboarding(vendorType);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [confirmAccurate, setConfirmAccurate] = React.useState(
    draft.venueOwner.confirmation
  );

  const focusField = (fieldId: string) => {
    const element = document.getElementById(fieldId);
    element?.focus();
  };

  const validateStep = () => {
    const nextErrors: FieldErrors = {};

    if (stepIndex === 0) {
      if (!draft.venueOwner.basics.name) nextErrors.venueName = "Venue name is required.";
      if (!draft.venueOwner.basics.location) nextErrors.location = "Location is required.";
      if (!draft.venueOwner.basics.venueType) nextErrors.venueType = "Venue type is required.";
    }
    if (stepIndex === 1) {
      if (!draft.venueOwner.space.sqft || Number(draft.venueOwner.space.sqft) <= 0) {
        nextErrors.sqft = "Square footage must be greater than 0.";
      }
      if (!draft.venueOwner.space.recommendedMax) {
        nextErrors.recommendedMax = "Recommended max is required.";
      }
      if (!draft.venueOwner.space.maxDoable) {
        nextErrors.maxDoable = "Max doable is required.";
      }
      if (
        Number(draft.venueOwner.space.maxDoable) <
        Number(draft.venueOwner.space.recommendedMax)
      ) {
        nextErrors.maxDoable = "Max doable must be greater than recommended max.";
      }
    }
    if (stepIndex === 2) {
      if (draft.venueOwner.availability.weekdays.length === 0) {
        nextErrors.weekdays = "Select at least one day.";
      }
      if (!draft.venueOwner.availability.timeWindow) {
        nextErrors.timeWindow = "Select a time window.";
      }
      if (!draft.venueOwner.availability.leadTime) {
        nextErrors.leadTime = "Select a lead time.";
      }
    }
    if (stepIndex === 3) {
      if (!draft.venueOwner.pricing.basePrice || Number(draft.venueOwner.pricing.basePrice) < 0) {
        nextErrors.basePrice = "Base price is required.";
      }
      if (!draft.venueOwner.pricing.pricingModel) {
        nextErrors.pricingModel = "Select a pricing model.";
      }
    }
    if (stepIndex === 4) {
      if (draft.venueOwner.photos.selectedImages.length === 0) {
        nextErrors.photos = "Select at least one image.";
      }
    }
    if (stepIndex === 5 && !confirmAccurate) {
      nextErrors.confirmation = "Please confirm the details.";
    }

    setErrors(nextErrors);
    const firstErrorKey = Object.keys(nextErrors)[0];
    if (firstErrorKey) {
      focusField(firstErrorKey);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
      return;
    }
    updateVenueDraft({
      confirmation: confirmAccurate
    });
    setVendorOnboardingStatus("pending");
    toast.success("Submitted for admin approval.");
    navigate("/vendor/submission");
  };

  const handleBack = () => setStepIndex((prev) => Math.max(0, prev - 1));

  const toggleMultiValue = (values: string[], value: string) =>
    values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

  return (
    <div className="space-y-8">
      <VendorStatusBanner />

      <OnboardingWizardShell
        steps={steps}
        currentStep={stepIndex}
        isSaved={isSaved}
        onBack={handleBack}
        onNext={handleNext}
        canGoBack={stepIndex > 0}
        canGoNext
        nextLabel={stepIndex === steps.length - 1 ? "Submit" : "Next"}
      >
        {stepIndex === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="venueName">Venue name</Label>
              <Input
                id="venueName"
                value={draft.venueOwner.basics.name}
                onChange={(e) =>
                  updateVenueDraft({
                    basics: { ...draft.venueOwner.basics, name: e.target.value }
                  })
                }
                placeholder="Harborview Hall"
              />
              {errors.venueName && (
                <p className="text-xs text-brand-coral">{errors.venueName}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={draft.venueOwner.basics.location}
                onChange={(e) =>
                  updateVenueDraft({
                    basics: { ...draft.venueOwner.basics, location: e.target.value }
                  })
                }
                placeholder="Seaport District"
              />
              {errors.location && (
                <p className="text-xs text-brand-coral">{errors.location}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="venueType">Venue type</Label>
              <Select
                value={draft.venueOwner.basics.venueType}
                onValueChange={(value) =>
                  updateVenueDraft({
                    basics: { ...draft.venueOwner.basics, venueType: value }
                  })
                }
              >
                <SelectTrigger id="venueType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {venueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.venueType && (
                <p className="text-xs text-brand-coral">{errors.venueType}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact">Contact (optional)</Label>
              <Input
                id="contact"
                value={draft.venueOwner.basics.contact}
                onChange={(e) =>
                  updateVenueDraft({
                    basics: { ...draft.venueOwner.basics, contact: e.target.value }
                  })
                }
                placeholder="events@harborview.com"
              />
            </div>
          </div>
        )}

        {stepIndex === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="sqft">Square feet</Label>
              <Input
                id="sqft"
                type="number"
                value={draft.venueOwner.space.sqft}
                onChange={(e) =>
                  updateVenueDraft({
                    space: { ...draft.venueOwner.space, sqft: e.target.value }
                  })
                }
                placeholder="12000"
              />
              {errors.sqft && <p className="text-xs text-brand-coral">{errors.sqft}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="recommendedMax">Recommended max</Label>
              <Input
                id="recommendedMax"
                type="number"
                value={draft.venueOwner.space.recommendedMax}
                onChange={(e) =>
                  updateVenueDraft({
                    space: {
                      ...draft.venueOwner.space,
                      recommendedMax: e.target.value
                    }
                  })
                }
                placeholder="250"
              />
              {errors.recommendedMax && (
                <p className="text-xs text-brand-coral">{errors.recommendedMax}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxDoable">Max doable</Label>
              <Input
                id="maxDoable"
                type="number"
                value={draft.venueOwner.space.maxDoable}
                onChange={(e) =>
                  updateVenueDraft({
                    space: { ...draft.venueOwner.space, maxDoable: e.target.value }
                  })
                }
                placeholder="320"
              />
              {errors.maxDoable && (
                <p className="text-xs text-brand-coral">{errors.maxDoable}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Constraints</Label>
              <div className="grid gap-2">
                {constraintOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm text-gray-600">
                    <Checkbox
                      checked={draft.venueOwner.space.constraints.includes(option)}
                      onCheckedChange={() =>
                        updateVenueDraft({
                          space: {
                            ...draft.venueOwner.space,
                            constraints: toggleMultiValue(
                              draft.venueOwner.space.constraints,
                              option
                            )
                          }
                        })
                      }
                    />
                    <span className="capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {stepIndex === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Weekday availability</Label>
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]",
                      draft.venueOwner.availability.weekdays.includes(day)
                        ? "border-brand-dark bg-brand-dark text-brand-light"
                        : "border-brand-dark/20 bg-white text-brand-dark/60"
                    )}
                    onClick={() =>
                      updateVenueDraft({
                        availability: {
                          ...draft.venueOwner.availability,
                          weekdays: toggleMultiValue(
                            draft.venueOwner.availability.weekdays,
                            day
                          )
                        }
                      })
                    }
                  >
                    {day}
                  </button>
                ))}
              </div>
              {errors.weekdays && (
                <p className="mt-2 text-xs text-brand-coral">{errors.weekdays}</p>
              )}
            </div>
            <div>
              <Label className="mb-2 block">Time window</Label>
              <div className="flex flex-wrap gap-2">
                {timeWindows.map((window) => (
                  <button
                    key={window}
                    type="button"
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]",
                      draft.venueOwner.availability.timeWindow === window
                        ? "border-brand-dark bg-brand-dark text-brand-light"
                        : "border-brand-dark/20 bg-white text-brand-dark/60"
                    )}
                    onClick={() =>
                      updateVenueDraft({
                        availability: {
                          ...draft.venueOwner.availability,
                          timeWindow: window
                        }
                      })
                    }
                  >
                    {window}
                  </button>
                ))}
              </div>
              {errors.timeWindow && (
                <p className="mt-2 text-xs text-brand-coral">{errors.timeWindow}</p>
              )}
            </div>
            <div className="max-w-xs space-y-1">
              <Label htmlFor="leadTime">Lead time required</Label>
              <Select
                value={draft.venueOwner.availability.leadTime}
                onValueChange={(value) =>
                  updateVenueDraft({
                    availability: { ...draft.venueOwner.availability, leadTime: value }
                  })
                }
              >
                <SelectTrigger id="leadTime">
                  <SelectValue placeholder="Select lead time" />
                </SelectTrigger>
                <SelectContent>
                  {["3 days", "7 days", "14 days"].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.leadTime && (
                <p className="text-xs text-brand-coral">{errors.leadTime}</p>
              )}
            </div>
          </div>
        )}

        {stepIndex === 3 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="basePrice">Base price</Label>
              <Input
                id="basePrice"
                type="number"
                value={draft.venueOwner.pricing.basePrice}
                onChange={(e) =>
                  updateVenueDraft({
                    pricing: { ...draft.venueOwner.pricing, basePrice: e.target.value }
                  })
                }
                placeholder="4500"
              />
              {errors.basePrice && (
                <p className="text-xs text-brand-coral">{errors.basePrice}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="pricingModel">Pricing model</Label>
              <Select
                value={draft.venueOwner.pricing.pricingModel}
                onValueChange={(value: "per_event" | "per_hour") =>
                  updateVenueDraft({
                    pricing: { ...draft.venueOwner.pricing, pricingModel: value }
                  })
                }
              >
                <SelectTrigger id="pricingModel">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_event">Per event</SelectItem>
                  <SelectItem value="per_hour">Per hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Add-ons</Label>
              <div className="grid gap-2">
                {addOns.map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm text-gray-600">
                    <Checkbox
                      checked={draft.venueOwner.pricing.addOns.includes(option)}
                      onCheckedChange={() =>
                        updateVenueDraft({
                          pricing: {
                            ...draft.venueOwner.pricing,
                            addOns: toggleMultiValue(
                              draft.venueOwner.pricing.addOns,
                              option
                            )
                          }
                        })
                      }
                    />
                    <span className="capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={draft.venueOwner.pricing.peakPricing}
                onCheckedChange={(checked) =>
                  updateVenueDraft({
                    pricing: {
                      ...draft.venueOwner.pricing,
                      peakPricing: Boolean(checked)
                    }
                  })
                }
              />
              <Label>Enable peak pricing</Label>
            </div>
          </div>
        )}

        {stepIndex === 4 && (
          <div className="space-y-6">
            <div>
              <Label className="mb-2 block">Select gallery images</Label>
              <div className="grid gap-4 sm:grid-cols-3">
                {galleryImages.map((image) => (
                  <button
                    key={image}
                    type="button"
                    className={cn(
                      "group overflow-hidden rounded-2xl border",
                      draft.venueOwner.photos.selectedImages.includes(image)
                        ? "border-brand-teal"
                        : "border-transparent"
                    )}
                    onClick={() =>
                      updateVenueDraft({
                        photos: {
                          ...draft.venueOwner.photos,
                          selectedImages: toggleMultiValue(
                            draft.venueOwner.photos.selectedImages,
                            image
                          )
                        }
                      })
                    }
                  >
                    <img src={image} alt="Venue preview" className="h-28 w-full object-cover" />
                  </button>
                ))}
              </div>
              {errors.photos && (
                <p className="mt-2 text-xs text-brand-coral">{errors.photos}</p>
              )}
            </div>
            <div className="rounded-2xl border border-white/40 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
                Preview summary
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-brand-dark">
                    {draft.venueOwner.basics.name || "Venue name"}
                  </p>
                  <p className="text-xs text-brand-dark/60">
                    {draft.venueOwner.basics.location || "Location"} ·{" "}
                    {draft.venueOwner.space.sqft || "0"} sq ft
                  </p>
                  <p className="mt-2 text-xs text-brand-dark/60">
                    Capacity {draft.venueOwner.space.recommendedMax || "--"} /{" "}
                    {draft.venueOwner.space.maxDoable || "--"}
                  </p>
                  <p className="mt-1 text-xs text-brand-dark/60">
                    {draft.venueOwner.pricing.basePrice
                      ? `$${draft.venueOwner.pricing.basePrice}`
                      : "Pricing TBD"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-dashed border-brand-dark/10 bg-brand-light/50 p-3 text-xs text-brand-dark/40">
                    Optimized layout
                  </div>
                  <div className="rounded-xl border border-dashed border-brand-dark/10 bg-brand-light/50 p-3 text-xs text-brand-dark/40">
                    Max layout
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {stepIndex === 5 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/40 bg-white/80 p-4 text-sm text-brand-dark/70">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
                Review details
              </p>
              <p className="mt-2">
                Venue: {draft.venueOwner.basics.name || "—"} ·{" "}
                {draft.venueOwner.basics.location || "—"}
              </p>
              <p className="mt-1">
                Space: {draft.venueOwner.space.sqft || "—"} sq ft ·{" "}
                {draft.venueOwner.space.recommendedMax || "—"} recommended /{" "}
                {draft.venueOwner.space.maxDoable || "—"} max
              </p>
              <p className="mt-1">
                Pricing:{" "}
                {draft.venueOwner.pricing.basePrice
                  ? `$${draft.venueOwner.pricing.basePrice}`
                  : "—"}{" "}
                ({draft.venueOwner.pricing.pricingModel === "per_hour"
                  ? "per hour"
                  : "per event"})
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-brand-dark/70">
              <Checkbox
                checked={confirmAccurate}
                onCheckedChange={(checked) => setConfirmAccurate(Boolean(checked))}
                id="confirmation"
              />
              I confirm information is accurate.
            </label>
            {errors.confirmation && (
              <p className="text-xs text-brand-coral">{errors.confirmation}</p>
            )}
          </div>
        )}
      </OnboardingWizardShell>
    </div>
  );
};

export default VenueOnboarding;
