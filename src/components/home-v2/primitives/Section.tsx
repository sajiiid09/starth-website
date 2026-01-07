import React from "react";
import { cn } from "@/lib/utils";
import { defaultSectionPaddingY } from "../constants";
import type { SectionTheme } from "../types";

type SectionProps = {
  theme: SectionTheme;
  className?: string;
  id?: string;
  dataSection?: string;
  children: React.ReactNode;
};

const themeClasses: Record<SectionTheme, string> = {
  light: "bg-brand-light",
  dark: "bg-brand-dark",
  cream: "bg-brand-cream",
  blue: "bg-brand-blue"
};

const Section: React.FC<SectionProps> = ({ theme, className, id, dataSection, children }) => {
  return (
    <section
      id={id}
      data-theme={theme}
      data-section={dataSection}
      className={cn(
        "py-[var(--section-pad)] md:py-[var(--section-pad-desktop)]",
        themeClasses[theme],
        className
      )}
      style={
        {
          "--section-pad": `${defaultSectionPaddingY.mobile}px`,
          "--section-pad-desktop": `${defaultSectionPaddingY.desktop}px`
        } as React.CSSProperties
      }
    >
      {children}
    </section>
  );
};

export default Section;
