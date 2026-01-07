import React from "react";
import { cn } from "@/lib/utils";

type TagPillProps = {
  className?: string;
  children: React.ReactNode;
};

const TagPill: React.FC<TagPillProps> = ({ className, children }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-brand-coral/40 bg-brand-coral/20 px-3 py-1 text-xs font-medium uppercase tracking-caps text-brand-dark",
        className
      )}
    >
      {children}
    </span>
  );
};

export default TagPill;
