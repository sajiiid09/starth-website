import React from "react";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  Award, 
  Clock,
  DollarSign,
  Star,
  Building
} from "lucide-react";

export default function SuccessMetrics() {
  const metrics = [
    {
      icon: Users,
      value: "194",
      label: "Limitless Summit Attendees",
      description: "Connected at the Google HQ flagship event"
    },
    {
      icon: Building,
      value: "5+",
      label: "Fortune 500 Partners",
      description: "Including Google, Eventbrite, ServiceNow, Wells Fargo, NVIDIA"
    },
    {
      icon: Award,
      value: "AI-Powered",
      label: "Event Orchestration",
      description: "Seamless coordination through our platform"
    },
    {
      icon: Clock,
      value: "1 Day",
      label: "Full Summit Experience",
      description: "Complete event coordination at Google HQ"
    },
    {
      icon: DollarSign,
      value: "$10K+",
      label: "Event Business Value",
      description: "Generated through the Limitless partnership"
    },
    {
      icon: Star,
      value: "Leadership",
      label: "Industry Feedback",
      description: "From leaders at top-tier technology companies"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Partnership Impact
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Verifiable results from our role in the Limitless Women in Tech Summit partnership
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="border-none shadow-lg text-center group hover:shadow-xl strathwell-transition">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 strathwell-transition">
                  <metric.icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-gray-900">{metric.value}</div>
                  <div className="text-lg font-semibold text-gray-700">{metric.label}</div>
                  <p className="text-gray-600 text-sm leading-relaxed">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-none text-white">
            <CardContent className="p-12 text-center">
              <h3 className="text-3xl font-bold mb-4">
                Ready to Create Your Success Story?
              </h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join the leading organizations that trust Strathwell to orchestrate their most important events.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <a href={`${window.location.origin}${createPageUrl("AIPlanner")}`}>
                  <button className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-xl font-semibold strathwell-transition">
                    Plan with AI
                  </button>
                </a>
                <a href={`${window.location.origin}${createPageUrl("DFY")}`}>
                  <button className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-xl font-semibold strathwell-transition">
                    Plan with Us
                  </button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}