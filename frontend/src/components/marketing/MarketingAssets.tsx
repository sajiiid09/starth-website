import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UploadFile } from '@/api/integrations';
import { 
  Upload, 
  Palette, 
  Image as ImageIcon, 
  FileText, 
  Download, 
  ArrowSquareOut,
  Plus,
  Trash
} from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function MarketingAssets({ eventId, event, onRefresh }) {
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [canvaUrl, setCanvaUrl] = useState('');

  useEffect(() => {
    // Load existing assets from localStorage or backend
    const savedAssets = localStorage.getItem(`marketing_assets_${eventId}`);
    if (savedAssets) {
      setAssets(JSON.parse(savedAssets));
    }
  }, [eventId]);

  const saveAssets = (newAssets) => {
    setAssets(newAssets);
    localStorage.setItem(`marketing_assets_${eventId}`, JSON.stringify(newAssets));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files) as File[];
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await UploadFile({ file });
        return {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          url: file_url,
          size: file.size,
          uploaded_at: new Date().toISOString()
        };
      });

      const newAssets = await Promise.all(uploadPromises);
      const updatedAssets = [...assets, ...newAssets];
      saveAssets(updatedAssets);
      toast.success(`${newAssets.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    }
    setUploading(false);
  };

  const removeAsset = (assetId) => {
    const updatedAssets = assets.filter(asset => asset.id !== assetId);
    saveAssets(updatedAssets);
    toast.success('Asset removed');
  };

  const openCanva = () => {
    const canvaTemplateUrl = `https://www.canva.com/design/DAFxxx/edit?category=events&search=${encodeURIComponent(event?.title || 'event')}`;
    window.open(canvaTemplateUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            Create Marketing Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button onClick={openCanva} className="bg-purple-600 hover:bg-purple-700 h-16">
              <div className="text-center">
                <ArrowSquareOut className="w-6 h-6 mx-auto mb-1" />
                <div className="text-sm">Design with Canva</div>
              </div>
            </Button>
            
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*,application/pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <Button variant="outline" className="w-full h-16" disabled={uploading}>
                <div className="text-center">
                  <Upload className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm">
                    {uploading ? 'Uploading...' : 'Upload Files'}
                  </div>
                </div>
              </Button>
            </label>

            <Button variant="outline" className="h-16">
              <div className="text-center">
                <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                <div className="text-sm">Generate with AI</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Asset Library */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Asset Library ({assets.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assets.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {asset.type === 'image' ? (
                        <ImageIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-600" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {asset.type}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAsset(asset.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {asset.type === 'image' && (
                    <img 
                      src={asset.url} 
                      alt={asset.name}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                  )}
                  
                  <h4 className="font-medium text-sm mb-2 truncate" title={asset.name}>
                    {asset.name}
                  </h4>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{(asset.size / 1024 / 1024).toFixed(1)} MB</span>
                    <span>{new Date(asset.uploaded_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline" 
                      onClick={() => window.open(asset.url, '_blank')}
                      className="flex-1"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assets Yet</h3>
              <p className="text-gray-600 mb-6">
                Upload marketing materials or create new designs with Canva
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={openCanva} className="bg-purple-600 hover:bg-purple-700">
                  <Palette className="w-4 h-4 mr-2" />
                  Design with Canva
                </Button>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                </label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}