
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpinnerGap, PaperPlaneTilt, Sparkle } from "@phosphor-icons/react";
import { SendEmail } from "@/api/integrations";
import Container from "@/components/home-v2/primitives/Container";
import Section from "@/components/home-v2/primitives/Section";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH2 from "@/components/home-v2/primitives/DisplayH2";
import Lead from "@/components/home-v2/primitives/Lead";
import FadeIn from "@/components/animations/FadeIn";

export default function DFYForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    organization: "",
    event_goals: "",
    preferred_date: "",
    budget_range: "",
    guest_count: "",
    event_vibe: "",
    location_preference: "",
    timeline: "",
    additional_notes: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create the DFY lead record
      await onSubmit({
        ...formData,
        guest_count: parseInt(formData.guest_count) || 0
      });

      // Send email notification to Renzaire Group
      const emailBody = `
New "Plan with Us" Service Request

Contact Information:
• Name: ${formData.contact_name}
• Email: ${formData.contact_email}
• Phone: ${formData.contact_phone}
• Organization: ${formData.organization || 'N/A'}

Event Details:
• Goals & Objectives: ${formData.event_goals}
• Preferred Date: ${formData.preferred_date}
• Expected Guest Count: ${formData.guest_count || 'N/A'}
• Budget Range: ${formData.budget_range || 'N/A'}
• Location Preference: ${formData.location_preference || 'N/A'}

Event Style & Requirements:
• Event Atmosphere: ${formData.event_vibe || 'N/A'}
• Timeline & Deadlines: ${formData.timeline || 'N/A'}
• Additional Requirements: ${formData.additional_notes || 'N/A'}

---
This request was submitted through the Strathwell "Plan with Us" service form.
Please respond within 24 hours as promised on the website.
      `.trim();

      await SendEmail({
        to: "info@strathwell.com", // Changed email address from info@renzairegroup.com to info@strathwell.com
        subject: `New Plan with Us Request from ${formData.contact_name}`,
        body: emailBody,
        from_name: "Strathwell Platform"
      });

    } catch (error) {
      console.error("Error submitting form:", error);
      throw error;
    }
    
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Section theme="cream">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="flex flex-col gap-6">
            <FadeIn>
              <div className="space-y-4">
                <Eyebrow theme="cream">Request a proposal</Eyebrow>
                <DisplayH2 theme="cream">Plan with us in 24 hours.</DisplayH2>
                <Lead theme="cream">
                  Tell us about your event and we’ll deliver a tailored plan with curated venues,
                  vendors, and timelines.
                </Lead>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-card">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-teal/10">
                    <Sparkle className="h-6 w-6 text-brand-teal" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-dark">
                      Concierge response guarantee
                    </p>
                    <p className="mt-2 text-sm text-brand-dark/70">
                      We’ll confirm your intake and share the first proposal within one business day.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          <FadeIn className="lg:sticky lg:top-24">
            <Card className="border border-white/50 bg-white/90 shadow-card">
              <CardHeader className="border-b border-brand-dark/10 p-6 text-center">
                <CardTitle className="text-2xl font-semibold text-brand-dark">
                  Plan with Us
                </CardTitle>
                <p className="mt-2 text-sm text-brand-dark/70">
                  Share the essentials so we can build the right event blueprint.
                </p>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="contact_name">Full Name *</Label>
                      <Input
                        id="contact_name"
                        value={formData.contact_name}
                        onChange={(e) => handleChange("contact_name", e.target.value)}
                        placeholder="Your full name"
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_email">Email Address *</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => handleChange("contact_email", e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="contact_phone">Phone Number</Label>
                      <Input
                        id="contact_phone"
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => handleChange("contact_phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={formData.organization}
                        onChange={(e) => handleChange("organization", e.target.value)}
                        placeholder="Company or organization name"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="event_goals">Event Goals & Objectives *</Label>
                    <Textarea
                      id="event_goals"
                      value={formData.event_goals}
                      onChange={(e) => handleChange("event_goals", e.target.value)}
                      placeholder="What do you want to achieve with this event? Who is your target audience?"
                      required
                      className="mt-2 h-24"
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="preferred_date">Preferred Date *</Label>
                      <Input
                        id="preferred_date"
                        type="date"
                        value={formData.preferred_date}
                        onChange={(e) => handleChange("preferred_date", e.target.value)}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guest_count">Expected Guest Count</Label>
                      <Input
                        id="guest_count"
                        type="number"
                        value={formData.guest_count}
                        onChange={(e) => handleChange("guest_count", e.target.value)}
                        placeholder="50"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="budget_range">Budget Range</Label>
                      <Select
                        value={formData.budget_range}
                        onValueChange={(value) => handleChange("budget_range", value)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under_10k">Under $10,000</SelectItem>
                          <SelectItem value="10k_25k">$10,000 - $25,000</SelectItem>
                          <SelectItem value="25k_50k">$25,000 - $50,000</SelectItem>
                          <SelectItem value="50k_100k">$50,000 - $100,000</SelectItem>
                          <SelectItem value="100k_plus">$100,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location_preference">Location Preference</Label>
                      <Input
                        id="location_preference"
                        value={formData.location_preference}
                        onChange={(e) => handleChange("location_preference", e.target.value)}
                        placeholder="Boston, NYC, London, etc."
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="event_vibe">Event Atmosphere & Style</Label>
                    <Textarea
                      id="event_vibe"
                      value={formData.event_vibe}
                      onChange={(e) => handleChange("event_vibe", e.target.value)}
                      placeholder="Professional, casual, elegant, modern, traditional, fun, intimate..."
                      className="mt-2 h-20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="timeline">Timeline & Key Deadlines</Label>
                    <Textarea
                      id="timeline"
                      value={formData.timeline}
                      onChange={(e) => handleChange("timeline", e.target.value)}
                      placeholder="Any specific deadlines, milestones, or timeline constraints?"
                      className="mt-2 h-20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="additional_notes">Additional Requirements</Label>
                    <Textarea
                      id="additional_notes"
                      value={formData.additional_notes}
                      onChange={(e) => handleChange("additional_notes", e.target.value)}
                      placeholder="Special requirements, accessibility needs, dietary restrictions, etc."
                      className="mt-2 h-24"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !formData.contact_name ||
                      !formData.contact_email ||
                      !formData.event_goals ||
                      !formData.preferred_date
                    }
                    className="w-full rounded-full bg-brand-teal text-brand-light hover:bg-brand-dark"
                  >
                    {isSubmitting ? (
                      <>
                        <SpinnerGap className="mr-2 h-5 w-5 animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <PaperPlaneTilt className="mr-2 h-5 w-5" />
                        Request Plan with Us Service
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}
