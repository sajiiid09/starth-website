import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  Users, 
  Calendar, 
  DollarSign,
  Star,
  Wifi,
  Car
} from "lucide-react";

const demoSteps = [
  {
    type: "user",
    content: "Plan a 120-guest product launch in Cambridge in October, budget $25k."
  },
  {
    type: "ai",
    content: "I'll help you plan the perfect product launch! Let me analyze venues and vendors in Cambridge...",
    showResults: true
  }
];

export default function AIDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < demoSteps.length - 1) {
        setIsTyping(true);
        setTimeout(() => {
          setCurrentStep(currentStep + 1);
          setIsTyping(false);
        }, 1500);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-sm font-medium text-blue-700 mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            See AI in Action
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Let AI Design Your Perfect Event
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Chat Interface */}
          <motion.div 
            className="bg-gray-50 rounded-2xl p-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <motion.div 
                  className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"
                  animate={{ 
                    boxShadow: [
                      "0 0 0 0 rgba(37, 99, 235, 0.4)",
                      "0 0 0 8px rgba(37, 99, 235, 0)",
                      "0 0 0 0 rgba(37, 99, 235, 0)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
                <span className="font-semibold text-gray-900">Strathwell AI</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-500">Online</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {demoSteps.slice(0, currentStep + 1).map((step, index) => (
                  <motion.div 
                    key={index}
                    className={`flex ${step.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className={`max-w-xs p-3 rounded-xl ${
                      step.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {step.content}
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-xl">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Link to={createPageUrl("AIPlanner")}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold strathwell-transition group">
                Try Plan with AI
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 strathwell-transition" />
              </Button>
            </Link>
          </motion.div>

          {/* Results Panel */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={currentStep >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.6 }}
          >
            {/* Venue Shortlist */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Top Venue Matches
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Innovation Lab Cambridge</p>
                      <p className="text-sm text-gray-600 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          150 capacity
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          $5,500/day
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">4.9</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">TechHub Central</p>
                      <p className="text-sm text-gray-600 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          120 capacity
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          $4,200/day
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Bundle */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Curated Vendor Bundle
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Premium Catering</span>
                    <span className="font-semibold">$8,500</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">AV & Tech Setup</span>
                    <span className="font-semibold">$3,200</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Photography</span>
                    <span className="font-semibold">$2,100</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Decor & Branding</span>
                    <span className="font-semibold">$2,800</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex items-center justify-between font-bold">
                    <span>Total Package</span>
                    <span className="text-green-600">$22,100</span>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Under budget by $2,900
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}