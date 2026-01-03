import React from "react";
import { motion } from "framer-motion";

const events = [
  "Limitless at Google HQ",
  "DevFest NYC",
  "MIT Innovation Forum",
  "Harvard Business Summit",
];

const incubators = [
  "Google for Startups",
  "Founder Institute",
];

const partners = [
  "Next Insurance",
  "Bluehost", 
  "ByteDance",
  "IHG Hotels",
  "Marriott",
  "+ Real Estate Groups"
];

const supporters = [
  "Google",
  "Eventbrite",
  "ServiceNow",
  "NVIDIA",
  "AnitaB.org",
  "Wells Fargo",
  "Formula 1"
];

export default function CompanyLogos() {
  return (
    <section className="py-16 bg-gray-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Events Orchestrated */}
        <div className="text-center space-y-4">
          <h2 className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-500">
            Events Orchestrated
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {events.map((label, index) => (
              <motion.span
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-800 bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />
                {label}
                <span className="sr-only">
                  {label} is an event orchestrated by Strathwell's AI platform
                </span>
              </motion.span>
            ))}
          </div>
        </div>

        {/* Incubators & Infrastructure Partners */}
        <div className="text-center space-y-4">
          <h2 className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-500">
            Incubators & Infrastructure Partners
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
            <motion.img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/ae90c5889_Logo_for_Google_for_Startups_page.png" 
              alt="Google for Startups" 
              className="h-16 md:h-20 opacity-70 hover:opacity-100 transition-all"
              whileHover={{ scale: 1.1 }}
            />
            <span className="sr-only">Google for Startups is an incubator and infrastructure partner supporting Strathwell's event platform</span>
            <motion.img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/168babc54_pre-seed-accelerator-logos-7924b346772eb9748a95fc88781f1d8de3673a0be405a2c56b4953f181c715e3.png" 
              alt="Founder Institute" 
              className="h-20 md:h-24 opacity-70 hover:opacity-100 transition-all"
              whileHover={{ scale: 1.1 }}
            />
            <span className="sr-only">Founder Institute is an incubator and infrastructure partner supporting Strathwell's event platform</span>
          </div>
        </div>

        {/* Trusted Partners */}
        <div className="text-center space-y-4">
          <h2 className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-500">
            Trusted Partners
          </h2>
          <div className="flex flex-wrap justify-center gap-10 items-center opacity-80">
            {partners.map((name, index) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="hover:opacity-100 transition-opacity"
              >
                <div className="text-gray-700 font-medium text-sm">
                  {name}
                </div>
                <span className="sr-only">
                  {name} is a trusted partner of Strathwell for events and venues
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Supported By / Attendees From */}
        <div className="text-center space-y-4">
          <h2 className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-500">
            Supported By / Attendees From
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {supporters.map((brand, index) => (
              <motion.span
                key={brand}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                {brand}
                <span className="sr-only">
                  {brand} supports and attends events organized through Strathwell
                </span>
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}