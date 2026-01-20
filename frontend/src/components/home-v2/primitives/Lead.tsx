import React from "react";
import { cn } from "@/lib/utils";
import type { SectionTheme } from "../types";
import { getThemeTextClasses } from "../theme";

type LeadProps = {
  theme: SectionTheme;
  className?: string;
  children: React.ReactNode;
};

const Lead: React.FC<LeadProps> = ({ theme, className, children }) => {
  const textClasses = getThemeTextClasses(theme);

  return (
    <p
      className={cn(
        "text-base leading-relaxed md:text-lg",
        textClasses.body,
        className
      )}
    >
      {children}
    </p>
  );
};

export default Lead;
