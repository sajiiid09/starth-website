import type { SectionTheme } from "./types";

export type NavTheme = SectionTheme;

type NavThemeClasses = {
  shell: string;
  border: string;
  text: string;
  link: string;
  linkHover: string;
  cta: string;
  ctaHover: string;
  dropdown: string;
  dropdownItem: string;
};

export const navThemeClasses: Record<NavTheme, NavThemeClasses> = {
  light: {
    shell: "bg-brand-light/80 backdrop-blur-md",
    border: "border-brand-dark/10",
    text: "text-brand-dark",
    link: "text-brand-dark/80",
    linkHover: "hover:text-brand-dark",
    cta: "border-brand-teal text-brand-teal",
    ctaHover: "hover:bg-brand-teal hover:text-brand-light",
    dropdown: "bg-brand-light text-brand-dark border-brand-dark/10",
    dropdownItem: "hover:bg-brand-dark/5"
  },
  cream: {
    shell: "bg-brand-cream/80 backdrop-blur-md",
    border: "border-brand-dark/10",
    text: "text-brand-dark",
    link: "text-brand-dark/80",
    linkHover: "hover:text-brand-dark",
    cta: "border-brand-teal text-brand-teal",
    ctaHover: "hover:bg-brand-teal hover:text-brand-light",
    dropdown: "bg-brand-cream text-brand-dark border-brand-dark/10",
    dropdownItem: "hover:bg-brand-dark/5"
  },
  blue: {
    shell: "bg-brand-blue/80 backdrop-blur-md",
    border: "border-brand-dark/10",
    text: "text-brand-dark",
    link: "text-brand-dark/80",
    linkHover: "hover:text-brand-dark",
    cta: "border-brand-teal text-brand-teal",
    ctaHover: "hover:bg-brand-teal hover:text-brand-light",
    dropdown: "bg-brand-blue text-brand-dark border-brand-dark/10",
    dropdownItem: "hover:bg-brand-dark/5"
  }
};
