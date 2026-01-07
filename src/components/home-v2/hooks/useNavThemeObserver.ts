import React from "react";
import { useNavTheme } from "../state/navThemeStore";
import type { NavTheme } from "../navTheme";

const getSectionElements = () =>
  Array.from(document.querySelectorAll<HTMLElement>("section[data-theme][data-section]"));

export const useNavThemeObserver = () => {
  const { setActiveSection } = useNavTheme();

  React.useEffect(() => {
    const sections = getSectionElements();
    if (sections.length === 0) {
      return;
    }

    const activateFromSection = (section: HTMLElement) => {
      const theme = section.dataset.theme as NavTheme | undefined;
      const id = section.getAttribute("id") || section.dataset.section || "";
      if (theme) {
        setActiveSection(id, theme);
      }
    };

    activateFromSection(sections[0]);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length === 0) {
          return;
        }

        const sorted = visibleEntries
          .map((entry) => ({
            entry,
            distance: Math.abs(entry.boundingClientRect.top)
          }))
          .sort((a, b) => a.distance - b.distance);

        const closest = sorted[0]?.entry;
        if (closest?.target instanceof HTMLElement) {
          activateFromSection(closest.target);
        }
      },
      {
        rootMargin: "-10% 0px -80% 0px",
        threshold: [0, 0.1, 0.25]
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [setActiveSection]);
};
