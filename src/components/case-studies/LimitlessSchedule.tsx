
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChevronRight, Award, TrendingUp } from "lucide-react";

export default function LimitlessSchedule() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full text-sm font-medium text-pink-700 mb-6">
            <Clock className="w-4 h-4" />
            Inside Our Flagship Event
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Limitless Women in Tech Summit 2025
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how we orchestrated a full day of industry-leading sessions at Google HQ, connecting 194 participants with meaningful content and networking.
          </p>
        </div>

        {/* Event Images */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-none shadow-lg overflow-hidden">
            <div className="bg-gray-100">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/fede128db_Screenshot2025-09-26at135856.png"
                alt="Panel Discussion at Limitless Summit"
                className="w-full h-64 object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Building the Future of Tech</h3>
              <p className="text-sm text-gray-600">Industry leaders sharing insights on innovation and leadership</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg overflow-hidden">
            <div className="bg-gray-100">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/6b524f4fe_Screenshot2025-09-26at135914.png"
                alt="Allyship Panel at Limitless Summit"
                className="w-full h-64 object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Allyship in Action</h3>
              <p className="text-sm text-gray-600">Driving impact together through inclusive leadership</p>
            </CardContent>
          </Card>
        </div>

        {/* LinkedIn Embed */}
        <div className="mb-12">
          <Card className="border-none shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Event Highlights</h3>
                <p className="text-gray-600">See what attendees and sponsors are saying</p>
              </div>
              <div className="flex justify-center">
                <iframe 
                  src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7375961992446025728?compact=1" 
                  height="399" 
                  width="504" 
                  frameBorder="0" 
                  allowFullScreen 
                  title="Embedded post"
                  className="rounded-lg shadow-md"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Impact */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-pink-600 to-orange-600 border-none text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Event Impact & Results
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold mb-2">194</div>
                  <p className="text-pink-100">Tickets Sold</p>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">$10K+</div>
                  <p className="text-pink-100">Business Value Generated</p>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">Sept 18</div>
                  <p className="text-pink-100">Single Day Event</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
