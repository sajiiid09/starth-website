import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Mail, Phone, ArrowLeft } from "lucide-react";
import Container from "@/components/home-v2/primitives/Container";
import Section from "@/components/home-v2/primitives/Section";
import FadeIn from "@/components/animations/FadeIn";

export default function DFYSuccess({ data }) {
  return (
    <Section theme="cream" className="min-h-screen">
      <Container>
        <div className="flex min-h-[70vh] items-center justify-center">
          <FadeIn className="w-full">
            <Card className="mx-auto w-full max-w-2xl border border-white/50 bg-white/90 shadow-card">
              <CardContent className="p-10 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-teal/10">
                  <CheckCircle className="h-8 w-8 text-brand-teal" />
                </div>

                <h1 className="text-3xl font-semibold text-brand-dark">
                  Request submitted successfully.
                </h1>

                <p className="mt-4 text-lg text-brand-dark/70">
                  Thanks for choosing Plan with Us. We’ve received your event details and our team is
                  already shaping your custom proposal.
                </p>

                <div className="mt-8 rounded-2xl border border-brand-dark/10 bg-brand-light/80 p-6 text-left">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-dark/60">
                    What happens next
                  </h3>
                  <ol className="mt-4 space-y-3 text-sm text-brand-dark/70">
                    <li>1. We review your requirements and begin venue research.</li>
                    <li>2. A concierge planner reaches out within 24 hours with your proposal.</li>
                    <li>3. We refine the plan and execute once approved.</li>
                  </ol>
                </div>

                <div className="mt-6 rounded-2xl border border-brand-teal/20 bg-brand-teal/10 p-6 text-left">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-dark/60">
                    Contact information
                  </h3>
                  <div className="mt-4 grid gap-3 text-sm text-brand-dark/70 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-brand-teal" />
                      <span>dfy@strathwell.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-brand-teal" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link to={createPageUrl("Home")}>
                    <Button variant="outline" className="flex items-center gap-2 rounded-full">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Home
                    </Button>
                  </Link>
                  <Link to={createPageUrl("AIPlanner")}>
                    <Button className="rounded-full bg-brand-teal text-brand-light hover:bg-brand-dark">
                      Try Plan with AI
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}
