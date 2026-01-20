import React, { useState } from "react";
import { DFYLead } from "@/api/entities";

import DFYHero from "../components/dfy/DFYHero";
import DFYProcess from "../components/dfy/DFYProcess";
import DFYForm from "../components/dfy/DFYForm";
import DFYSuccess from "../components/dfy/DFYSuccess";

export default function DFYPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const handleFormSubmit = async (formData) => {
    try {
      const lead = await DFYLead.create(formData);
      setSubmittedData(formData);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting DFY request:", error);
      throw error;
    }
  };

  if (isSubmitted) {
    return <DFYSuccess data={submittedData} />;
  }

  return (
    <div className="min-h-screen bg-brand-light text-brand-dark">
      <DFYHero />
      <DFYProcess />
      <DFYForm onSubmit={handleFormSubmit} />
    </div>
  );
}
