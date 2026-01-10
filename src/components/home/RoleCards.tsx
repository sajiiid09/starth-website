import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  MapPin, 
  Palette, 
  ArrowRight
} from "lucide-react";
import DemoRequestModal from "../marketing/DemoRequestModal";

export default function RoleCards() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('event_organizer');

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    setShowDemoModal(true);
  };

  const roles = [
    {
      title: "Event Organizers",
      description: "Plan smarter with AI-powered venue and vendor matching",
      icon: Calendar,
      gradient: "from-blue-600 to-indigo-600",
      benefits: [
        "AI venue recommendations",
        "Pre-vetted vendor packages", 
        "Budget optimization",
        "Timeline management"
      ],
      cta: "Plan an Event",
      ctaAction: () => handleRoleClick('event_organizer'),
      role: "event_organizer"
    },
    {
      title: "Venue Owners",
      description: "List your space and connect with quality event organizers",
      icon: MapPin, 
      gradient: "from-green-600 to-emerald-600",
      benefits: [
        "Premium listing exposure",
        "Qualified lead matching",
        "Revenue optimization",
        "Simplified booking"
      ],
      cta: "List Your Space",
      ctaAction: () => handleRoleClick('venue_owner'),
      role: "venue_owner"
    },
    {
      title: "Service Providers",
      description: "Grow your business with curated event opportunities",
      icon: Palette,
      gradient: "from-purple-600 to-pink-600", 
      benefits: [
        "Quality project matching",
        "Portfolio showcase",
        "Automated proposals",
        "Payment protection"
      ],
      cta: "Join Network",
      ctaAction: () => handleRoleClick('service_provider'),
      role: "service_provider"
    }
  ];

  return (
    <>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Every Role in Events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're planning, hosting, or serving events, Strathwell connects you with the right opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role) => (
              <Card 
                key={role.title}
                className="border-none shadow-lg hover:shadow-xl strathwell-transition bg-white overflow-hidden group"
              >
                <CardHeader className="relative p-6 pb-4">
                  <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-5 group-hover:opacity-10 strathwell-transition`} />
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-4`}>
                      <role.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                      {role.title}
                    </CardTitle>
                    <p className="text-gray-600">
                      {role.description}
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 pt-0">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {role.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          {benefit}
                        </div>
                      ))}
                    </div>

                    <Button 
                      onClick={role.ctaAction}
                      className={`w-full bg-gradient-to-r ${role.gradient} hover:shadow-lg strathwell-transition text-white rounded-xl py-3 group/btn mt-4`}
                    >
                      {role.cta}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 strathwell-transition" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <DemoRequestModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        defaultRole={selectedRole}
      />
    </>
  );
}