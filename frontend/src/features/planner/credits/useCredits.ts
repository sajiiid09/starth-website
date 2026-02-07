import React from "react";
import { getCreditsConfig, loadCredits, saveCredits } from "@/features/planner/credits/storage";

type UseCreditsResult = {
  credits: number;
  deduct: (amount: number) => boolean;
  add: (amount: number) => void;
  resetToDefault: () => void;
  isEnabled: boolean;
};

export const useCredits = (): UseCreditsResult => {
  const config = React.useMemo(() => getCreditsConfig(), []);
  const [credits, setCredits] = React.useState(() => loadCredits(config.defaultCredits));
  const creditsRef = React.useRef(credits);

  React.useEffect(() => {
    creditsRef.current = credits;
  }, [credits]);

  React.useEffect(() => {
    if (!config.isEnabled) return;
    saveCredits(credits);
  }, [config.isEnabled, credits]);

  const deduct = React.useCallback(
    (amount: number) => {
      if (!config.isEnabled) return true;

      const normalized = Math.max(1, Math.round(amount));
      if (creditsRef.current < normalized) return false;

      const next = creditsRef.current - normalized;
      creditsRef.current = next;
      setCredits(next);
      return true;
    },
    [config.isEnabled]
  );

  const add = React.useCallback((amount: number) => {
    const normalized = Math.max(1, Math.round(amount));
    const next = creditsRef.current + normalized;
    creditsRef.current = next;
    setCredits(next);
  }, []);

  const resetToDefault = React.useCallback(() => {
    creditsRef.current = config.defaultCredits;
    setCredits(config.defaultCredits);
  }, [config.defaultCredits]);

  return {
    credits,
    deduct,
    add,
    resetToDefault,
    isEnabled: config.isEnabled
  };
};
