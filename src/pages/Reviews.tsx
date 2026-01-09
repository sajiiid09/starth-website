import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const Reviews: React.FC = () => {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-semibold text-brand-dark md:text-5xl">
        Customer Reviews
      </h1>
      <p className="mt-4 text-base text-brand-dark/70">
        Coming soon. We’re compiling customer stories and verified testimonials.
      </p>
      <Link
        to={createPageUrl("Home")}
        className="mt-6 inline-flex items-center rounded-full border border-brand-dark/20 px-5 py-2 text-sm font-medium text-brand-dark transition hover:border-brand-dark/40 hover:bg-brand-cream"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default Reviews;
