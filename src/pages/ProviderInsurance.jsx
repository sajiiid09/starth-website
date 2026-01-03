import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Organization } from "@/api/entities";
import { InsurancePolicy } from "@/api/entities";
import { Document } from "@/api/entities";
import { UploadPrivateFile, SendEmail } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Shield, Plus, CheckCircle, AlertCircle, Clock, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import RoleGuard from "../components/auth/RoleGuard";
import ProviderPortalLayout from "../components/provider/ProviderPortalLayout";

export default function ProviderInsurancePage() {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    carrier: "",
    policy_number: "",
    coverage_types: "",
    start_date: null,
    end_date: null,
    certificate: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const orgs = await Organization.filter({ owner_user_id: currentUser.id, type: "service_provider" });
      if (orgs.length > 0) {
        setOrganization(orgs[0]);
        const policiesList = await InsurancePolicy.filter({ org_id: orgs[0].id });
        setPolicies(policiesList);
      }
    } catch (error) {
      console.error("Error fetching insurance data:", error);
      toast.error("Failed to load insurance policies");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      carrier: "",
      policy_number: "",
      coverage_types: "",
      start_date: null,
      end_date: null,
      certificate: null
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!organization || !formData.certificate) return;
    
    setIsUploading(true);
    try {
      // 1. Upload certificate file
      const { file_uri } = await UploadPrivateFile({ file: formData.certificate });
      
      // 2. Create document record
      const doc = await Document.create({
        org_id: organization.id,
        entity_type: "organization",
        entity_id: organization.id,
        doc_type: "insurance_certificate",
        storage_url: file_uri,
        uploaded_by: user.id,
        verified_status: "pending"
      });

      // 3. Create insurance policy record
      const policyData = {
        org_id: organization.id,
        carrier: formData.carrier,
        policy_number: formData.policy_number,
        coverage_types: formData.coverage_types.split(",").map(s => s.trim()),
        start_date: formData.start_date.toISOString().split('T')[0],
        end_date: formData.end_date.toISOString().split('T')[0],
        certificate_doc_id: doc.id,
        status: "pending"
      };

      await InsurancePolicy.create(policyData);

      // 4. Send approval email
      const emailBody = `
        A new insurance policy has been uploaded for approval.
        <br><br>
        <strong>Organization:</strong> ${organization.name}<br>
        <strong>Carrier:</strong> ${formData.carrier}<br>
        <strong>Policy Number:</strong> ${formData.policy_number}<br>
        <strong>Coverage:</strong> ${formData.coverage_types}<br>
        <strong>Valid Until:</strong> ${format(formData.end_date, 'PPP')}<br>
        <strong>File:</strong> ${formData.certificate.name}<br><br>
        Please review and approve in the admin dashboard.
      `;
      
      await SendEmail({
        to: "info@renzairegroup.com",
        subject: `Insurance Policy Uploaded for Approval: ${organization.name}`,
        body: emailBody
      });

      toast.success("Insurance policy uploaded and submitted for approval");
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error uploading insurance:", error);
      toast.error("Failed to upload insurance policy");
    }
    setIsUploading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "expired":
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      verified: "bg-green-100 text-green-800",
      expired: "bg-red-100 text-red-800",
      rejected: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800"
    };
    return colors[status] || colors.pending;
  };

  const isExpiringSoon = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  if (loading) {
    return (
      <RoleGuard requiredRole="service_provider">
        <ProviderPortalLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        </ProviderPortalLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="service_provider">
      <ProviderPortalLayout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Insurance</h1>
                <p className="text-gray-600">Manage your insurance policies</p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Policy
              </Button>
            </div>

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
                      <h3 className="text-lg font-bold text-gray-900">NEXT Insurance</h3>
                      <Badge className="bg-blue-600 text-white">Partner</Badge>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Protect your service business with comprehensive coverage from our trusted partner. Get instant quotes and certificates in minutes.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary">✓ General Liability</Badge>
                      <Badge variant="secondary">✓ Professional Liability</Badge>
                      <Badge variant="secondary">✓ Equipment Coverage</Badge>
                      <Badge variant="secondary">✓ Starting at $300/year</Badge>
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

            {policies.length > 0 ? (
              <div className="space-y-6">
                {policies.map(policy => {
                  const isExpiring = isExpiringSoon(policy.end_date);
                  return (
                    <Card key={policy.id} className="border-none shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-4">
                            <Shield className="w-8 h-8 text-blue-600 mt-1" />
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{policy.carrier}</h3>
                              <p className="text-gray-600 mb-3">Policy #{policy.policy_number}</p>
                              
                              {policy.coverage_types && policy.coverage_types.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Coverage Types:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {policy.coverage_types.map((type, index) => (
                                      <Badge key={index} variant="secondary">{type}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>
                                  <strong>Valid:</strong> {format(new Date(policy.start_date), 'MMM d, yyyy')} - {format(new Date(policy.end_date), 'MMM d, yyyy')}
                                </span>
                              </div>

                              {isExpiring && (
                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <p className="text-yellow-800 text-sm">
                                    <AlertCircle className="w-4 h-4 inline mr-1" />
                                    This policy expires in {Math.ceil((new Date(policy.end_date) - new Date()) / (1000 * 60 * 60 * 24))} days
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusIcon(policy.status)}
                            <Badge className={getStatusBadge(policy.status)}>
                              {policy.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-none shadow-lg">
                <CardContent className="p-12 text-center">
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-gray-900 mb-3">No insurance policies</h3>
                  <p className="text-gray-600 mb-6">Add your insurance policy to verify your coverage</p>
                  <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Policy
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Upload Policy Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Insurance Policy</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Carrier</label>
                    <Input
                      value={formData.carrier}
                      onChange={(e) => setFormData(prev => ({ ...prev, carrier: e.target.value }))}
                      placeholder="e.g., Lloyd's of London"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Policy Number</label>
                    <Input
                      value={formData.policy_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, policy_number: e.target.value }))}
                      placeholder="e.g., POL12345678"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coverage Types (comma-separated)</label>
                    <Textarea
                      value={formData.coverage_types}
                      onChange={(e) => setFormData(prev => ({ ...prev, coverage_types: e.target.value }))}
                      placeholder="e.g., General Liability, Professional Liability"
                      rows={2}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.start_date ? format(formData.start_date, 'MMM d, yyyy') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.start_date}
                            onSelect={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.end_date ? format(formData.end_date, 'MMM d, yyyy') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.end_date}
                            onSelect={(date) => setFormData(prev => ({ ...prev, end_date: date }))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Certificate</label>
                    <Input
                      type="file"
                      onChange={(e) => setFormData(prev => ({ ...prev, certificate: e.target.files[0] }))}
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, JPG, PNG</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUploading || !formData.certificate}>
                      {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Upload Policy
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </ProviderPortalLayout>
    </RoleGuard>
  );
}