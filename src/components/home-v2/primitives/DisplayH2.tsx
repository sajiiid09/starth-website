import React from "react";
import { cn } from "@/lib/utils";
import type { SectionTheme } from "../types";
import { getThemeTextClasses } from "../theme";

type DisplayH2Props = {
  theme: SectionTheme;
  className?: string;
  children: React.ReactNode;
};

const DisplayH2: React.FC<DisplayH2Props> = ({ theme, className, children }) => {
  const textClasses = getThemeTextClasses(theme);

  return (
    <h2
      className={cn(
        "font-display text-3xl font-semibold leading-[1.12] md:text-5xl text-balance",
        textClasses.heading,
        className
      )}
    >
      {children}
    </h2>
  );
};

export default DisplayH2;
