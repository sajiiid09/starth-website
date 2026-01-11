
import React, { useState, useRef, useLayoutEffect } from "react";
import { ContactSubmission } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Loader2,
  Building,
  Users,
  Sparkles,
  ArrowRight,
  Phone
} from "lucide-react";
import gsap from "gsap";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
    inquiry_type: "general"
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animations
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-text", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1
      })
      .from(".contact-card", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2
      }, "-=0.5");

      // Form Field Stagger (triggered after cards appear)
      if (formRef.current) {
        tl.from(formRef.current.querySelectorAll(".form-item"), {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.05
        }, "-=0.6");
      }

    }, containerRef);

    return () => ctx.revert();
  }, [submitted]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await ContactSubmission.create(formData);

      const inquiryTypes: Record<string, string> = {
        general: "General Inquiry",
        partnership: "Partnership Opportunity",
        support: "Technical Support",
        media: "Media & Press",
        careers: "Careers"
      };

      const emailBody = `
New Contact Form Submission from Strathwell

Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company || 'N/A'}
Phone: ${formData.phone || 'N/A'}
Inquiry Type: ${inquiryTypes[formData.inquiry_type] || formData.inquiry_type}
Subject: ${formData.subject}

Message:
${formData.message}
      `.trim();

      await SendEmail({
        to: "info@strathwell.com",
        subject: `Contact Form: ${formData.subject || 'General Inquiry'} - ${formData.name}`,
        body: emailBody,
        from_name: "Strathwell Contact Form"
      });

      setSubmitted(true);
      toast.success("Message sent successfully!");

      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          company: "",
          phone: "",
          subject: "",
          message: "",
          inquiry_type: "general"
        });
        setSubmitted(false);
      }, 3000);

    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Failed to send message. Please try again.");
    }

    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-brand-cream px-4">
        <Card className="w-full max-w-lg border-none bg-white shadow-2xl">
          <CardContent className="flex flex-col items-center p-12 text-center">
            <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-brand-teal/10 ring-1 ring-brand-teal/20">
              <CheckCircle2 className="h-12 w-12 text-brand-teal" />
              <div className="absolute inset-0 animate-ping rounded-full bg-brand-teal/5 duration-1000" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-brand-dark">
              Message Received
            </h1>
            <p className="mt-4 text-lg text-brand-dark/70">
              Thanks for reaching out! Our team will review your inquiry and get back to you within 24 hours.
            </p>
            <div className="mt-10 flex w-full flex-col gap-4 sm:flex-row">
              <Button 
                variant="outline" 
                onClick={() => setSubmitted(false)}
                className="flex-1 rounded-full border-brand-dark/20 hover:bg-brand-cream hover:text-brand-dark"
              >
                Send Another
              </Button>
              <a href="/AIPlanner" className="flex-1">
                <Button className="w-full rounded-full bg-brand-teal hover:bg-brand-teal/90">
                  Try AI Planner
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-brand-light">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-cream pb-20 pt-24 md:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-brand-cream to-brand-cream opacity-50" />
        
        <Container className="relative z-10 text-center">
          <div className="hero-text mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-teal/20 bg-white/50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-teal backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            Get in Touch
          </div>

          <h1 className="hero-text mx-auto max-w-4xl font-display text-5xl font-bold leading-[1.1] tracking-tight text-brand-dark md:text-7xl">
            Let's orchestrate <br />
            <span className="text-brand-teal">something extraordinary.</span>
          </h1>

          <p className="hero-text mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-brand-dark/60 md:text-xl">
            Have a project in mind or simply want to learn more about Strathwell? 
            Our team is ready to help you transform your vision into reality.
          </p>
        </Container>
      </section>

      {/* Main Content Grid */}
      <section className="relative z-20 -mt-12 pb-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12">
            
            {/* Left Column: Info & Links */}
            <div className="space-y-6 lg:col-span-4 lg:pt-12">
              {/* Info Card */}
              <div className="contact-card overflow-hidden rounded-3xl bg-white p-8 shadow-card ring-1 ring-brand-dark/5">
                <h3 className="mb-6 font-display text-xl font-semibold text-brand-dark">Contact Details</h3>
                <div className="space-y-6">
                  <div className="group flex items-start gap-4 transition-colors hover:text-brand-teal">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/30 text-brand-teal transition-transform group-hover:scale-110">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Email</p>
                      <a href="mailto:info@strathwell.com" className="font-medium text-brand-dark transition hover:text-brand-teal">
                        info@strathwell.com
                      </a>
                    </div>
                  </div>

                  <div className="group flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/30 text-brand-teal transition-transform group-hover:scale-110">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Locations</p>
                      <p className="font-medium text-brand-dark">Boston • London</p>
                    </div>
                  </div>

                  <div className="group flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/30 text-brand-teal transition-transform group-hover:scale-110">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/40">Response Time</p>
                      <p className="font-medium text-brand-dark">Within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links Card */}
              <div className="contact-card overflow-hidden rounded-3xl bg-brand-dark p-8 text-brand-light shadow-card">
                <h3 className="mb-6 font-display text-xl font-semibold">Explore More</h3>
                <div className="space-y-4">
                  <a href="/AIPlanner" className="group flex items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                    <Building className="h-5 w-5 text-brand-teal" />
                    <span className="font-medium">Plan with AI</span>
                  </a>
                  <a href="/DFY" className="group flex items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                    <Users className="h-5 w-5 text-brand-teal" />
                    <span className="font-medium">Plan with Us</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-8">
              <div className="contact-card relative overflow-hidden rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-brand-dark/5 md:p-10">
                <div className="mb-8">
                  <h2 className="font-display text-3xl font-semibold text-brand-dark">Send a Message</h2>
                  <p className="mt-2 text-brand-dark/60">
                    Tell us a bit about yourself and we'll connect you with the right team.
                  </p>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="form-item space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/50">Full Name *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your name"
                        className="h-12 rounded-xl border-brand-dark/10 bg-brand-light/50 transition-all focus-visible:border-brand-teal focus-visible:ring-1 focus-visible:ring-brand-teal"
                        required
                      />
                    </div>
                    <div className="form-item space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/50">Email Address *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="you@company.com"
                        className="h-12 rounded-xl border-brand-dark/10 bg-brand-light/50 transition-all focus-visible:border-brand-teal focus-visible:ring-1 focus-visible:ring-brand-teal"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="form-item space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/50">Company</label>
                      <Input
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        placeholder="Company name"
                        className="h-12 rounded-xl border-brand-dark/10 bg-brand-light/50 transition-all focus-visible:border-brand-teal focus-visible:ring-1 focus-visible:ring-brand-teal"
                      />
                    </div>
                    <div className="form-item space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/50">Phone</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="h-12 rounded-xl border-brand-dark/10 bg-brand-light/50 transition-all focus-visible:border-brand-teal focus-visible:ring-1 focus-visible:ring-brand-teal"
                      />
                    </div>
                  </div>

                  <div className="form-item space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/50">Topic</label>
                    <Select value={formData.inquiry_type} onValueChange={(value) => handleInputChange("inquiry_type", value)}>
                      <SelectTrigger className="h-12 rounded-xl border-brand-dark/10 bg-brand-light/50 transition-all focus:border-brand-teal focus:ring-1 focus:ring-brand-teal">
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="media">Media & Press</SelectItem>
                        <SelectItem value="careers">Careers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="form-item space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/50">Subject *</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="Brief summary"
                      className="h-12 rounded-xl border-brand-dark/10 bg-brand-light/50 transition-all focus-visible:border-brand-teal focus-visible:ring-1 focus-visible:ring-brand-teal"
                      required
                    />
                  </div>

                  <div className="form-item space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/50">Message *</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="How can we help?"
                      className="min-h-[160px] resize-none rounded-xl border-brand-dark/10 bg-brand-light/50 p-4 transition-all focus-visible:border-brand-teal focus-visible:ring-1 focus-visible:ring-brand-teal"
                      required
                    />
                  </div>

                  <div className="form-item pt-4">
                    <Button
                      type="submit"
                      disabled={loading || !formData.name || !formData.email || !formData.message}
                      className="group h-14 w-full rounded-full bg-brand-teal text-lg font-semibold text-brand-light shadow-lg transition-all hover:bg-brand-teal/90 hover:shadow-xl hover:shadow-brand-teal/20 disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Send className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          <span>Send Message</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
