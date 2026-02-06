import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { SpinnerGap } from "@phosphor-icons/react";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { MarketplaceItem } from "@/data/dummyMarketplace";
import { dummyMarketplaceItems } from "@/data/dummyMarketplace";
import { fetchMarketplaceItemById } from "@/api/marketplace";

const MarketplaceDetails: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const [item, setItem] = useState<MarketplaceItem | null>(
    (location.state as { item?: MarketplaceItem })?.item ?? null
  );
  const [loading, setLoading] = useState(!item);

  useEffect(() => {
    if (item || !id) return;

    async function loadItem() {
      try {
        // Try API first
        const fetched = await fetchMarketplaceItemById(id!);
        if (fetched) {
          setItem(fetched);
          return;
        }

        // Fallback: check dummy data (for old-format IDs like "glasshouse-venue")
        const dummyItem = dummyMarketplaceItems.find((entry) => entry.id === id);
        setItem(dummyItem ?? null);
      } catch {
        // Last resort fallback to dummy data
        const dummyItem = dummyMarketplaceItems.find((entry) => entry.id === id);
        setItem(dummyItem ?? null);
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id, item]);

  const galleryImages = item?.images ?? [];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center pt-24">
        <SpinnerGap className="size-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="pb-24 pt-12">
        <Container>
          <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-white/40 bg-white/70 px-6 py-16 text-center shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-teal">
              Marketplace item not found
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-brand-dark md:text-4xl">
              This listing is no longer available.
            </h1>
            <p className="mt-3 text-base text-brand-dark/70">
              Browse the marketplace to discover other curated venues and vendors.
            </p>
            <Link
              to="/marketplace"
              className="mt-6 inline-flex items-center rounded-full border border-brand-dark/20 px-5 py-2 text-sm font-medium text-brand-dark transition hover:border-brand-dark/40 hover:bg-brand-cream"
            >
              Back to Marketplace
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-10">
      <Container>
        <FadeIn>
          <Link
            to="/marketplace"
            className="inline-flex items-center text-sm font-semibold text-brand-teal"
          >
            ← Back to Marketplace
          </Link>
        </FadeIn>

        <FadeIn className="mt-6">
          <div className="grid gap-10 rounded-3xl border border-white/40 bg-white/70 p-8 shadow-card md:grid-cols-[0.9fr_1.1fr]">
            <div className="flex items-center justify-center rounded-2xl border border-white/40 bg-brand-cream/60 p-8">
              <img src={item.image} alt={item.title} className="h-56 w-full object-contain" />
            </div>
            <div>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                {item.category}
              </Badge>
              <h1 className="mt-4 text-3xl font-semibold text-brand-dark md:text-4xl">
                {item.title}
              </h1>
              <p className="mt-3 text-base text-brand-dark/70">
                {item.fullDescription}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-brand-dark/70">
                {item.location && (
                  <span className="rounded-full border border-brand-dark/10 bg-white/80 px-4 py-2">
                    {item.location}
                  </span>
                )}
                {(item.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-brand-dark/10 bg-white/80 px-4 py-2"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="rounded-2xl border border-white/40 bg-white/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-dark/50">
                    Pricing
                  </p>
                  <p className="mt-1 text-lg font-semibold text-brand-dark">
                    {item.startingPrice || item.priceRange}
                  </p>
                </div>
                <Button
                  className="rounded-full bg-brand-teal px-6 text-brand-light hover:bg-brand-teal/90"
                  onClick={() =>
                    toast.success("Request received! Our team will follow up shortly.")
                  }
                >
                  Request proposal
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>

        {galleryImages.length > 0 && (
          <FadeIn className="mt-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {galleryImages.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="h-48 overflow-hidden rounded-2xl bg-brand-dark/5"
                >
                  <img
                    src={image}
                    alt={`${item.title} preview ${index + 1}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        <FadeIn className="mt-10">
          <Tabs defaultValue="overview" className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-card">
            <TabsList className="grid w-full max-w-md grid-cols-3 rounded-full bg-white/80 p-1 shadow-soft">
              <TabsTrigger value="overview" className="rounded-full">
                Overview
              </TabsTrigger>
              <TabsTrigger value="included" className="rounded-full">
                What's included
              </TabsTrigger>
              <TabsTrigger value="faq" className="rounded-full">
                FAQs
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/40 bg-white/80 p-5">
                  <p className="text-sm font-semibold text-brand-dark">Experience</p>
                  <p className="mt-2 text-sm text-brand-dark/70">
                    Tailored delivery for premium events, with a dedicated point of contact and on-site support.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/40 bg-white/80 p-5">
                  <p className="text-sm font-semibold text-brand-dark">Ideal for</p>
                  <p className="mt-2 text-sm text-brand-dark/70">
                    Corporate gatherings, launches, weddings, and brand activations.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="included" className="mt-6">
              <div className="grid gap-3">
                {(item.whatsIncluded || ["Custom proposal", "Dedicated support"]).map(
                  (included) => (
                    <div
                      key={included}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border border-white/40 bg-white/80 px-4 py-3",
                        "text-sm text-brand-dark/80"
                      )}
                    >
                      <span>{included}</span>
                      <span className="text-brand-teal">Included</span>
                    </div>
                  )
                )}
              </div>
            </TabsContent>
            <TabsContent value="faq" className="mt-6">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/40 bg-white/80 p-5">
                  <p className="text-sm font-semibold text-brand-dark">How do I book?</p>
                  <p className="mt-2 text-sm text-brand-dark/70">
                    Submit a proposal request and our team will confirm availability within 24 hours.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/40 bg-white/80 p-5">
                  <p className="text-sm font-semibold text-brand-dark">Can I customize the package?</p>
                  <p className="mt-2 text-sm text-brand-dark/70">
                    Yes. We'll tailor the proposal based on your guest count, style, and timeline.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </FadeIn>
      </Container>
    </div>
  );
};

export default MarketplaceDetails;
