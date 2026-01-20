import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type WizardStep = {
  title: string;
  subtitle: string;
};

type OnboardingWizardShellProps = {
  steps: WizardStep[];
  currentStep: number;
  isSaved: boolean;
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  nextLabel?: string;
  backLabel?: string;
  children: React.ReactNode;
};

const OnboardingWizardShell: React.FC<OnboardingWizardShellProps> = ({
  steps,
  currentStep,
  isSaved,
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  nextLabel = "Next",
  backLabel = "Back",
  children
}) => {
  const step = steps[currentStep];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
            Step {currentStep + 1} of {steps.length}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-900">{step.title}</h1>
          <p className="mt-2 text-sm text-gray-600">{step.subtitle}</p>
        </div>
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
            isSaved ? "border-brand-teal/40 text-brand-teal" : "border-brand-dark/20 text-brand-dark/50"
          )}
        >
          {isSaved ? "Saved" : "Saving"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {steps.map((item, index) => (
          <div
            key={item.title}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
              index === currentStep
                ? "border-brand-dark bg-brand-dark text-brand-light"
                : "border-brand-dark/15 bg-white text-brand-dark/60"
            )}
          >
            {index + 1}
            <span className="hidden sm:inline">{item.title}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-card"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          className="rounded-full"
          onClick={onBack}
          disabled={!canGoBack}
        >
          {backLabel}
        </Button>
        <Button
          className="rounded-full bg-brand-teal text-brand-light"
          onClick={onNext}
          disabled={!canGoNext}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingWizardShell;
