import React from "react";
import { cn } from "@/lib/utils";

type MotionCardProps = {
  title: string;
  body: string;
  className?: string;
};

const MotionCard = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ title, body, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-r16 border border-white/15 bg-white/10 px-6 py-5 text-left text-brand-light shadow-soft backdrop-blur-md",
          className
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-caps text-white/70">
          Insight
        </p>
        <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/75">{body}</p>
      </div>
    );
  }
);

MotionCard.displayName = "MotionCard";

export default MotionCard;
