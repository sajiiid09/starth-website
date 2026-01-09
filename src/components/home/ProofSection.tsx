
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  MapPin, 
  Award, 
  TrendingUp,
  Globe,
  Shield,
  Building
} from "lucide-react";

export default function ProofSection() {
  const proofPoints = [
    {
      icon: Users,
      stat: "15k",
      label: "Signups",
      description: "Active users on our platform"
    },
    {
      icon: Building,
      stat: "190+",
      label: "Limitless Participants",
      description: "Connected at flagship Google HQ event"
    },
    {
      icon: Award,
      stat: "Provisional Patent",
      label: "AI Technology",
      description: "Patent-pending orchestration algorithms"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border-green-200 mb-6">
            <Shield className="w-4 h-4" />
            Trusted by Industry Leaders
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Leading the Future of Events
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built with cutting-edge AI and trusted by event professionals across major innovation hubs
          </p>
        </div>

        {/* Proof Points Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {proofPoints.map((point, index) => (
            <Card key={index} className="border-none shadow-lg text-center group hover:shadow-xl strathwell-transition">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-gray-200 strathwell-transition">
                  <point.icon className="w-8 h-8 text-gray-700" />
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-900">{point.stat}</div>
                  <div className="text-lg font-semibold text-gray-700">{point.label}</div>
                  <p className="text-gray-600 text-sm leading-relaxed">{point.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Achievement */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-none text-white">
            <CardContent className="p-8 text-center">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">
                  Featured Success Story
                </h3>
                <p className="text-xl text-blue-100 mb-6">
                  "Strathwell orchestrated our flagship Limitless event at Google HQ, connecting 190+ industry leaders and generating significant business value for partners including Eventbrite."
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">Limitless Conference Team</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
