import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Organization } from "@/api/entities";
import { Document } from "@/api/entities";
import { UploadPrivateFile, SendEmail } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Upload, FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import RoleGuard from "../components/auth/RoleGuard";
import ProviderPortalLayout from "../components/provider/ProviderPortalLayout";

const documentTypes = [
  { value: "identity", label: "Identity Documents", required: true },
  { value: "business_license", label: "Business License", required: true },
  { value: "insurance_certificate", label: "Insurance Certificate", required: false },
  { value: "permits", label: "Permits & Certifications", required: false }
];

export default function ProviderDocumentsPage() {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    doc_type: "",
    notes: "",
    file: null
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
        const docsList = await Document.filter({ org_id: orgs[0].id });
        setDocuments(docsList);
      }
    } catch (error) {
      console.error("Error fetching documents data:", error);
      toast.error("Failed to load documents");
    }
    setLoading(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!organization || !formData.file) return;
    
    setIsUploading(true);
    try {
      const { file_uri } = await UploadPrivateFile({ file: formData.file });
      
      const doc = await Document.create({
        org_id: organization.id,
        entity_type: "organization",
        entity_id: organization.id,
        doc_type: formData.doc_type,
        storage_url: file_uri,
        uploaded_by: user.id,
        verified_status: "pending",
        notes: formData.notes
      });

      // Send approval email
      const docTypeLabel = documentTypes.find(t => t.value === formData.doc_type)?.label || formData.doc_type;
      const emailBody = `
        A new document has been uploaded for approval.
        <br><br>
        <strong>Organization:</strong> ${organization.name}<br>
        <strong>Document Type:</strong> ${docTypeLabel}<br>
        <strong>File Name:</strong> ${formData.file.name}<br>
        <strong>Notes:</strong> ${formData.notes || "None"}<br><br>
        Please review and approve in the admin dashboard.
      `;
      
      await SendEmail({
        to: "info@renzairegroup.com",
        subject: `Document Uploaded for Approval: ${organization.name} - ${docTypeLabel}`,
        body: emailBody
      });

      toast.success("Document uploaded and submitted for approval");
      setIsDialogOpen(false);
      setFormData({ doc_type: "", notes: "", file: null });
      fetchData();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    }
    setIsUploading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      verified: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800"
    };
    return colors[status] || colors.pending;
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
                <p className="text-gray-600">Upload required verification documents</p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>

            {/* Required Documents Overview */}
            <Card className="border-none shadow-lg mb-8">
              <CardHeader>
                <CardTitle>Required Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {documentTypes.map(docType => {
                    const uploaded = documents.find(d => d.doc_type === docType.value);
                    return (
                      <div key={docType.value} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {docType.label}
                              {docType.required && <span className="text-red-500 ml-1">*</span>}
                            </p>
                            <p className="text-sm text-gray-500">
                              {uploaded ? `Uploaded ${new Date(uploaded.created_date).toLocaleDateString()}` : "Not uploaded"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {uploaded ? (
                            <>
                              {getStatusIcon(uploaded.verified_status)}
                              <Badge className={getStatusBadge(uploaded.verified_status)}>
                                {uploaded.verified_status}
                              </Badge>
                            </>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">Missing</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Documents */}
            {documents.length > 0 && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents.map(doc => {
                      const docType = documentTypes.find(t => t.value === doc.doc_type);
                      return (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <FileText className="w-8 h-8 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {docType?.label || doc.doc_type}
                              </p>
                              <p className="text-sm text-gray-500">
                                Uploaded {new Date(doc.created_date).toLocaleDateString()}
                              </p>
                              {doc.notes && (
                                <p className="text-sm text-gray-600 mt-1">
                                  <strong>Notes:</strong> {doc.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusIcon(doc.verified_status)}
                            <Badge className={getStatusBadge(doc.verified_status)}>
                              {doc.verified_status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                    <Select
                      value={formData.doc_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, doc_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label} {type.required && "*"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                    <Input
                      type="file"
                      onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files[0] }))}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, JPG, PNG, DOC, DOCX</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes about this document..."
                      rows={3}
                    />
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
                    <Button type="submit" disabled={isUploading || !formData.doc_type || !formData.file}>
                      {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Upload Document
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