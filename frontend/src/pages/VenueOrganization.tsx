import React, { useState, useEffect } from "react";
import { Organization } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Buildings, FloppyDisk, SpinnerGap } from "@phosphor-icons/react";
import RoleGuard from "../components/auth/RoleGuard";
import VenuePortalLayout from "../components/venue/VenuePortalLayout";

export default function VenueOrganizationPage() {
  const [organization, setOrganization] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    city: "",
    country: "",
    business_license: "",
    description: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const orgs = await Organization.filter({ owner_user_id: currentUser.id, type: "venue_owner" });
      if (orgs.length > 0) {
        const org = orgs[0];
        setOrganization(org);
        setFormData({
          name: org.name || "",
          website: org.website || "",
          city: org.city || "",
          country: org.country || "",
          business_license: org.business_license || "",
          description: org.description || ""
        });
      }
    } catch (error) {
      console.error("Error fetching organization:", error);
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (organization) {
        await Organization.update(organization.id, formData);
      } else {
        await Organization.create({
          ...formData,
          owner_user_id: user.id,
          type: "venue_owner"
        });
      }
      await fetchData();
    } catch (error) {
      console.error("Error saving organization:", error);
    }
    setSaving(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      suspended: "bg-red-100 text-red-800"
    };
    return colors[status] || colors.draft;
  };

  if (loading) {
    return (
      <RoleGuard requiredRole="venue_owner">
        <VenuePortalLayout>
          <div className="flex items-center justify-center h-64">
            <SpinnerGap className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        </VenuePortalLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="venue_owner">
      <VenuePortalLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Organization Profile</h1>
              <p className="text-gray-600">Manage your business details and information</p>
            </div>
            {organization && (
              <Badge className={getStatusColor(organization.status)}>
                {organization.status.charAt(0).toUpperCase() + organization.status.slice(1)}
              </Badge>
            )}
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Buildings className="w-5 h-5 text-blue-600" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Business Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Your venue business name"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Business city"
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
                <Label htmlFor="business_license">Business License / EIN</Label>
                <Input
                  id="business_license"
                  value={formData.business_license}
                  onChange={(e) => handleInputChange("business_license", e.target.value)}
                  placeholder="Business license number or EIN"
                />
              </div>

              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your venue business..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving || !formData.name || !formData.city || !formData.country}>
                  {saving ? (
                    <SpinnerGap className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FloppyDisk className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </VenuePortalLayout>
    </RoleGuard>
  );
}