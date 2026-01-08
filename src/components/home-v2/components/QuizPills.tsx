import React from "react";
import { cn } from "@/lib/utils";

type QuizOption = {
  label: string;
  value: string;
};

type QuizPillsProps = {
  options: QuizOption[];
  value: string | null;
  onChange: (value: string) => void;
};

const QuizPills: React.FC<QuizPillsProps> = ({ options, value, onChange }) => {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-3">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition duration-250 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream",
              isActive
                ? "border-brand-dark bg-brand-dark text-brand-light"
                : "border-brand-dark/15 bg-white text-brand-dark hover:border-brand-dark/30 hover:bg-brand-blue/30"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default QuizPills;
