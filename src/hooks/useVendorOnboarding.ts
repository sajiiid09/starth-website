import React from "react";
import {
  getSessionState,
  updateVendorProfileDraft,
  type VendorType
} from "@/utils/session";

export type VenueBasics = {
  name: string;
  location: string;
  venueType: string;
  contact: string;
};

export type VenueSpace = {
  sqft: string;
  recommendedMax: string;
  maxDoable: string;
  constraints: string[];
};

export type VenueAvailability = {
  weekdays: string[];
  timeWindow: string;
  leadTime: string;
};

export type VenuePricing = {
  basePrice: string;
  pricingModel: "per_event" | "per_hour";
  addOns: string[];
  peakPricing: boolean;
};

export type VenuePhotos = {
  selectedImages: string[];
  uploads: string[];
};

export type VenueOnboardingDraft = {
  basics: VenueBasics;
  space: VenueSpace;
  availability: VenueAvailability;
  pricing: VenuePricing;
  photos: VenuePhotos;
  confirmation: boolean;
};

export type ServiceIdentity = {
  businessName: string;
  baseLocation: string;
  coverageAreas: string[];
  providerType: string;
};

export type ServiceDetail = {
  capacity: string;
  startingPrice: string;
  includesEquipment: boolean;
  availability: string[];
  notes: string;
};

export type ServicePortfolio = {
  images: string[];
  testimonial: string;
  certifications: string[];
};

export type ServiceOnboardingDraft = {
  identity: ServiceIdentity;
  services: string[];
  serviceDetails: Record<string, ServiceDetail>;
  portfolio: ServicePortfolio;
  confirmation: boolean;
};

export type VendorProfileDraft = {
  vendorType: VendorType | null;
  venueOwner: VenueOnboardingDraft;
  serviceProvider: ServiceOnboardingDraft;
};

const defaultVenueDraft: VenueOnboardingDraft = {
  basics: {
    name: "",
    location: "",
    venueType: "",
    contact: ""
  },
  space: {
    sqft: "",
    recommendedMax: "",
    maxDoable: "",
    constraints: []
  },
  availability: {
    weekdays: [],
    timeWindow: "",
    leadTime: ""
  },
  pricing: {
    basePrice: "",
    pricingModel: "per_event",
    addOns: [],
    peakPricing: false
  },
  photos: {
    selectedImages: [],
    uploads: []
  },
  confirmation: false
};

const defaultServiceDraft: ServiceOnboardingDraft = {
  identity: {
    businessName: "",
    baseLocation: "",
    coverageAreas: [],
    providerType: ""
  },
  services: [],
  serviceDetails: {},
  portfolio: {
    images: [],
    testimonial: "",
    certifications: []
  },
  confirmation: false
};

const getInitialDraft = (): VendorProfileDraft => {
  const session = getSessionState();
  const storedDraft = session.vendorProfileDraft as Partial<VendorProfileDraft>;

  return {
    vendorType: session.vendorType,
    venueOwner: {
      ...defaultVenueDraft,
      ...(storedDraft?.venueOwner || {})
    },
    serviceProvider: {
      ...defaultServiceDraft,
      ...(storedDraft?.serviceProvider || {})
    }
  };
};

export const useVendorOnboarding = (vendorType: VendorType | null) => {
  const [draft, setDraft] = React.useState<VendorProfileDraft>(getInitialDraft);
  const [isSaved, setIsSaved] = React.useState(true);

  React.useEffect(() => {
    setDraft((prev) => ({ ...prev, vendorType }));
  }, [vendorType]);

  React.useEffect(() => {
    setIsSaved(false);
    const timeout = window.setTimeout(() => {
      updateVendorProfileDraft(draft);
      setIsSaved(true);
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [draft]);

  const updateVenueDraft = (partial: Partial<VenueOnboardingDraft>) => {
    setDraft((prev) => ({
      ...prev,
      venueOwner: { ...prev.venueOwner, ...partial }
    }));
  };

  const updateServiceDraft = (partial: Partial<ServiceOnboardingDraft>) => {
    setDraft((prev) => ({
      ...prev,
      serviceProvider: { ...prev.serviceProvider, ...partial }
    }));
  };

  return {
    draft,
    isSaved,
    updateVenueDraft,
    updateServiceDraft
  };
};
