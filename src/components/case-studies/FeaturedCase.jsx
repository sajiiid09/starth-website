import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Users, 
  Calendar, 
  Award,
  ArrowRight,
  ExternalLink,
  Bot
} from "lucide-react";

export default function FeaturedCase() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Partnership
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Strathwell's AI orchestration platform powered seamless coordination for the Limitless Women in Tech Summit 2025 at Google HQ.
          </p>
        </div>

        <Card className="border-none shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* Image */}
            <div className="md:w-1/2 relative bg-gray-100">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/e87b92b26_Screenshot2025-09-25at102332.png"
                alt="Limitless Women in Tech Summit 2025"
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 left-4 bg-pink-600 text-white">
                Flagship Event
              </Badge>
            </div>

            {/* Content */}
            <div className="md:w-1/2 p-8">
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Event Overview
                    </h3>
                    <Link to={createPageUrl("AIPlanner")}>
                      <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Bot className="w-4 h-4 mr-1" />
                        AI Generator
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Event Details Grid */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium">Location</span>
                        </div>
                        <p className="text-gray-900 font-medium">Google HQ, Mountain View</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">Date</span>
                        </div>
                        <p className="text-gray-900 font-medium">September 18, 2025</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">Attendees</span>
                        </div>
                        <p className="text-gray-900 font-medium">194 Registered</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                          <Award className="w-4 h-4" />
                          <span className="font-medium">Platform</span>
                        </div>
                        <p className="text-gray-900 font-medium">AI-Powered</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="border-t pt-6 space-y-3">
                  <a href="https://www.eventbrite.com/e/limitless-women-in-tech-summit-2025-tickets-1505287598729?aff=ebdsshcopyurl&lang=en-us&locale=en_US&status=75&view=listing" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white group">
                      View on Eventbrite
                      <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                  <Link to={createPageUrl("DFY")}>
                    <Button variant="outline" className="w-full group">
                      Plan with Us
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}