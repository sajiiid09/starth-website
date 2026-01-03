import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageSquare, 
  FileSearch, 
  Users, 
  Calendar,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function DFYProcess() {
  const steps = [
    {
      icon: MessageSquare,
      title: "Tell Us Your Vision",
      description: "Share your event goals, preferences, and requirements through our detailed intake form."
    },
    {
      icon: FileSearch,
      title: "Custom Proposal",
      description: "Our experts curate a tailored proposal with venues, vendors, and timeline within 24 hours."
    },
    {
      icon: Users,
      title: "Expert Planning", 
      description: "Your dedicated event coordinator handles all logistics, contracts, and vendor management."
    },
    {
      icon: Calendar,
      title: "Seamless Execution",
      description: "We manage every detail on event day, ensuring everything runs perfectly."
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How Full-Service Event Planning Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From initial consultation to flawless execution, we handle every aspect of your event
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="border-none shadow-lg h-full group hover:shadow-xl strathwell-transition">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 strathwell-transition">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-purple-600">
                      Step {index + 1}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Arrow connector for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">50+</div>
              <div className="text-gray-600">Events Executed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">24hr</div>
              <div className="text-gray-600">Response Time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}