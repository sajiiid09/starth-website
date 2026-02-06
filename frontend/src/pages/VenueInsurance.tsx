import React, { useState, useEffect } from "react";
import { InsurancePolicy } from "@/api/entities";
import { Document } from "@/api/entities";
import { Organization } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Upload, FileText, CheckCircle, WarningCircle, SpinnerGap, Plus, ArrowRight } from "@phosphor-icons/react";
import RoleGuard from "../components/auth/RoleGuard";
import VenuePortalLayout from "../components/venue/VenuePortalLayout";

export default function VenueInsurancePage() {
  const [policies, setPolicies] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    carrier: "",
    policy_number: "",
    coverage_types: ["General Liability"],
    coverage_amounts_json: {
      general_liability_occurrence: 1000000,
      general_liability_aggregate: 2000000
    },
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const currentUser = await User.me();
      const orgs = await Organization.filter({ owner_user_id: currentUser.id, type: "venue_owner" });
      
      if (orgs.length > 0) {
        setOrganization(orgs[0]);
        const policyList = await InsurancePolicy.filter({ org_id: orgs[0].id });
        setPolicies(policyList);
      }
    } catch (error) {
      console.error("Error fetching insurance data:", error);
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event, policyId) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      // Create document record
      await Document.create({
        org_id: organization.id,
        entity_type: "organization",
        entity_id: organization.id,
        doc_type: "insurance_certificate",
        storage_url: file_url,
        uploaded_by: (await User.me()).id
      });

      // Update policy with certificate
      await InsurancePolicy.update(policyId, { certificate_doc_id: file_url });
      
      await fetchData();
    } catch (error) {
      console.error("Error uploading certificate:", error);
    }
    setUploading(false);
  };

  const handleSubmitPolicy = async () => {
    if (!organization) return;

    try {
      await InsurancePolicy.create({
        ...formData,
        org_id: organization.id
      });
      
      setShowAddForm(false);
      setFormData({
        carrier: "",
        policy_number: "",
        coverage_types: ["General Liability"],
        coverage_amounts_json: {
          general_liability_occurrence: 1000000,
          general_liability_aggregate: 2000000
        },
        start_date: "",
        end_date: ""
      });
      
      await fetchData();
    } catch (error) {
      console.error("Error creating policy:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      verified: "bg-green-100 text-green-800",
      expired: "bg-red-100 text-red-800",
      rejected: "bg-red-100 text-red-800"
    };
    return colors[status] || colors.pending;
  };

  const isValidPolicy = (policy) => {
    const today = new Date();
    const endDate = new Date(policy.end_date);
    return policy.status === "verified" && endDate >= today;
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
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Insurance Policies</h1>
              <p className="text-gray-600">Manage your insurance coverage and certificates</p>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Policy
            </Button>
          </div>

          {/* Requirements Alert */}
          <Alert className="mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Required: General Liability insurance with minimum $1M per occurrence and $2M aggregate coverage.
              Upload a valid Certificate of Insurance (COI) for verification.
            </AlertDescription>
          </Alert>

          {/* NEXT Insurance Partner Card */}
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 mb-6 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/1d251d1b8_Screenshot2025-12-09at101157.png" 
                  alt="NEXT Insurance" 
                  className="w-24 h-auto flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">NEXT Insurance</h3>
                    <Badge className="bg-blue-600 text-white">Partner</Badge>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Get instant coverage for your venue with our trusted insurance partner. Quick quotes, affordable rates, and same-day certificates.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">✓ General Liability</Badge>
                    <Badge variant="secondary">✓ Property Coverage</Badge>
                    <Badge variant="secondary">✓ Instant COI</Badge>
                    <Badge variant="secondary">✓ Starting at $500/year</Badge>
                  </div>
                  <Button 
                    onClick={() => window.open('https://www.nextinsurance.com', '_blank')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Get a Quote from NEXT
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Policy Form */}
          {showAddForm && (
            <Card className="border-none shadow-lg mb-6">
              <CardHeader>
                <CardTitle>Add Insurance Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="carrier">Insurance Carrier *</Label>
                    <Input
                      id="carrier"
                      value={formData.carrier}
                      onChange={(e) => handleInputChange("carrier", e.target.value)}
                      placeholder="e.g. State Farm, Allstate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="policy_number">Policy Number *</Label>
                    <Input
                      id="policy_number"
                      value={formData.policy_number}
                      onChange={(e) => handleInputChange("policy_number", e.target.value)}
                      placeholder="Policy number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange("start_date", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange("end_date", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSubmitPolicy} disabled={!formData.carrier || !formData.policy_number}>
                    Add Policy
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Policies List */}
          <div className="space-y-4">
            {policies.map((policy) => (
              <Card key={policy.id} className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{policy.carrier}</h3>
                      <p className="text-gray-600">Policy: {policy.policy_number}</p>
                      <p className="text-sm text-gray-500">
                        Valid: {new Date(policy.start_date).toLocaleDateString()} - {new Date(policy.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(policy.status)}>
                      {policy.status === "verified" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {policy.status === "pending" && <WarningCircle className="w-3 h-3 mr-1" />}
                      {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Coverage</h4>
                    <div className="text-sm text-gray-600">
                      <p>General Liability: ${policy.coverage_amounts_json?.general_liability_occurrence?.toLocaleString()} per occurrence</p>
                      <p>Aggregate: ${policy.coverage_amounts_json?.general_liability_aggregate?.toLocaleString()}</p>
                    </div>
                  </div>

                  {!policy.certificate_doc_id ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload Certificate of Insurance (COI)</p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, policy.id)}
                          disabled={uploading}
                        />
                        <Button variant="outline" size="sm" disabled={uploading}>
                          {uploading ? <SpinnerGap className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                          Choose File
                        </Button>
                      </label>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Certificate Uploaded</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        {policy.status === "pending" ? "Under review by our team" : "Verified and approved"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {policies.length === 0 && (
            <Card className="border-none shadow-lg">
              <CardContent className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-3">No Insurance Policies</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Add your first insurance policy to get your venues approved for the marketplace
                </p>
                <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Policy
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </VenuePortalLayout>
    </RoleGuard>
  );
}