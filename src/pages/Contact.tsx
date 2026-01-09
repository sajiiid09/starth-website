
import React, { useState } from "react";
import { ContactSubmission } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast"; // Assuming react-hot-toast is used for notifications
import {
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  Loader2,
  MessageSquare,
  Building,
  Users,
  Phone // Re-added Phone icon as the form now includes a phone number field
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "", // Re-added phone field as per requirements
    subject: "",
    message: "",
    inquiry_type: "general"
  });
  const [loading, setLoading] = useState(false); // Renamed from isSubmitting to loading
  const [submitted, setSubmitted] = useState(false); // Renamed from isSubmitted to submitted

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Using setLoading

    try {
      // Save to database
      await ContactSubmission.create(formData);

      // Define readable inquiry types for the email
      const inquiryTypes = {
        general: "General Inquiry",
        partnership: "Partnership Opportunity",
        support: "Technical Support",
        media: "Media & Press",
        careers: "Careers"
      };

      // Send notification email
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

---
Please respond to this inquiry at your earliest convenience.

To access the dashboard:
https://app.strathwell.com/auth/login
      `.trim();

      await SendEmail({
        to: "info@strathwell.com", // Updated email address
        subject: `Contact Form: ${formData.subject || 'General Inquiry'} - ${formData.name}`, // Updated subject line
        body: emailBody,
        from_name: "Strathwell Contact Form"
      });

      setSubmitted(true); // Using setSubmitted
      toast.success("Message sent successfully!"); // Added toast notification

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          company: "",
          phone: "", // Ensure phone is reset
          subject: "",
          message: "",
          inquiry_type: "general"
        });
        setSubmitted(false); // Reset submitted state to allow new submissions
      }, 2000);

    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Failed to send message. Please try again."); // Added toast notification for errors
    }

    setLoading(false); // Using setLoading
  };

  if (submitted) { // Using submitted
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-none shadow-xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Message Sent Successfully!
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Thank you for reaching out to us. Our team will review your message and get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/">
                <Button variant="outline">Back to Home</Button>
              </a>
              <a href="/AIPlanner">
                <Button className="bg-blue-600 hover:bg-blue-700">Try Plan with AI</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-sm font-medium text-blue-700 mb-6">
            <MessageSquare className="w-4 h-4" />
            Contact Us
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Let's Create Something
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Amazing Together
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Ready to transform your events? Our team of experts is here to help you orchestrate unforgettable experiences.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Get In Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <a href="mailto:info@strathwell.com" className="text-blue-600 hover:text-blue-700">
                        info@strathwell.com
                      </a>
                    </div>
                  </div>

                  {/* Phone section was removed, re-adding the Phone icon but not a direct phone link as it's not explicitly requested for this section */}
                  {/* If a static phone number should be displayed here, it would need to be added. */}
                  {/* For now, keeping it consistent with the previous 'removed phone section' in this info block. */}
                  {/* The form itself now includes a phone input. */}

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Locations</p>
                      <p className="text-gray-600">Boston • London</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Response Time</p>
                      <p className="text-gray-600">Within 24 hours</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <a href="/AIPlanner" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <Building className="w-4 h-4" />
                    Plan with AI
                  </a>
                  <a href="/DFY" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <Users className="w-4 h-4" />
                    Plan with Us
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Send us a Message
                </CardTitle>
                <p className="text-gray-600">
                  Tell us about your project and we'll get back to you with a customized solution.
                </p>
              </CardHeader>

              <CardContent className="p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company/Organization
                    </label>
                    <Input
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      placeholder="Your company name"
                    />
                  </div>

                  {/* Re-added Phone Number input field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inquiry Type
                    </label>
                    <Select value={formData.inquiry_type} onValueChange={(value) => handleInputChange("inquiry_type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select inquiry type" />
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="Brief subject of your inquiry"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Tell us about your project, event, or how we can help you..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !formData.name || !formData.email || !formData.message} // Using loading
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold strathwell-transition"
                  >
                    {loading ? ( // Using loading
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
