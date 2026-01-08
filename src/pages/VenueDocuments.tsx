import React, { useState, useEffect } from "react";
import { Document } from "@/api/entities";
import { Organization } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Upload, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import RoleGuard from "../components/auth/RoleGuard";
import VenuePortalLayout from "../components/venue/VenuePortalLayout";

const documentTypes = [
  {
    type: "identity",
    title: "Government ID",
    description: "Upload government-issued ID (front and back) or passport",
    required: true,
    maxFiles: 2
  },
  {
    type: "business_license",
    title: "Business License",
    description: "Business license, EIN letter, or incorporation documents",
    required: true,
    maxFiles: 1
  },
  {
    type: "floor_plan",
    title: "Floor Plans",
    description: "Venue floor plans and layout diagrams",
    required: false,
    maxFiles: 5
  },
  {
    type: "permits",
    title: "Permits & Licenses",
    description: "Event permits, liquor license, fire department approval",
    required: false,
    maxFiles: 3
  }
];

export default function VenueDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const currentUser = await User.me();
      const orgs = await Organization.filter({ owner_user_id: currentUser.id, type: "venue_owner" });
      
      if (orgs.length > 0) {
        setOrganization(orgs[0]);
        const docList = await Document.filter({ org_id: orgs[0].id, entity_type: "organization" });
        setDocuments(docList);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
    setLoading(false);
  };

  const handleFileUpload = async (event, docType) => {
    const files = Array.from(event.target.files);
    if (!files.length || !organization) return;

    setUploading(prev => ({ ...prev, [docType]: true }));
    
    try {
      for (const file of files) {
        const { file_url } = await UploadFile({ file });
        
        await Document.create({
          org_id: organization.id,
          entity_type: "organization",
          entity_id: organization.id,
          doc_type: docType,
          storage_url: file_url,
          uploaded_by: (await User.me()).id
        });
      }
      
      await fetchData();
    } catch (error) {
      console.error("Error uploading documents:", error);
    }
    
    setUploading(prev => ({ ...prev, [docType]: false }));
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await Document.delete(documentId);
      await fetchData();
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      verified: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    return colors[status] || colors.pending;
  };

  const getDocumentsByType = (type) => {
    return documents.filter(doc => doc.doc_type === type);
  };

  const getCompletionStatus = () => {
    const requiredTypes = documentTypes.filter(dt => dt.required).map(dt => dt.type);
    const uploadedTypes = [...new Set(documents.map(doc => doc.doc_type))];
    const completed = requiredTypes.filter(type => uploadedTypes.includes(type));
    return { completed: completed.length, total: requiredTypes.length };
  };

  if (loading) {
    return (
      <RoleGuard requiredRole="venue_owner">
        <VenuePortalLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        </VenuePortalLayout>
      </RoleGuard>
    );
  }

  const { completed, total } = getCompletionStatus();

  return (
    <RoleGuard requiredRole="venue_owner">
      <VenuePortalLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Verification</h1>
              <p className="text-gray-600">Upload required documents for marketplace approval</p>
            </div>
            <Badge className={completed === total ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
              {completed}/{total} Required Complete
            </Badge>
          </div>

          <Alert className="mb-6">
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Upload clear, high-quality images or PDFs. All required documents must be verified before your venues can appear in the marketplace.
              File types: PDF, JPG, PNG. Max size: 25MB per file.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {documentTypes.map((docType) => {
              const docs = getDocumentsByType(docType.type);
              const isUploading = uploading[docType.type];
              
              return (
                <Card key={docType.type} className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        {docType.title}
                        {docType.required && <span className="text-red-500">*</span>}
                      </div>
                      {docs.length > 0 && (
                        <Badge className="bg-gray-100 text-gray-800">
                          {docs.length}/{docType.maxFiles}
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{docType.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Uploaded Documents */}
                    {docs.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {docs.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-gray-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Document #{doc.id.slice(-6)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Uploaded {new Date(doc.created_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(doc.verified_status)}>
                                {doc.verified_status === "verified" && <CheckCircle className="w-3 h-3 mr-1" />}
                                {doc.verified_status === "rejected" && <AlertCircle className="w-3 h-3 mr-1" />}
                                {doc.verified_status.charAt(0).toUpperCase() + doc.verified_status.slice(1)}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="w-8 h-8 text-gray-400 hover:text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Upload Area */}
                    {docs.length < docType.maxFiles && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          {docs.length === 0 ? `Upload ${docType.title}` : `Add more files`}
                        </p>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            multiple={docType.maxFiles > 1}
                            onChange={(e) => handleFileUpload(e, docType.type)}
                            disabled={isUploading}
                          />
                          <Button variant="outline" size="sm" disabled={isUploading}>
                            {isUploading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4 mr-2" />
                            )}
                            Choose Files
                          </Button>
                        </label>
                        <p className="text-xs text-gray-400 mt-2">
                          PDF, JPG, PNG up to 25MB
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </VenuePortalLayout>
    </RoleGuard>
  );
}