import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@/components/home-v2/primitives/Container";
import Section from "@/components/home-v2/primitives/Section";
import FadeIn from "@/components/animations/FadeIn";
import PillButton from "@/components/home-v2/primitives/PillButton";
import VendorCard from "@/components/vendors/VendorCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { dummyVendors, type PublicVendor } from "@/data/dummyVendors";

const vendorTypeOptions = [
  { label: "All", value: "all" },
  { label: "Venue Owners", value: "venue_owner" },
  { label: "Service Providers", value: "service_provider" }
] as const;

type VendorTypeFilter = (typeof vendorTypeOptions)[number]["value"];

const Vendors: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [vendorType, setVendorType] = useState<VendorTypeFilter>("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const locationOptions = useMemo(() => {
    const uniqueLocations = Array.from(new Set(dummyVendors.map((vendor) => vendor.location)));
    return ["all", ...uniqueLocations];
  }, []);

  const filteredVendors = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    return dummyVendors.filter((vendor) => {
      const matchesType = vendorType === "all" || vendor.vendorType === vendorType;
      const matchesLocation = locationFilter === "all" || vendor.location === locationFilter;

      const searchableContent = [
        vendor.name,
        vendor.location,
        vendor.description,
        vendor.vendorType === "venue_owner" ? "venue owner" : "service provider",
        vendor.categories?.join(" "),
        vendor.areas?.join(" "),
        vendor.guestRange,
        vendor.sqft ? vendor.sqft.toString() : null
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = normalizedQuery.length === 0 || searchableContent.includes(normalizedQuery);

      return matchesType && matchesLocation && matchesSearch;
    });
  }, [locationFilter, searchValue, vendorType]);

  const handleViewProfile = (vendor: PublicVendor) => {
    toast("Vendor profiles are coming soon.", {
      description: `${vendor.name} will have a public showcase page shortly.`
    });
  };

  const handleInvite = (vendor: PublicVendor) => {
    toast("Invite sent", {
      description: `${vendor.name} has been invited to your blueprint (demo).`
    });
  };

  return (
    <div className="bg-brand-light">
      <Section theme="light">
        <Container>
          <FadeIn className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-teal">
              Popular Vendors
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-brand-dark md:text-5xl">
              Verified vendors for every blueprint
            </h1>
            <p className="mt-4 text-base text-brand-dark/70 md:text-lg">
              Verified venues and service providers ready for your blueprint.
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-brand-dark/50">
              Demo data — availability simulated.
            </p>
          </FadeIn>

          <FadeIn className="mt-12">
            <div className="rounded-3xl border border-white/30 bg-white/70 p-6 shadow-card backdrop-blur-xl">
              <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                <Input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search by name, service, or location"
                  className="h-11 rounded-full border-brand-dark/10 bg-brand-light/80 px-5 text-brand-dark placeholder:text-brand-dark/40"
                />
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="h-11 rounded-full border-brand-dark/10 bg-brand-light/80 px-4 text-brand-dark">
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent className="border-brand-dark/10 bg-white">
                    {locationOptions.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location === "all" ? "All locations" : location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-5 flex flex-wrap gap-3 sm:items-center">
                {vendorTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setVendorType(option.value)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition duration-200",
                      vendorType === option.value
                        ? "border-brand-teal bg-brand-teal text-brand-light"
                        : "border-brand-dark/10 bg-brand-light text-brand-dark/70 hover:border-brand-teal/50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
                <span className="w-full text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50 sm:ml-auto sm:w-auto">
                  {filteredVendors.length} results
                </span>
              </div>
            </div>
          </FadeIn>

          <FadeIn className="mt-12" staggerChildren={0.08} childSelector=".vendor-card">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredVendors.map((vendor) => (
                <div key={vendor.id} className="vendor-card h-full">
                  <VendorCard
                    vendor={vendor}
                    onViewProfile={handleViewProfile}
                    onInvite={handleInvite}
                  />
                </div>
              ))}
            </div>
          </FadeIn>
        </Container>
      </Section>

      <Section theme="cream" className="border-t border-brand-dark/10">
        <Container className="flex flex-col items-center gap-6 text-center">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-teal">
              Join the roster
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-brand-dark md:text-4xl">
              Become a vendor on Strathwell
            </h2>
            <p className="mt-3 text-base text-brand-dark/70">
              Showcase your venue or services alongside top-tier partners and grow your demand.
            </p>
          </FadeIn>
          <PillButton
            variant="primary"
            size="md"
            className="min-h-[48px]"
            onClick={() => {
              navigate(createPageUrl("AppEntry"));
            }}
          >
            Start your vendor application
          </PillButton>
        </Container>
      </Section>
    </div>
  );
};

export default Vendors;
