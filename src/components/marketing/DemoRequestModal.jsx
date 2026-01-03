
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DemoRequest } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { Loader2, Calendar, CheckCircle } from "lucide-react";
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
      
      // Reset form after 2 seconds and close
      setTimeout(() => {
        setFormData({
          full_name: "",
          email: "",
          company: "",
          role: defaultRole,
          preferred_time: "",
          notes: ""
        });
        setSubmitted(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error("Error submitting demo request:", error);
      toast.error("Failed to submit request. Please try again.");
    }

    setLoading(false);
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Request Received!
            </h3>
            <p className="text-gray-600">
              Our team will contact you within 24 hours to schedule your personalized demo.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Request a Demo</DialogTitle>
          <DialogDescription>
            See how Strathwell can transform your event planning. Our team will reach out to schedule a personalized demo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="john@company.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="company">Company / Organization</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              placeholder="Your company name"
            />
          </div>

          <div>
            <Label htmlFor="role">I am a *</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)} required>
              <SelectTrigger>
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
            <Label htmlFor="preferred_time">Preferred Time for Demo</Label>
            <Input
              id="preferred_time"
              value={formData.preferred_time}
              onChange={(e) => handleInputChange("preferred_time", e.target.value)}
              placeholder="e.g., Next week, afternoons"
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Tell us about your specific needs or questions..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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
      </DialogContent>
    </Dialog>
  );
}
