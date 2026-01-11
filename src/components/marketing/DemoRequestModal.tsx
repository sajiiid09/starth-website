
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DemoRequest } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { Loader2, Calendar, CheckCircle2, Sparkles, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DemoRequestModal({ isOpen, onClose, defaultRole = "" }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    company: "",
    role: defaultRole,
    preferred_time: "",
    notes: ""
  });

  useEffect(() => {
    if (defaultRole) {
      setFormData(prev => ({ ...prev, role: defaultRole }));
    }
  }, [defaultRole]);

  useEffect(() => {
    if (!isOpen) {
      setSubmitted(false);
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save to database
      await DemoRequest.create(formData);

      // Send notification email
      const roleNames = {
        event_organizer: "Event Organizer",
        venue_owner: "Venue Owner",
        service_provider: "Service Provider"
      };

      const emailBody = `
New Demo Request from Strathwell

Name: ${formData.full_name}
Email: ${formData.email}
Company: ${formData.company || 'N/A'}
Role: ${roleNames[formData.role] || formData.role}
Preferred Time: ${formData.preferred_time || 'Not specified'}

Notes:
${formData.notes || 'None'}
      `.trim();

      await SendEmail({
        to: "info@strathwell.com",
        subject: `New Demo Request - ${formData.full_name}`,
        body: emailBody,
        from_name: "Strathwell Demo Requests"
      });

      setSubmitted(true);
      toast.success("Demo request submitted!");

      setFormData({
        full_name: "",
        email: "",
        company: "",
        role: defaultRole,
        preferred_time: "",
        notes: ""
      });

    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request.");
    }

    setLoading(false);
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="overflow-hidden border-none bg-brand-cream p-0 shadow-2xl sm:max-w-md sm:rounded-3xl">
          <div className="flex flex-col items-center justify-center space-y-6 px-8 py-12 text-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand-teal/10 ring-1 ring-brand-teal/20">
              <CheckCircle2 className="h-10 w-10 text-brand-teal" />
              <div className="absolute inset-0 animate-ping rounded-full bg-brand-teal/5 duration-1000" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-3xl font-semibold text-brand-dark">Request Received</h3>
              <p className="text-base text-brand-dark/70">
                Thanks, {formData.full_name.split(' ')[0] || "there"}! We'll be in touch shortly to schedule your personalized walkthrough.
              </p>
            </div>
            <DialogClose asChild>
              <Button className="h-12 w-full rounded-full bg-brand-teal text-brand-light shadow-lg transition-transform hover:scale-[1.02] hover:bg-brand-teal/90 hover:shadow-xl">
                Close
              </Button>
            </DialogClose>
          </div>
          <div className="bg-brand-teal/5 px-8 py-4 text-center text-xs font-medium uppercase tracking-wider text-brand-teal">
            The Future of Event Orchestration
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden border-none bg-[#FDFBF7] p-0 shadow-2xl sm:max-w-lg sm:rounded-3xl">
        {/* Decorative Top Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-brand-teal via-brand-teal/80 to-brand-teal/60" />

        <DialogHeader className="relative px-8 pt-8 pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-brand-teal/20 bg-brand-teal/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-teal">
                  Early Access
                </span>
              </div>
              <DialogTitle className="font-display text-3xl font-semibold leading-tight text-brand-dark">
                Experience the OS
              </DialogTitle>
              <DialogDescription className="text-base text-brand-dark/70">
                Tell us about your needs and see how Strathwell optimizes event logistics.
              </DialogDescription>
            </div>
            <DialogClose className="rounded-full p-2 text-brand-dark/40 transition hover:bg-black/5 hover:text-brand-dark">
              <X className="h-5 w-5" />
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="full_name" className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/50">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="Jane Doe"
                  className="h-11 rounded-xl border-brand-dark/10 bg-white text-brand-dark shadow-sm transition-all focus-visible:border-brand-teal focus-visible:ring-1 focus-visible:ring-brand-teal"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/50">
                  Work Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="jane@company.com"
                  className="h-11 rounded-xl border-brand-dark/10 bg-white text-brand-dark shadow-sm transition-all focus-visible:border-brand-teal focus-visible:ring-1 focus-visible:ring-brand-teal"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/50">
                I am a...
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
                required
              >
                <SelectTrigger className="h-11 rounded-xl border-brand-dark/10 bg-white text-brand-dark shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal">
                  <SelectValue placeholder="Select your primary role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event_organizer">Event Organizer</SelectItem>
                  <SelectItem value="venue_owner">Venue Owner</SelectItem>
                  <SelectItem value="service_provider">Service Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company" className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/50">
                Company <span className="text-brand-dark/30 normal-case tracking-normal">(Optional)</span>
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                placeholder="Organization name"
                className="h-11 rounded-xl border-brand-dark/10 bg-white text-brand-dark shadow-sm transition-all focus-visible:border-brand-teal focus-visible:ring-1 focus-visible:ring-brand-teal"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-[11px] font-bold uppercase tracking-widest text-brand-dark/50">
                Priorities / Questions
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="What are you looking to solve?"
                className="min-h-[100px] resize-none rounded-xl border-brand-dark/10 bg-white text-brand-dark shadow-sm transition-all focus-visible:border-brand-teal focus-visible:ring-1 focus-visible:ring-brand-teal"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="group h-12 w-full rounded-full bg-brand-teal text-base font-semibold text-brand-light shadow-lg transition-all hover:bg-brand-teal/90 hover:shadow-xl hover:shadow-brand-teal/20"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Schedule Demo</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer / Trust Section */}
        <div className="bg-brand-blue/30 px-8 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-light shadow-sm">
              <Sparkles className="h-4 w-4 text-brand-teal" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-dark">
                What happens next?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-brand-dark/70">
                Our team will review your requirements and coordinate a 1-on-1 walkthrough tailored to your event type within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
