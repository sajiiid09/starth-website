import React, { useEffect, useState } from "react";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, ArrowRight, SpinnerGap } from "@phosphor-icons/react";

export default function AppStrathwellPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Redirect based on user role
      const roles = currentUser.roles || ['organizer'];
      const activeRole = localStorage.getItem('activeRole') || roles[0];
      
      if (activeRole === 'venue_owner') {
        window.location.href = createPageUrl("VenuePortal");
      } else if (activeRole === 'service_provider') {
        window.location.href = createPageUrl("ProviderPortal");
      } else {
        window.location.href = createPageUrl("Dashboard");
      }
    } catch (error) {
      // User not logged in, show login options
      setUser(null);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <SpinnerGap className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/ddf404508_Elegant_Simple_Aesthetic_Real_Estate_Logo__1_-removebg-preview.png" 
            alt="Strathwell" 
            className="h-32 mx-auto mb-6"
          />
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">
            Welcome to Strathwell
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sign in to access your dashboard and start orchestrating extraordinary events
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Event Organizers</h3>
              <p className="text-sm text-gray-600">
                Plan events with AI-powered venue and vendor matching
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Venue Owners</h3>
              <p className="text-sm text-gray-600">
                Manage listings, bookings, and connect with organizers
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Service Providers</h3>
              <p className="text-sm text-gray-600">
                Showcase services and receive curated event opportunities
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Sign In to Your Dashboard
            </h2>
            
            <div className="space-y-4 max-w-md mx-auto">
              <Button
                onClick={() => window.location.href = 'https://app.strathwell.com/auth/login'}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-xl group"
              >
                Sign In with Google
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <p className="text-sm text-gray-500">
                Or use email/phone authentication
              </p>
              
              <Button
                onClick={() => window.location.href = 'https://app.strathwell.com/auth/login'}
                variant="outline"
                size="lg"
                className="w-full py-6 text-lg rounded-xl"
              >
                Sign In with Email
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-gray-600 mb-4">
                Don't have an account?
              </p>
              <Button
                onClick={() => window.location.href = 'https://app.strathwell.com/auth/signup'}
                variant="ghost"
                className="text-blue-600 hover:text-blue-700"
              >
                Create Account →
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <a 
            href="https://strathwell.com" 
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back to Strathwell.com
          </a>
        </div>
      </div>
    </div>
  );
}