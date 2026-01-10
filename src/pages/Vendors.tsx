import React from "react";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";
import VendorCard, { VendorCardData } from "@/components/vendors/VendorCard";

const vendors: VendorCardData[] = [
  {
    name: "Citrine Culinary",
    category: "Catering",
    location: "Miami, FL",
    description: "Elevated coastal menus with seamless full-service execution.",
    image: "/images/solutions/fundraiser.svg"
  },
  {
    name: "Moonlit AV",
    category: "AV & Production",
    location: "Nashville, TN",
    description: "Lighting, sound, and stage design tailored for immersive events.",
    image: "/images/solutions/lecture.svg"
  },
  {
    name: "Bloom & Beam",
    category: "Decor",
    location: "Seattle, WA",
    description: "Modern floral installations and layered tablescapes.",
    image: "/images/solutions/memorial.svg"
  },
  {
    name: "Velvet Frame",
    category: "Photography",
    location: "Denver, CO",
    description: "Editorial storytelling with highlight reels and fast turnaround.",
    image: "/images/solutions/wedding.svg"
  },
  {
    name: "Vista Venues",
    category: "Venue",
    location: "Los Angeles, CA",
    description: "Flexible industrial lofts designed for brand activations.",
    image: "/images/solutions/launch.svg"
  },
  {
    name: "Harmony Talent",
    category: "Entertainment",
    location: "Chicago, IL",
    description: "Curated live acts, DJs, and curated programming for every vibe.",
    image: "/images/solutions/retreat.svg"
  }
];

const Vendors: React.FC = () => {
  return (
    <div className="pb-24 pt-10">
      <Container>
        <FadeIn className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-teal">
            Popular Vendors
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-brand-dark md:text-5xl">
            Trusted vendor partners
          </h1>
          <p className="mt-4 text-base text-brand-dark/70 md:text-lg">
            Discover standout teams vetted for design, hospitality, and production.
          </p>
        </FadeIn>

        <FadeIn className="mt-12" staggerChildren={0.08} childSelector=".vendor-card">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor) => (
              <div key={vendor.name} className="vendor-card h-full">
                <VendorCard vendor={vendor} />
              </div>
            ))}
          </div>
        </FadeIn>
      </Container>
    </div>
  );
};

export default Vendors;
