
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
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
              <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                1. Acceptance of Terms
              </CardTitle>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Strathwell's event orchestration platform, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <Separator />

            <section>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                2. Use License
              </CardTitle>
              <p className="text-gray-700 leading-relaxed">
                Permission is granted to temporarily access Strathwell's platform for personal, non-commercial transitory viewing only.
              </p>
            </section>

            <Separator />

            <section>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                8. Contact Information
              </CardTitle>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at{" "}
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
