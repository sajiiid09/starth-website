import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Brain,
  Robot,
  CheckCircle,
  SpinnerGap,
  Play
} from "@phosphor-icons/react";
import { UploadFile } from "@/api/integrations";
import { toast } from "sonner";

export default function VirtualRoboticsPage() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [spaceDescription, setSpaceDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!spaceDescription.trim()) {
      toast.error("Please describe the space before uploading a file.");
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or PDF file.");
      return;
    }

    setUploading(true);

    try {
      const { file_url } = await UploadFile({ file });
      setUploadedFile({ url: file_url, name: file.name });
      toast.success("File uploaded! Starting analysis...");
      await analyzeSpace();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const analyzeSpace = async () => {
    setAnalyzing(true);
    const isWedding = spaceDescription.toLowerCase().includes('wedding');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis = isWedding ? {
        space_analysis: { square_footage: 3000, layout_type: "Ballroom with Dance Floor" },
        event_recommendations: { 
          capacity: { seated: 150, standing: 250 },
          furniture_needs: ["15 Round Tables", "150 Chairs", "1 Ceremony Arch", "1 Bar"]
        },
        resource_planning: { 
          staff_needed: 8, 
          setup_time_hours: 5,
          cost_breakdown: { labor_cost: 2000, rental_cost: 4500, total_estimated_cost: 8000 }
        },
        task_list: [
          { task: "Set up ceremony arch", duration_minutes: 45, assigned_to: "Decor Team" },
          { task: "Arrange tables and chairs", duration_minutes: 90, assigned_to: "Setup Crew" },
          { task: "Set up bar station", duration_minutes: 30, assigned_to: "Catering" }
        ]
      } : {
        space_analysis: { square_footage: 5000, layout_type: "Conference Hall" },
        event_recommendations: { 
          capacity: { seated: 300, standing: 500 },
          furniture_needs: ["1 Stage Platform", "300 Chairs", "10 Networking Tables"]
        },
        resource_planning: { 
          staff_needed: 12, 
          setup_time_hours: 8,
          cost_breakdown: { labor_cost: 4000, rental_cost: 8500, total_estimated_cost: 16000 }
        },
        task_list: [
          { task: "Build main stage", duration_minutes: 90, assigned_to: "Stage Crew" },
          { task: "Arrange theater seating", duration_minutes: 120, assigned_to: "Setup Team" },
          { task: "Set up AV equipment", duration_minutes: 75, assigned_to: "AV Team" }
        ]
      };
      
      setAnalysis(mockAnalysis);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <Robot className="w-4 h-4" />
            Powered by NVIDIA & Gemini Robotics
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Virtual Robotics Planning
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Upload a floorplan, describe your event, and get AI-powered setup analysis—no site visits required
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-none bg-white/10 backdrop-blur-md text-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Upload Floorplan & Describe Event
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Event Description</label>
                <Input 
                  value={spaceDescription} 
                  onChange={(e) => setSpaceDescription(e.target.value)} 
                  placeholder="e.g., A wedding for 150 guests or a tech summit for 300 attendees..." 
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" 
                />
                <p className="text-xs text-gray-400 mt-2">Describe your event type, guest count, and requirements</p>
              </div>

              <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-white/50 transition-colors">
                {uploadedFile ? (
                  <div className="space-y-4">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-400" />
                    <p className="font-semibold">{uploadedFile.name}</p>
                    <Button 
                      onClick={() => { 
                        setUploadedFile(null); 
                        setAnalysis(null); 
                      }} 
                      variant="outline" 
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Upload Different File
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      disabled={uploading || analyzing || !spaceDescription.trim()} 
                    />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="font-semibold mb-2">
                      {uploading ? "Uploading..." : "Click to upload floorplan"}
                    </p>
                    <p className="text-sm text-gray-400">PDF, JPG, PNG up to 10MB</p>
                  </label>
                )}
              </div>

              {analyzing && (
                <div className="bg-white/5 rounded-lg p-4 flex items-center gap-3">
                  <SpinnerGap className="w-5 h-5 animate-spin" />
                  <span>AI analyzing your space...</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none bg-white/10 backdrop-blur-md text-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Brain className="w-6 h-6" />
                AI Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!analysis ? (
                <div className="text-center py-12">
                  <Robot className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-300">Upload a floorplan to see AI-powered insights</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="font-bold mb-3">Space Analysis</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400">Square Footage</p>
                        <p className="font-semibold">{analysis.space_analysis?.square_footage} sq ft</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Layout Type</p>
                        <p className="font-semibold">{analysis.space_analysis?.layout_type}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="font-bold mb-3">Capacity & Setup</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Seated Capacity</span>
                        <span className="font-semibold">{analysis.event_recommendations?.capacity?.seated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Setup Time</span>
                        <span className="font-semibold">{analysis.resource_planning?.setup_time_hours}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Staff Needed</span>
                        <span className="font-semibold">{analysis.resource_planning?.staff_needed} people</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="font-bold mb-3">Cost Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Labor</span>
                        <span className="font-semibold">${analysis.resource_planning?.cost_breakdown?.labor_cost?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rentals</span>
                        <span className="font-semibold">${analysis.resource_planning?.cost_breakdown?.rental_cost?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white/20">
                        <span className="font-bold">Total Estimate</span>
                        <span className="font-bold text-green-400">${analysis.resource_planning?.cost_breakdown?.total_estimated_cost?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="font-bold mb-3">Task Sequence ({analysis.task_list?.length} tasks)</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {analysis.task_list?.map((task, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{task.task}</p>
                            <p className="text-xs text-gray-300">{task.duration_minutes} min • {task.assigned_to}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => toast.success("Launching 3D simulation preview...")}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    View 3D Simulation Preview
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
