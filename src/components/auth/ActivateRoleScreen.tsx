import React, { useState } from "react";
import { User } from "@/api/entities";
import { Organization } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Users, ArrowRight, Loader2 } from "lucide-react";

export default function ActivateRoleScreen({ user, requiredRole, onRoleActivated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    website: "",
    city: "",
    country: "",
    description: ""
  });

  const roleConfig = {
    venue_owner: {
      title: "Activate Venue Owner Role",
      description: "List and manage your venues on our marketplace",
      icon: Building,
      organizationType: "venue_owner"
    },
    service_provider: {
      title: "Activate Service Provider Role", 
      description: "Offer your services to event organizers",
      icon: Users,
      organizationType: "service_provider"
    }
  };

  const config = roleConfig[requiredRole];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.organizationName || !formData.city || !formData.country) return;

    setIsSubmitting(true);
    try {
      // Create organization
      await Organization.create({
        owner_user_id: user.id,
        name: formData.organizationName,
        website: formData.website,
        city: formData.city,
        country: formData.country,
        type: config.organizationType,
        description: formData.description
      });

      // Update user roles
      const currentRoles = user.roles || ['organizer'];
      if (!currentRoles.includes(requiredRole)) {
        currentRoles.push(requiredRole);
        await User.updateMyUserData({ roles: currentRoles });
      }

      onRoleActivated();
    } catch (error) {
      console.error("Error activating role:", error);
    }
    setIsSubmitting(false);
  };

  if (!config) {
    return <div>Invalid role requested</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <config.icon className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">{config.title}</CardTitle>
          <p className="text-gray-600">{config.description}</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="organizationName">Organization Name *</Label>
              <Input
                id="organizationName"
                value={formData.organizationName}
                onChange={(e) => handleInputChange("organizationName", e.target.value)}
                placeholder="Enter your business or organization name"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <Label htmlFor="description">Business Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Tell us about your business..."
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !formData.organizationName || !formData.city || !formData.country}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "Creating Organization..." : "Activate Role"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}