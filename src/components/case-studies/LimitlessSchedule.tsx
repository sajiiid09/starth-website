
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";

export default function LimitlessSchedule() {
  return (
    <section className="py-20 bg-brand-cream/40">
      <Container>
        {/* Section Header */}
        <FadeIn className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
            <Clock className="h-4 w-4" />
            Inside Our Flagship Event
          </div>
          <h2 className="text-3xl font-semibold text-brand-dark md:text-4xl">
            Limitless Women in Tech Summit 2025
          </h2>
          <p className="mt-4 text-lg text-brand-dark/70">
            See how we orchestrated a full day of industry-leading sessions at Google HQ, connecting 194 participants with meaningful content and networking.
          </p>
        </FadeIn>

        {/* Event Images */}
        <FadeIn className="mt-12 grid gap-6 md:grid-cols-2" staggerChildren={0.08} childSelector=".image-card">
          {[
            {
              title: "Building the Future of Tech",
              description: "Industry leaders sharing insights on innovation and leadership",
              image:
                "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/fede128db_Screenshot2025-09-26at135856.png",
              alt: "Panel Discussion at Limitless Summit"
            },
            {
              title: "Allyship in Action",
              description: "Driving impact together through inclusive leadership",
              image:
                "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/6b524f4fe_Screenshot2025-09-26at135914.png",
              alt: "Allyship Panel at Limitless Summit"
            }
          ].map((item) => (
            <Card key={item.title} className="image-card overflow-hidden border border-white/40 bg-white/80 shadow-card">
              <div className="bg-brand-cream/60">
                <img src={item.image} alt={item.alt} className="h-64 w-full object-cover" />
              </div>
              <CardContent className="p-4">
                <h3 className="text-base font-semibold text-brand-dark">{item.title}</h3>
                <p className="mt-2 text-sm text-brand-dark/70">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </FadeIn>

        {/* LinkedIn Embed */}
        <FadeIn className="mt-12">
          <Card className="border border-white/40 bg-white/80 shadow-card">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-brand-dark">Event Highlights</h3>
                <p className="mt-2 text-sm text-brand-dark/70">
                  See what attendees and sponsors are saying
                </p>
              </div>
              <div className="mt-6 flex justify-center">
                <iframe
                  src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7375961992446025728?compact=1"
                  height="399"
                  width="504"
                  frameBorder="0"
                  allowFullScreen
                  title="Embedded post"
                  className="rounded-2xl border border-white/40 shadow-card"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Event Impact */}
        <FadeIn className="mt-16">
          <Card className="border-none bg-gradient-to-r from-brand-dark to-brand-teal text-brand-light shadow-card">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-semibold">Event Impact & Results</h3>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {[
                  { value: "194", label: "Tickets Sold" },
                  { value: "$10K+", label: "Business Value Generated" },
                  { value: "Sept 18", label: "Single Day Event" }
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-3xl font-semibold">{item.value}</div>
                    <p className="mt-2 text-sm text-brand-light/80">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </Container>
    </section>
  );
}
