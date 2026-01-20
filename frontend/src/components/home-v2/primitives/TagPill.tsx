import React from "react";
import { cn } from "@/lib/utils";

type TagPillVariant = "coral" | "neutral" | "dark";
type TagPillSize = "sm" | "md";

type TagPillProps = {
  className?: string;
  variant?: TagPillVariant;
  size?: TagPillSize;
  children: React.ReactNode;
};

const variantClasses: Record<TagPillVariant, string> = {
  coral:
    "border-brand-coral/40 bg-brand-coral/20 text-brand-dark hover:border-brand-coral/60 hover:bg-brand-coral/30",
  neutral:
    "border-brand-dark/15 bg-brand-light text-brand-dark hover:border-brand-dark/30 hover:bg-brand-blue/40",
  dark:
    "border-brand-dark/40 bg-brand-dark text-brand-light hover:border-brand-dark/60 hover:bg-brand-dark/90"
};

const sizeClasses: Record<TagPillSize, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm"
};

const TagPill: React.FC<TagPillProps> = ({
  className,
  variant = "coral",
  size = "sm",
  children
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium uppercase tracking-caps transition duration-250 ease-smooth",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default TagPill;
