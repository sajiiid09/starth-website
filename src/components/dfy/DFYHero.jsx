import React from "react";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Award, CheckCircle } from "lucide-react";

export default function DFYHero() {
  return (
    <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto text-center">
        <Badge className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 border-purple-200 mb-6">
          <Users className="w-4 h-4" />
          Full-Service Event Planning
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Your Event,
          <br />
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Our Expertise
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Short on time? Our concierge team will plan and execute the entire event for you—from concept to completion.
        </p>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">24hr Response</h3>
            <p className="text-gray-600">We'll reach out within one business day with your custom proposal</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Expert Curation</h3>
            <p className="text-gray-600">Hand-picked venues and vendors tailored to your exact needs</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Full Execution</h3>
            <p className="text-gray-600">We handle everything from planning to day-of coordination</p>
          </div>
        </div>
      </div>
    </section>
  );
}