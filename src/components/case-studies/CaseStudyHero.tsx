import React from "react";
import { Badge } from "@/components/ui/badge";
import { Award, Users, TrendingUp } from "lucide-react";

export default function CaseStudyHero() {
  return (
    <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto text-center">
        <Badge className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 border-pink-200 mb-6">
          <Award className="w-4 h-4" />
          Success Stories
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Events That
          <br />
          <span className="bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
            Make Impact
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          See how Strathwell helps create memorable experiences that drive business results and foster lasting connections.
        </p>

        {/* Key Stats */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-pink-100 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">194</h3>
            <p className="text-gray-600">Summit Attendees</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-pink-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">$10K+</h3>
            <p className="text-gray-600">Business Value</p>
          </div>
        </div>
      </div>
    </section>
  );
}