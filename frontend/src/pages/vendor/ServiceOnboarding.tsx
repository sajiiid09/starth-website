import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import VendorStatusBanner from "@/components/vendor/VendorStatusBanner";
import OnboardingWizardShell from "@/components/vendor/OnboardingWizardShell";
import { cn } from "@/lib/utils";
import {
  serviceAreaOptions,
  serviceCategoryOptions
} from "@/data/vendorOnboardingOptions";
import {
  getSessionState,
  getVendorOnboardingPath,
  setVendorOnboardingStatus,
  type VendorType
} from "@/utils/session";
import { useVendorOnboarding, type ServiceDetail } from "@/hooks/useVendorOnboarding";
import { Textarea } from "@/components/ui/textarea";

const providerTypes = ["Individual", "Company"];
const availabilityOptions = ["Weekdays", "Weekends"];
const portfolioImages = [
  "/images/marketplace/vendor-av.webp",
  "/images/marketplace/vendor-catering.webp",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
  "/images/marketplace/vendor-floral.webp"
];

const steps = [
  {
    title: "Provider identity",
    subtitle: "Tell organizers who you are and where you operate."
  },
  {
    title: "Select services",
    subtitle: "Choose the services you provide."
  },
  {
    title: "Service details",
    subtitle: "Add capacity, pricing, and availability for each service."
  },
  {
    title: "Portfolio / proof",
    subtitle: "Share visuals and trust signals."
  },
  {
    title: "Review & submit",
    subtitle: "Confirm details before submitting for approval."
  }
];

type FieldErrors = Record<string, string>;

const ServiceOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const session = getSessionState();
  const vendorType = session.vendorType;

  React.useEffect(() => {
    if (vendorType && vendorType !== "service_provider") {
      navigate(getVendorOnboardingPath(vendorType), { replace: true });
    }
  }, [navigate, vendorType]);

  const { draft, isSaved, updateServiceDraft } = useVendorOnboarding(vendorType);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [confirmAccurate, setConfirmAccurate] = React.useState(
    draft.serviceProvider.confirmation
  );

  const toggleMultiValue = (values: string[], value: string) =>
    values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

  const validateStep = () => {
    const nextErrors: FieldErrors = {};
    if (stepIndex === 0) {
      if (!draft.serviceProvider.identity.businessName) {
        nextErrors.businessName = "Business name is required.";
      }
      if (!draft.serviceProvider.identity.baseLocation) {
        nextErrors.baseLocation = "Base location is required.";
      }
    }
    if (stepIndex === 1) {
      if (draft.serviceProvider.services.length === 0) {
        nextErrors.services = "Select at least one service.";
      }
    }
    if (stepIndex === 2) {
      draft.serviceProvider.services.forEach((service) => {
        const details = draft.serviceProvider.serviceDetails[service];
        if (!details?.capacity) {
          nextErrors[`capacity-${service}`] = "Capacity is required.";
        }
        if (!details?.startingPrice) {
          nextErrors[`price-${service}`] = "Starting price is required.";
        }
      });
    }
    if (stepIndex === 3) {
      if (draft.serviceProvider.portfolio.images.length < 3) {
        nextErrors.portfolioImages = "Select at least 3 images.";
      }
    }
    if (stepIndex === 4 && !confirmAccurate) {
      nextErrors.confirmation = "Please confirm the details.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
      return;
    }
    updateServiceDraft({
      confirmation: confirmAccurate
    });
    setVendorOnboardingStatus("pending");
    toast.success("Submitted for admin approval.");
    navigate("/vendor/submission");
  };

  const handleBack = () => setStepIndex((prev) => Math.max(0, prev - 1));

  const updateServiceDetail = (service: string, partial: Partial<ServiceDetail>) => {
    updateServiceDraft({
      serviceDetails: {
        ...draft.serviceProvider.serviceDetails,
        [service]: {
          capacity: "",
          startingPrice: "",
          includesEquipment: false,
          availability: [],
          notes: "",
          ...draft.serviceProvider.serviceDetails[service],
          ...partial
        }
      }
    });
  };

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
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                value={draft.serviceProvider.identity.businessName}
                onChange={(e) =>
                  updateServiceDraft({
                    identity: { ...draft.serviceProvider.identity, businessName: e.target.value }
                  })
                }
                placeholder="Lumen AV"
              />
              {errors.businessName && (
                <p className="text-xs text-brand-coral">{errors.businessName}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="baseLocation">Base location</Label>
              <Input
                id="baseLocation"
                value={draft.serviceProvider.identity.baseLocation}
                onChange={(e) =>
                  updateServiceDraft({
                    identity: { ...draft.serviceProvider.identity, baseLocation: e.target.value }
                  })
                }
                placeholder="Boston, MA"
              />
              {errors.baseLocation && (
                <p className="text-xs text-brand-coral">{errors.baseLocation}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="coverageAreas">Coverage areas</Label>
              <div className="flex flex-wrap gap-2">
                {serviceAreaOptions.map((option) => {
                  const isSelected = draft.serviceProvider.identity.coverageAreas.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      className={cn(
                        "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]",
                        isSelected
                          ? "border-brand-dark bg-brand-dark text-brand-light"
                          : "border-brand-dark/20 bg-white text-brand-dark/60"
                      )}
                      onClick={() =>
                        updateServiceDraft({
                          identity: {
                            ...draft.serviceProvider.identity,
                            coverageAreas: toggleMultiValue(
                              draft.serviceProvider.identity.coverageAreas,
                              option
                            )
                          }
                        })
                      }
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="providerType">Provider type</Label>
              <div className="flex flex-wrap gap-2">
                {providerTypes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]",
                      draft.serviceProvider.identity.providerType === option
                        ? "border-brand-dark bg-brand-dark text-brand-light"
                        : "border-brand-dark/20 bg-white text-brand-dark/60"
                    )}
                    onClick={() =>
                      updateServiceDraft({
                        identity: { ...draft.serviceProvider.identity, providerType: option }
                      })
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {stepIndex === 1 && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {serviceCategoryOptions.map((service) => {
                const isSelected = draft.serviceProvider.services.includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    className={cn(
                      "rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition",
                      isSelected
                        ? "border-brand-dark bg-brand-dark text-brand-light"
                        : "border-brand-dark/15 bg-white text-brand-dark/70 hover:border-brand-dark/40"
                    )}
                    onClick={() => {
                      updateServiceDraft({
                        services: toggleMultiValue(draft.serviceProvider.services, service)
                      });
                    }}
                  >
                    {service}
                  </button>
                );
              })}
            </div>
            {errors.services && <p className="text-xs text-brand-coral">{errors.services}</p>}
          </div>
        )}

        {stepIndex === 2 && (
          <div className="space-y-4">
            {draft.serviceProvider.services.map((service) => {
              const details = draft.serviceProvider.serviceDetails[service] || {
                capacity: "",
                startingPrice: "",
                includesEquipment: false,
                availability: [],
                notes: ""
              };
              return (
                <div key={service} className="rounded-2xl border border-white/40 bg-white/80 p-4">
                  <p className="text-sm font-semibold text-brand-dark">{service}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor={`capacity-${service}`}>Capacity</Label>
                      <Input
                        id={`capacity-${service}`}
                        value={details.capacity}
                        onChange={(e) => updateServiceDetail(service, { capacity: e.target.value })}
                        placeholder="Up to 200 guests"
                      />
                      {errors[`capacity-${service}`] && (
                        <p className="text-xs text-brand-coral">
                          {errors[`capacity-${service}`]}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`price-${service}`}>Starting price</Label>
                      <Input
                        id={`price-${service}`}
                        value={details.startingPrice}
                        onChange={(e) =>
                          updateServiceDetail(service, { startingPrice: e.target.value })
                        }
                        placeholder="$1,500"
                      />
                      {errors[`price-${service}`] && (
                        <p className="text-xs text-brand-coral">
                          {errors[`price-${service}`]}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={details.includesEquipment}
                        onCheckedChange={(checked) =>
                          updateServiceDetail(service, { includesEquipment: Boolean(checked) })
                        }
                      />
                      <Label>Includes equipment</Label>
                    </div>
                    <div>
                      <Label className="mb-2 block">Availability</Label>
                      <div className="flex flex-wrap gap-2">
                        {availabilityOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={cn(
                              "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
                              details.availability.includes(option)
                                ? "border-brand-dark bg-brand-dark text-brand-light"
                                : "border-brand-dark/20 bg-white text-brand-dark/60"
                            )}
                            onClick={() =>
                              updateServiceDetail(service, {
                                availability: toggleMultiValue(details.availability, option)
                              })
                            }
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label htmlFor={`notes-${service}`}>Notes</Label>
                      <Textarea
                        id={`notes-${service}`}
                        value={details.notes}
                        onChange={(e) => updateServiceDetail(service, { notes: e.target.value })}
                        placeholder="Highlight standout offerings or packages."
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {stepIndex === 3 && (
          <div className="space-y-4">
            <Label className="mb-2 block">Select portfolio images (3-6)</Label>
            <div className="grid gap-4 sm:grid-cols-3">
              {portfolioImages.map((image) => (
                <button
                  key={image}
                  type="button"
                  className={cn(
                    "group overflow-hidden rounded-2xl border",
                    draft.serviceProvider.portfolio.images.includes(image)
                      ? "border-brand-teal"
                      : "border-transparent"
                  )}
                  onClick={() =>
                    updateServiceDraft({
                      portfolio: {
                        ...draft.serviceProvider.portfolio,
                        images: toggleMultiValue(
                          draft.serviceProvider.portfolio.images,
                          image
                        )
                      }
                    })
                  }
                >
                  <img src={image} alt="Portfolio" className="h-28 w-full object-cover" />
                </button>
              ))}
            </div>
            {errors.portfolioImages && (
              <p className="text-xs text-brand-coral">{errors.portfolioImages}</p>
            )}
            <div className="space-y-1">
              <Label htmlFor="testimonial">Testimonial (optional)</Label>
              <Textarea
                id="testimonial"
                value={draft.serviceProvider.portfolio.testimonial}
                onChange={(e) =>
                  updateServiceDraft({
                    portfolio: {
                      ...draft.serviceProvider.portfolio,
                      testimonial: e.target.value
                    }
                  })
                }
                placeholder="“They made our event feel effortless and elevated.”"
              />
            </div>
            <div>
              <Label className="mb-2 block">Certifications</Label>
              <div className="flex flex-wrap gap-2">
                {["Food safety", "Licensed & insured", "Union staff"].map((cert) => (
                  <button
                    key={cert}
                    type="button"
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]",
                      draft.serviceProvider.portfolio.certifications.includes(cert)
                        ? "border-brand-dark bg-brand-dark text-brand-light"
                        : "border-brand-dark/20 bg-white text-brand-dark/60"
                    )}
                    onClick={() =>
                      updateServiceDraft({
                        portfolio: {
                          ...draft.serviceProvider.portfolio,
                          certifications: toggleMultiValue(
                            draft.serviceProvider.portfolio.certifications,
                            cert
                          )
                        }
                      })
                    }
                  >
                    {cert}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {stepIndex === 4 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/40 bg-white/80 p-4 text-sm text-brand-dark/70">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
                Review summary
              </p>
              <p className="mt-2">
                {draft.serviceProvider.identity.businessName || "—"} ·{" "}
                {draft.serviceProvider.identity.baseLocation || "—"}
              </p>
              <p className="mt-1">
                Services: {draft.serviceProvider.services.join(", ") || "—"}
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

export default ServiceOnboarding;
