import React from "react";
import { cn } from "@/lib/utils";
import type { SectionTheme } from "../types";
import { getThemeTextClasses } from "../theme";

type EyebrowProps = {
  theme: SectionTheme;
  className?: string;
  children: React.ReactNode;
};

const Eyebrow: React.FC<EyebrowProps> = ({ theme, className, children }) => {
  const textClasses = getThemeTextClasses(theme);

  return (
    <span
      className={cn(
        "inline-flex items-center text-xs uppercase tracking-caps",
        textClasses.eyebrow,
        className
      )}
    >
      {children}
    </span>
  );
};

export default Eyebrow;
