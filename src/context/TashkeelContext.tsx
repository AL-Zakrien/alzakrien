import { createContext, useContext, useState, useMemo, type ReactNode } from "react";

interface TashkeelContextValue {
  showTashkeel: boolean;
  toggleTashkeel: () => void;
}

const TashkeelContext = createContext<TashkeelContextValue | null>(null);

const TASHKEEL_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g;

export const removeTashkeel = (text: string): string => text.replace(TASHKEEL_REGEX, "");

export function TashkeelProvider({ children }: { children: ReactNode }) {
  const [showTashkeel, setShowTashkeel] = useState(true);

  const value = useMemo<TashkeelContextValue>(() => ({
    showTashkeel,
    toggleTashkeel: () => setShowTashkeel((prev) => !prev),
  }), [showTashkeel]);

  return <TashkeelContext.Provider value={value}>{children}</TashkeelContext.Provider>;
}

export function useTashkeel() {
  const context = useContext(TashkeelContext);
  if (!context) {
    throw new Error("useTashkeel must be used within TashkeelProvider");
  }
  return context;
}
