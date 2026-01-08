import React from "react";
import type { NavTheme } from "../navTheme";

type NavThemeState = {
  activeTheme: NavTheme;
  activeSectionId?: string;
  setActiveSection: (id: string, theme: NavTheme) => void;
};

const NavThemeContext = React.createContext<NavThemeState | undefined>(undefined);

export const NavThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveTheme] = React.useState<NavTheme>("light");
  const [activeSectionId, setActiveSectionId] = React.useState<string | undefined>(undefined);

  const setActiveSection = React.useCallback((id: string, theme: NavTheme) => {
    setActiveSectionId(id);
    setActiveTheme(theme);
  }, []);

  const value = React.useMemo(
    () => ({ activeTheme, activeSectionId, setActiveSection }),
    [activeTheme, activeSectionId, setActiveSection]
  );

  return <NavThemeContext.Provider value={value}>{children}</NavThemeContext.Provider>;
};

export const useNavTheme = () => {
  const context = React.useContext(NavThemeContext);
  if (!context) {
    throw new Error("useNavTheme must be used within NavThemeProvider");
  }
  return context;
};
