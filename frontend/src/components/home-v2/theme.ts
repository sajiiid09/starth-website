import type { SectionTheme } from "./types";

export const getThemeTextClasses = (theme: SectionTheme) => {
  if (theme === "dark") {
    return {
      heading: "text-brand-light",
      body: "text-brand-light/70",
      eyebrow: "text-brand-light/70"
    };
  }

  return {
    heading: "text-brand-dark",
    body: "text-brand-dark/70",
    eyebrow: "text-brand-dark/60"
  };
};

export const getThemeBorderClasses = (theme: SectionTheme) => {
  if (theme === "dark") {
    return "border-brand-light/15";
  }

  return "border-brand-dark/10";
};
