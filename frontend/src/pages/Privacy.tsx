
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600">
            Last updated: January 2025
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Card className="border-none shadow-lg">
          <CardContent className="p-8 space-y-8">
            <section>
              <CardTitle className="text-2xl font-semibold text-gray-900 mb-4">
                Information We Collect
              </CardTitle>
              <p className="text-gray-700 leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
              </p>
            </section>

            <Separator />

            <section>
              <CardTitle className="text-2xl font-semibold text-gray-900 mb-4">
                How We Use Your Information
              </CardTitle>
              <p className="text-gray-700 leading-relaxed">
                We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
              </p>
            </section>

            <Separator />

            <section>
              <CardTitle className="text-2xl font-semibold text-gray-900 mb-4">
                Contact Us
              </CardTitle>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:info@strathwell.com" className="text-blue-600 hover:text-blue-700">
                  info@strathwell.com
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
