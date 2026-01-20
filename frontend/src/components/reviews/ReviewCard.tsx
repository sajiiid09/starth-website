import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import TagPill from "@/components/home-v2/primitives/TagPill";

export type ReviewCardProps = {
  name: string;
  role: string;
  company: string;
  city: string;
  rating: number;
  quote: string;
  className?: string;
};

const ReviewCard: React.FC<ReviewCardProps> = ({
  name,
  role,
  company,
  city,
  rating,
  quote,
  className
}) => {
  const stars = Array.from({ length: 5 }, (_, index) => index < rating);

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-5 rounded-3xl border border-white/50 bg-white/85 p-6 shadow-card",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {stars.map((isFilled, index) => (
            <Star
              key={`${name}-star-${index}`}
              className={cn(
                "h-4 w-4",
                isFilled ? "text-brand-teal" : "text-brand-dark/20"
              )}
              fill={isFilled ? "currentColor" : "none"}
            />
          ))}
        </div>
        <TagPill variant="neutral" size="sm">
          {role}
        </TagPill>
      </div>

      <p className="text-sm leading-relaxed text-brand-dark/70">“{quote}”</p>

      <div className="mt-auto">
        <p className="text-base font-semibold text-brand-dark">{name}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-brand-dark/50">
          {company} · {city}
        </p>
      </div>
    </div>
  );
};

export default ReviewCard;
