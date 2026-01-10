
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
import { Loader2, Calendar, CheckCircle, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

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

      // Send notification email to info@strathwell.com
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

---
Please respond within 24 hours to schedule the demo.

To access the dashboard and review this request:
https://app.strathwell.com/auth/login
      `.trim();

      await SendEmail({
        to: "info@strathwell.com",
        subject: `New Demo Request - ${formData.full_name} (${roleNames[formData.role] || formData.role})`,
        body: emailBody,
        from_name: "Strathwell Demo Requests"
      });

      setSubmitted(true);
      toast.success("Demo request submitted successfully!");

      setFormData({
        full_name: "",
        email: "",
        company: "",
        role: defaultRole,
        preferred_time: "",
        notes: ""
      });

    } catch (error) {
      console.error("Error submitting demo request:", error);
      toast.error("Failed to submit request. Please try again.");
    }

    setLoading(false);
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md border border-white/40 bg-white/70 text-brand-dark shadow-2xl backdrop-blur-xl">
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-teal/10">
              <CheckCircle className="h-8 w-8 text-brand-teal" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold">Thanks — we received your request.</h3>
              <p className="mt-3 text-sm text-brand-dark/70">
                Our team will reach out shortly to schedule your personalized demo.
              </p>
            </div>
            <DialogClose asChild>
              <Button className="w-full rounded-full bg-brand-teal text-brand-light hover:bg-brand-teal/90">
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto border border-white/40 bg-white/70 text-brand-dark shadow-2xl backdrop-blur-xl">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-semibold">Request a Demo</DialogTitle>
          <DialogDescription className="text-sm text-brand-dark/70">
            See how Strathwell can transform your event planning. Our team will reach out to schedule a personalized demo.
          </DialogDescription>
          <DialogClose className="absolute right-0 top-0 rounded-full p-2 text-brand-dark/60 transition hover:bg-white/60 hover:text-brand-dark">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="full_name" className="text-sm font-semibold text-brand-dark">
              Full Name *
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
              placeholder="John Doe"
              className="mt-2 border-white/40 bg-white/80 text-brand-dark placeholder:text-brand-dark/40 focus-visible:ring-brand-teal/40"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-semibold text-brand-dark">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="john@company.com"
              className="mt-2 border-white/40 bg-white/80 text-brand-dark placeholder:text-brand-dark/40 focus-visible:ring-brand-teal/40"
              required
            />
          </div>

          <div>
            <Label htmlFor="company" className="text-sm font-semibold text-brand-dark">
              Company / Organization
            </Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              placeholder="Your company name"
              className="mt-2 border-white/40 bg-white/80 text-brand-dark placeholder:text-brand-dark/40 focus-visible:ring-brand-teal/40"
            />
          </div>

          <div>
            <Label htmlFor="role" className="text-sm font-semibold text-brand-dark">
              I am a *
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange("role", value)}
              required
            >
              <SelectTrigger className="mt-2 border-white/40 bg-white/80 text-brand-dark focus:ring-brand-teal/40">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event_organizer">Event Organizer</SelectItem>
                <SelectItem value="venue_owner">Venue Owner</SelectItem>
                <SelectItem value="service_provider">Service Provider</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="preferred_time" className="text-sm font-semibold text-brand-dark">
              Preferred Time for Demo
            </Label>
            <Input
              id="preferred_time"
              value={formData.preferred_time}
              onChange={(e) => handleInputChange("preferred_time", e.target.value)}
              placeholder="e.g., Next week, afternoons"
              className="mt-2 border-white/40 bg-white/80 text-brand-dark placeholder:text-brand-dark/40 focus-visible:ring-brand-teal/40"
            />
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-semibold text-brand-dark">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Tell us about your specific needs or questions..."
              className="mt-2 min-h-[96px] border-white/40 bg-white/80 text-brand-dark placeholder:text-brand-dark/40 focus-visible:ring-brand-teal/40"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-full border-white/40 bg-white/60 text-brand-dark hover:bg-white"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-full bg-brand-teal text-brand-light hover:bg-brand-teal/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Request Demo
                </>
              )}
            </Button>
          </div>
        </form>
        <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 text-xs text-brand-dark/70">
          <div className="flex items-center gap-2 font-semibold text-brand-dark">
            <Sparkles className="h-4 w-4 text-brand-teal" />
            What to expect
          </div>
          <p className="mt-2">
            We'll confirm a time, tailor the demo to your goals, and share next steps within 24 hours.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
