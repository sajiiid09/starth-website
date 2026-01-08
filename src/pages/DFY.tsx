import React, { useState } from "react";
import { DFYLead } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, Clock, Award, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-white">
      <DFYHero />
      <DFYProcess />
      <DFYForm onSubmit={handleFormSubmit} />
    </div>
  );
}