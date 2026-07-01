import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
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

const PHASE_LABELS: Record<PrayerPhase, string> = {
  night: "ليل الشفق",
  dawn: "فجر الشفق",
  day: "نهار مضيء",
  asr: "عصر ذهبي",
  sunset: "غروب متوهج",
};

const AURORA_CYCLE: AuroraMode[] = ["auto", "night", "dawn", "day", "asr", "sunset"];
const AURORA_MODE_STORAGE_KEY = "aurora-mode";
const AURORA_MODE_EVENT = "aurora-mode-change";

function extractHours(date: Date) {
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

function getPhase(now: Date): PrayerPhase {
  const currentHour = extractHours(now);

  if (currentHour >= 19 || currentHour < 4.5) return "night";
  if (currentHour < 7.5) return "dawn";
  if (currentHour < 12.5) return "day";
  if (currentHour < 16.5) return "asr";
  return "sunset";
}

function readStoredAuroraMode(): AuroraMode {
  if (typeof window === "undefined") {
    return "auto";
  }

  const stored = window.localStorage.getItem(AURORA_MODE_STORAGE_KEY);

  return AURORA_CYCLE.includes(stored as AuroraMode) ? (stored as AuroraMode) : "auto";
}

function buildTheme(now = new Date(), mode: AuroraMode = "auto"): AuroraThemeState {
  const phase = mode === "auto" ? getPhase(now) : mode;
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
  const [auroraMode, setAuroraMode] = useState<AuroraMode>(() => readStoredAuroraMode());
  const [theme, setTheme] = useState<AuroraThemeState>(() => buildTheme(new Date(), readStoredAuroraMode()));

  useEffect(() => {
    const syncTheme = () => setTheme(buildTheme(new Date(), readStoredAuroraMode()));
    const syncAuroraMode = () => setAuroraMode(readStoredAuroraMode());

    syncTheme();
    syncAuroraMode();

    const intervalId = window.setInterval(syncTheme, 60_000);
    window.addEventListener("storage", syncTheme);
    window.addEventListener(AURORA_MODE_EVENT, syncAuroraMode);
    document.addEventListener("visibilitychange", syncTheme);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener(AURORA_MODE_EVENT, syncAuroraMode);
      document.removeEventListener("visibilitychange", syncTheme);

      document.documentElement.style.removeProperty("--aurora-base");
      document.documentElement.style.removeProperty("--aurora-deep");
      document.documentElement.style.removeProperty("--aurora-primary");
      document.documentElement.style.removeProperty("--aurora-secondary");
      document.documentElement.style.removeProperty("--aurora-tertiary");
      document.documentElement.style.removeProperty("--aurora-glow");
      document.documentElement.style.removeProperty("--aurora-veil");
      document.body.style.removeProperty("background-color");
      document.body.style.removeProperty("background-image");
      document.body.style.removeProperty("background-attachment");
      document.body.style.removeProperty("background-size");
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(AURORA_MODE_STORAGE_KEY, auroraMode);
    setTheme(buildTheme(new Date(), auroraMode));
  }, [auroraMode]);

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--aurora-base", theme.style["--aurora-base"] as string);
    root.style.setProperty("--aurora-deep", theme.style["--aurora-deep"] as string);
    root.style.setProperty("--aurora-primary", theme.style["--aurora-primary"] as string);
    root.style.setProperty("--aurora-secondary", theme.style["--aurora-secondary"] as string);
    root.style.setProperty("--aurora-tertiary", theme.style["--aurora-tertiary"] as string);
    root.style.setProperty("--aurora-glow", theme.style["--aurora-glow"] as string);
    root.style.setProperty("--aurora-veil", theme.style["--aurora-veil"] as string);

    const bodyBackground = [
      "radial-gradient(circle at 18% 16%, hsl(var(--aurora-primary) / 0.9), transparent 28%)",
      "radial-gradient(circle at 82% 12%, hsl(var(--aurora-secondary) / 0.72), transparent 26%)",
      "radial-gradient(circle at 50% 82%, hsl(var(--aurora-tertiary) / 0.48), transparent 36%)",
      "linear-gradient(135deg, hsl(var(--aurora-base) / 1), hsl(var(--aurora-deep) / 1))",
    ].join(", ");

    document.body.style.setProperty("background-color", "hsl(var(--aurora-deep))", "important");
    document.body.style.setProperty("background-image", bodyBackground, "important");
    document.body.style.setProperty("background-attachment", "fixed", "important");
    document.body.style.setProperty("background-size", "cover", "important");
  }, [theme]);

  return (
    <div
      className={`relative isolate min-h-screen overflow-hidden font-sans text-foreground ${className}`.trim()}
      style={theme.style}
      data-aurora-phase={theme.phase}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundColor: "hsl(var(--aurora-base))",
          backgroundImage: [
            "radial-gradient(circle at 18% 18%, hsl(var(--aurora-primary) / 0.38), transparent 38%)",
            "radial-gradient(circle at 82% 14%, hsl(var(--aurora-secondary) / 0.32), transparent 34%)",
            "radial-gradient(circle at 50% 84%, hsl(var(--aurora-tertiary) / 0.24), transparent 44%)",
            "linear-gradient(135deg, hsl(var(--aurora-base) / 0.92), hsl(var(--aurora-deep) / 0.98))",
          ].join(", "),
          transform: "translateZ(0)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[1] h-64 opacity-95"
        style={{
          background: [
            "radial-gradient(circle at 20% 30%, hsl(var(--aurora-primary) / 0.8), transparent 28%)",
            "radial-gradient(circle at 80% 10%, hsl(var(--aurora-secondary) / 0.7), transparent 26%)",
            "radial-gradient(circle at 50% 0%, hsl(var(--aurora-glow) / 0.72), transparent 38%)",
            "linear-gradient(180deg, hsl(var(--aurora-deep) / 0.96), transparent)",
          ].join(", "),
          filter: "blur(18px)",
          mixBlendMode: "screen",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[2] opacity-100"
        style={{
          backgroundImage: [
            "radial-gradient(circle at 50% 0%, hsl(var(--aurora-glow) / 0.34), transparent 28%)",
            "radial-gradient(circle at 10% 70%, hsl(var(--aurora-primary) / 0.24), transparent 24%)",
            "radial-gradient(circle at 90% 65%, hsl(var(--aurora-secondary) / 0.24), transparent 24%)",
            "radial-gradient(circle at 50% 50%, hsl(var(--aurora-tertiary) / 0.12), transparent 52%)",
          ].join(", "),
          filter: "blur(30px)",
          animation: "auroraDrift 18s ease-in-out infinite alternate",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[3] opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--aurora-veil) / 0.16) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--aurora-veil) / 0.16) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(circle at center, black 55%, transparent 100%)",
        }}
      />
      <div className="pointer-events-none fixed bottom-4 left-4 z-[4] rounded-full border border-white/20 bg-black/20 px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-2xl backdrop-blur-xl">
        <span className="inline-flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "hsl(var(--aurora-glow))" }}
          />
          <span>شفق قطبي</span>
          <span className="text-white/70">{PHASE_LABELS[theme.phase]}</span>
        </span>
      </div>
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}
