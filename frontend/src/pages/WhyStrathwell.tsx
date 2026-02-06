
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ArrowRight, Sparkle, ShieldCheck, Lightning } from '@phosphor-icons/react';

const advantages = [
  {
    icon: Sparkle,
    title: 'AI-Powered Orchestration',
    description: 'Our intelligent platform analyzes your needs to match you with perfect venues and vendors in seconds, saving you hundreds of hours of manual research and negotiation.',
    color: 'blue',
  },
  {
    icon: ShieldCheck,
    title: 'Curated & Vetted Marketplace',
    description: 'We prioritize quality over quantity. Every venue and service provider on our platform is hand-picked, verified, and held to the highest standards of excellence.',
    color: 'green',
  },
  {
    icon: Lightning,
    title: 'Seamless End-to-End Execution',
    description: 'From initial concept to post-event analytics, manage every detail in one place. Handle booking, contracts, marketing, and checklists without ever leaving the platform.',
    color: 'purple',
  },
];

const comparisonData = {
  headers: ['Feature', 'Strathwell Platform', 'Strathwell (Plan with Us)', 'Virtual Robotics', 'Manual Planning'],
  rows: [
    { feature: 'Speed to Shortlist', platform: 'Seconds', planWithUs: '1-2 Days', robotics: 'N/A', manual: 'Weeks to Months' },
    { feature: 'Vendor Vetting', platform: 'Verified & Curated', planWithUs: 'Verified & Curated', robotics: 'N/A', manual: 'Unreliable / DIY' },
    { feature: 'Cost Transparency', platform: 'High', planWithUs: 'High', robotics: 'N/A', manual: 'Low' },
    { feature: 'Data-Driven Insights', platform: 'Built-in', planWithUs: 'Expert-Led w/ Data', robotics: '3D Simulation', manual: 'None' },
    { feature: 'Service Fee', platform: 'Low & Transparent', planWithUs: 'Transparent Quote', robotics: 'Platform Feature', manual: 'N/A' },
    { feature: 'Management Tools', platform: 'Integrated Suite', planWithUs: 'Integrated Suite', robotics: 'AI Setup Plan', manual: 'Spreadsheets & Email' },
  ],
};

export default function WhyStrathwellPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-sm font-medium text-blue-700 mb-6">
            <Check className="w-4 h-4" />
            The Strathwell Advantage
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            An Unfairly Good
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Event Planning Experience
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover why the world's most innovative companies trust Strathwell to orchestrate their most important events.
          </p>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {advantages.map((advantage) => {
              const colors = {
                blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
                green: { bg: 'bg-green-100', text: 'text-green-600' },
                purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
              };
              return (
                <Card key={advantage.title} className="border-none shadow-lg text-center">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 mx-auto mb-6 ${colors[advantage.color].bg} rounded-full flex items-center justify-center`}>
                      <advantage.icon className={`w-8 h-8 ${colors[advantage.color].text}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{advantage.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{advantage.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Comparison Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How We Compare
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A modern solution for a modern world. See how Strathwell stacks up.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr>
                  {comparisonData.headers.map((header, i) => (
                    <th key={i} className={`p-4 text-sm font-semibold uppercase text-gray-500 ${i === 0 ? '' : 'text-center'}`}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-t border-gray-200">
                    <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="p-4 text-center">
                      <span className="inline-block font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{row.platform}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">{row.planWithUs}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">{row.robotics}</span>
                    </td>
                    <td className="p-4 text-center text-gray-600">{row.manual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-none text-white">
            <CardContent className="p-12">
              <Sparkle className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h3 className="text-3xl font-bold mb-4">
                Ready to Experience the Future of Events?
              </h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Let our AI find your perfect venue or speak to our experts for a full-service experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Link to={createPageUrl("AIPlanner")}>
                  <Button size="lg" className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-200">
                    Plan with AI
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("DFY")}>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-auto text-purple-300 border-purple-300 hover:bg-purple-300/10"
                  >
                    Plan with Us
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
