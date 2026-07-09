import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { usePrayerPeriod } from "@/context/PrayerPeriodContext";
import type { PrayerPeriod } from "@/lib/prayerPeriod";

type PrayerPhase = "night" | "dawn" | "day" | "asr" | "sunset";
type AuroraMode = PrayerPhase | "auto";

interface AuroraThemeProps {
  children: ReactNode;
  className?: string;
}

interface AuroraThemeState {
  phase: PrayerPhase;
  style: CSSProperties;
}

interface AuroraPalette {
  base: string;
  deep: string;
  primary: string;
  secondary: string;
  tertiary: string;
  glow: string;
  veil: string;
}

const PALETTES: Record<PrayerPhase, AuroraPalette> = {
  night: {
    base: "232 45% 8%",
    deep: "244 56% 12%",
    primary: "256 82% 63%",
    secondary: "200 92% 62%",
    tertiary: "166 82% 54%",
    glow: "190 96% 72%",
    veil: "220 40% 6%",
  },
  dawn: {
    base: "225 52% 12%",
    deep: "216 62% 16%",
    primary: "198 95% 68%",
    secondary: "274 82% 67%",
    tertiary: "42 96% 71%",
    glow: "24 98% 74%",
    veil: "228 44% 8%",
  },
  day: {
    base: "186 48% 15%",
    deep: "192 54% 18%",
    primary: "162 72% 54%",
    secondary: "204 92% 60%",
    tertiary: "44 95% 62%",
    glow: "160 86% 68%",
    veil: "178 34% 10%",
  },
  asr: {
    base: "200 34% 14%",
    deep: "214 48% 18%",
    primary: "42 96% 63%",
    secondary: "172 66% 54%",
    tertiary: "24 94% 58%",
    glow: "188 78% 67%",
    veil: "206 30% 10%",
  },
  sunset: {
    base: "242 42% 12%",
    deep: "268 48% 16%",
    primary: "24 98% 66%",
    secondary: "344 84% 64%",
    tertiary: "196 88% 62%",
    glow: "48 98% 72%",
    veil: "250 38% 8%",
  },
};

const PERIOD_TO_PHASE: Record<PrayerPeriod, PrayerPhase> = {
  fajr: "dawn",
  sunrise: "dawn",
  zuhr: "day",
  asr: "asr",
  maghrib: "sunset",
  isha: "night",
};

const PERIOD_LABELS: Record<PrayerPeriod, string> = {
  fajr: "الفجر",
  sunrise: "الشروق",
  zuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

const AURORA_CYCLE: AuroraMode[] = ["auto", "night", "dawn", "day", "asr", "sunset"];
const AURORA_MODE_STORAGE_KEY = "aurora-mode";
const AURORA_MODE_EVENT = "aurora-mode-change";

function buildTheme(phase: PrayerPhase): AuroraThemeState {
  const palette = PALETTES[phase];

  return {
    phase,
    style: {
      ["--aurora-base" as never]: palette.base,
      ["--aurora-deep" as never]: palette.deep,
      ["--aurora-primary" as never]: palette.primary,
      ["--aurora-secondary" as never]: palette.secondary,
      ["--aurora-tertiary" as never]: palette.tertiary,
      ["--aurora-glow" as never]: palette.glow,
      ["--aurora-veil" as never]: palette.veil,
    } as CSSProperties,
  };
}

export function AuroraTheme({ children, className = "" }: AuroraThemeProps) {
  const { period } = usePrayerPeriod();
  const [auroraMode, setAuroraMode] = useState<AuroraMode>("auto");
  const activePhase = auroraMode === "auto" ? PERIOD_TO_PHASE[period] : auroraMode;
  const [theme, setTheme] = useState<AuroraThemeState>(() => buildTheme(PERIOD_TO_PHASE[period]));

  useEffect(() => {
    setTheme(buildTheme(activePhase));
  }, [activePhase]);

  useEffect(() => {
    const syncAuroraMode = () => {
      const stored = window.localStorage.getItem(AURORA_MODE_STORAGE_KEY);
      if (AURORA_CYCLE.includes(stored as AuroraMode)) {
        setAuroraMode(stored as AuroraMode);
      }
    };

    syncAuroraMode();
    window.addEventListener(AURORA_MODE_EVENT, syncAuroraMode);

    return () => {
      window.removeEventListener(AURORA_MODE_EVENT, syncAuroraMode);
      document.documentElement.style.removeProperty("--aurora-base");
      document.documentElement.style.removeProperty("--aurora-deep");
      document.documentElement.style.removeProperty("--aurora-primary");
      document.documentElement.style.removeProperty("--aurora-secondary");
      document.documentElement.style.removeProperty("--aurora-tertiary");
      document.documentElement.style.removeProperty("--aurora-glow");
      document.documentElement.style.removeProperty("--aurora-veil");
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--aurora-base", theme.style["--aurora-base"] as string);
    root.style.setProperty("--aurora-deep", theme.style["--aurora-deep"] as string);
    root.style.setProperty("--aurora-primary", theme.style["--aurora-primary"] as string);
    root.style.setProperty("--aurora-secondary", theme.style["--aurora-secondary"] as string);
    root.style.setProperty("--aurora-tertiary", theme.style["--aurora-tertiary"] as string);
    root.style.setProperty("--aurora-glow", theme.style["--aurora-glow"] as string);
    root.style.setProperty("--aurora-veil", theme.style["--aurora-veil"] as string);
  }, [theme]);

  return (
    <div
      className={`relative isolate min-h-screen overflow-hidden font-sans text-foreground ${className}`.trim()}
      style={theme.style}
      data-aurora-phase={theme.phase}
      data-prayer-period={period}
    >
      <AnimatedBackground prayerTime={period} />
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
      <div className="pointer-events-none fixed bottom-4 left-4 z-[4] rounded-full border border-white/20 bg-black/20 px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-2xl backdrop-blur-xl">
        <span className="inline-flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "hsl(var(--aurora-glow))" }}
          />
          <span>سماء الصلاة</span>
          <span className="text-white/70">{PERIOD_LABELS[period]}</span>
        </span>
      </div>
    </div>
  );
}
