import React from "react";
import { cn } from "@/lib/utils";
import type { SectionTheme } from "../types";
import { getThemeTextClasses } from "../theme";

type DisplayH1Props = {
  theme: SectionTheme;
  className?: string;
  children: React.ReactNode;
};

const DisplayH1: React.FC<DisplayH1Props> = ({ theme, className, children }) => {
  const textClasses = getThemeTextClasses(theme);

  return (
    <h1
      className={cn(
        "font-display text-4xl font-semibold leading-[1.08] md:text-6xl lg:text-7xl text-balance",
        textClasses.heading,
        className
      )}
    >
      {children}
    </h1>
  );
};

export default DisplayH1;
