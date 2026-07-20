import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  computePrayerPeriod,
  fetchPrayerTimings,
  getInitialPrayerPeriod,
  readCachedTimings,
  type PrayerPeriod,
  type PrayerTimings,
} from "@/lib/prayerPeriod";

interface PrayerPeriodContextValue {
  /** Live, real-time period computed from the current time. */
  period: PrayerPeriod;
  /** Effective period — uses devOverride when set, otherwise live period. */
  effectivePeriod: PrayerPeriod;
  timings: PrayerTimings | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  /** Dev-only override for testing aurora palettes. */
  devOverride: PrayerPeriod | null;
  setDevOverride: (p: PrayerPeriod | null) => void;
}

const PrayerPeriodContext = createContext<PrayerPeriodContextValue | null>(null);

function syncPeriodFromTimings(timings: PrayerTimings | null, setPeriod: (p: PrayerPeriod) => void) {
  if (!timings) return;
  setPeriod(computePrayerPeriod(timings));
}

export function PrayerPeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<PrayerPeriod>(() => getInitialPrayerPeriod());
  const [timings, setTimings] = useState<PrayerTimings | null>(() => readCachedTimings());
  const [isLoading, setIsLoading] = useState(() => readCachedTimings() === null);
  const [devOverride, setDevOverride] = useState<PrayerPeriod | null>(null);

  const refresh = useCallback(async () => {
    try {
      const nextTimings = await fetchPrayerTimings();
      setTimings(nextTimings);
      setPeriod(computePrayerPeriod(nextTimings));
    } catch (error) {
      console.error("Prayer period fetch error:", error);
      const cached = readCachedTimings();
      if (cached) {
        setTimings(cached);
        setPeriod(computePrayerPeriod(cached));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const tick = () => syncPeriodFromTimings(timings, setPeriod);
    tick();
    const intervalId = window.setInterval(tick, 60_000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [timings]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "prayerTimes") return;
      const cached = readCachedTimings();
      if (!cached) return;
      setTimings(cached);
      setPeriod(computePrayerPeriod(cached));
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const effectivePeriod = devOverride ?? period;

  const value = useMemo(
    () => ({ period, effectivePeriod, timings, isLoading, refresh, devOverride, setDevOverride }),
    [period, effectivePeriod, timings, isLoading, refresh, devOverride],
  );

  return <PrayerPeriodContext.Provider value={value}>{children}</PrayerPeriodContext.Provider>;
}

export function usePrayerPeriod() {
  const context = useContext(PrayerPeriodContext);
  if (!context) {
    throw new Error("usePrayerPeriod must be used within PrayerPeriodProvider");
  }
  return context;
}
