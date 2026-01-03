import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, ArrowRight } from "lucide-react";

import HeroSection from "../components/home/HeroSection";
import CompanyLogos from "../components/home/CompanyLogos";
import AIDemo from "../components/home/AIDemo";
import RoleCards from "../components/home/RoleCards";
import ProofSection from "../components/home/ProofSection";
import DemoRequestModal from "../components/marketing/DemoRequestModal";

export default function HomePage() {
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <CompanyLogos />
      <AIDemo />
      
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white p-8 md:p-12 text-center rounded-2xl shadow-2xl">
            <CardContent>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                <Bot className="w-4 h-4" />
                AI-Powered Space Intelligence
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Explore Virtual Robotics Planning
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
                Upload a floorplan and watch our AI generate optimal setup flows, cost estimates, and task lists in a stunning 3D simulation.
              </p>
              <Link to={createPageUrl("VirtualRobotics")}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-200 font-semibold">
                  Launch Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <RoleCards />
      <ProofSection />
      
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Events?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            See how Strathwell's AI orchestration platform can revolutionize your event planning process
          </p>
          <Button
            onClick={() => setShowDemoModal(true)}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl strathwell-transition"
          >
            Request a Demo
          </Button>
          <p className="text-sm text-gray-500 mt-6">
            Get a personalized walkthrough • No commitment required
          </p>
        </div>
      </section>

      <DemoRequestModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
      />
    </div>
  );
}