import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Users, 
  Calendar, 
  Award,
  ArrowRight,
  ExternalLink,
  Bot
} from "lucide-react";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";

export default function FeaturedCase() {
  return (
    <section className="py-20">
      <Container>
        <FadeIn className="text-center">
          <h2 className="text-3xl font-semibold text-brand-dark md:text-4xl">
            Featured Partnership
          </h2>
          <p className="mt-4 text-lg text-brand-dark/70">
            Strathwell's AI orchestration platform powered seamless coordination for the Limitless Women in Tech Summit 2025 at Google HQ.
          </p>
        </FadeIn>

        <FadeIn className="mt-12">
          <Card className="overflow-hidden border border-white/40 bg-white/80 shadow-card">
            <div className="md:flex">
              {/* Image */}
              <div className="relative bg-brand-cream/60 md:w-1/2">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/e87b92b26_Screenshot2025-09-25at102332.png"
                  alt="Limitless Women in Tech Summit 2025"
                  className="h-full w-full object-cover"
                />
                <Badge className="absolute left-4 top-4 rounded-full bg-brand-teal text-xs text-white">
                  Flagship Event
                </Badge>
              </div>

              {/* Content */}
              <div className="p-8 md:w-1/2">
                <div className="flex h-full flex-col">
                  <div className="flex-1">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-2xl font-semibold text-brand-dark">
                        Event Overview
                      </h3>
                      <Link to={createPageUrl("AIPlanner")}>
                        <Button size="sm" variant="outline" className="border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10">
                          <Bot className="mr-1 h-4 w-4" />
                          AI Generator
                        </Button>
                      </Link>
                    </div>

                    {/* Event Details Grid */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="mb-1 flex items-center gap-2 text-xs text-brand-dark/60">
                            <MapPin className="h-4 w-4" />
                            <span className="font-medium">Location</span>
                          </div>
                          <p className="text-sm font-medium text-brand-dark">Google HQ, Mountain View</p>
                        </div>

                        <div>
                          <div className="mb-1 flex items-center gap-2 text-xs text-brand-dark/60">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Date</span>
                          </div>
                          <p className="text-sm font-medium text-brand-dark">September 18, 2025</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="mb-1 flex items-center gap-2 text-xs text-brand-dark/60">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">Attendees</span>
                          </div>
                          <p className="text-sm font-medium text-brand-dark">194 Registered</p>
                        </div>

                        <div>
                          <div className="mb-1 flex items-center gap-2 text-xs text-brand-dark/60">
                            <Award className="h-4 w-4" />
                            <span className="font-medium">Platform</span>
                          </div>
                          <p className="text-sm font-medium text-brand-dark">AI-Powered</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-8 space-y-3 border-t border-white/40 pt-6">
                    <a
                      href="https://www.eventbrite.com/e/limitless-women-in-tech-summit-2025-tickets-1505287598729?aff=ebdsshcopyurl&lang=en-us&locale=en_US&status=75&view=listing"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full rounded-full bg-brand-teal text-brand-light hover:bg-brand-teal/90">
                        View on Eventbrite
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                    <Link to={createPageUrl("DFY")}>
                      <Button variant="outline" className="w-full rounded-full">
                        Plan with Us
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>
      </Container>
    </section>
  );
}
