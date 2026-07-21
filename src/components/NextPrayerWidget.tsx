/**
 * NextPrayerWidget — compact "next prayer" summary for the Home page.
 *
 * Design contract:
 *  - Shows ONLY the next upcoming prayer name + live countdown (mm:ss / hh:mm:ss).
 *  - No full 5-prayer table; that stays exclusive to the /adhan page.
 *  - Glass panel + SVG arc progress ring whose accent color follows the
 *    time-of-day aurora palette already established in AnimatedBackground.
 *  - Respects prefers-reduced-motion: ring animation disabled, countdown works.
 *  - Reads data from the same localStorage cache that PrayerTimersHome writes to.
 *    Falls back to a lightweight Aladhan API fetch if the cache is empty.
 */

import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { usePrayerPeriod } from "@/context/PrayerPeriodContext";
import type { PrayerPeriod } from "@/lib/prayerPeriod";
import { spring_smooth } from "@/lib/motion";
import {
  readCachedTimings,
  readPrayerSettings,
  fetchPrayerTimings,
  parseApiTime,
  type PrayerTimings,
} from "@/lib/prayerPeriod";

// Prayer-period icons (multi-tone flat SVGs from src/assets/).
// Pattern matches the existing project convention used for logo.jpg.
import fajrIcon from "@/assets/icons8-moon-and-stars.svg";
import shuruqIcon from "@/assets/icons8-sunrise-50.svg";
import duhrIcon from "@/assets/icons8-sun-50.svg";
import asrIcon from "@/assets/icons8-partly-cloudy-day-50.svg";
import maghribIcon from "@/assets/icons8-sunset-50.svg";
import ishaIcon from "@/assets/moon.svg";
// Fallback: sun.svg is not yet present in src/assets (awaiting project owner).
// Until it lands, the existing Duhr sun icon is the closest semantic match.
// Swap this import to '@/assets/sun.svg' once that file is added.
import fallbackIcon from "@/assets/icons8-sun-50.svg";

// ─────────────────────────────────────────────────
//  Prayer meta — Arabic names & aurora accent colors
// ─────────────────────────────────────────────────
interface PrayerMeta {
  arabicName: string;
  accent: string;
  track: string;
}

const PRAYER_META: Record<string, PrayerMeta> = {
  Fajr: {
    arabicName: "الفجر",
    accent: "rgba(99,102,241,0.90)",
    track: "rgba(99,102,241,0.20)",
  },
  Shuruq: {
    arabicName: "الشروق",
    // Warm sunrise gold — matches the sunrise palette in DynamicBackground.
    accent: "rgba(234,179,8,0.90)",
    track: "rgba(234,179,8,0.20)",
  },
  Dhuhr: {
    arabicName: "الظهر",
    accent: "rgba(56,189,248,0.90)",
    track: "rgba(56,189,248,0.20)",
  },
  Asr: {
    arabicName: "العصر",
    accent: "rgba(251,191,36,0.90)",
    track: "rgba(251,191,36,0.20)",
  },
  Maghrib: {
    arabicName: "المغرب",
    accent: "rgba(249,115,22,0.90)",
    track: "rgba(249,115,22,0.20)",
  },
  Isha: {
    arabicName: "العشاء",
    accent: "rgba(168,85,247,0.90)",
    track: "rgba(168,85,247,0.20)",
  },
};

// Period → icon URL. Covers all 6 prayer periods (Shuruq included
// for completeness, even though the next-prayer cycle only surfaces
// 5 of them via PRAYER_NAMES).
const PRAYER_ICON_MAP: Record<string, string> = {
  Fajr: fajrIcon,
  Shuruq: shuruqIcon,
  Dhuhr: duhrIcon,
  Asr: asrIcon,
  Maghrib: maghribIcon,
  Isha: ishaIcon,
};
const PRAYER_ICON_FALLBACK = fallbackIcon;

// Maps an aurora-system prayer period (lowercase) to this widget's
// internal key (Capitalised). Used to look up accent/track/icon/name
// when the dev preview is overriding the current period.
const AURORA_TO_WIDGET_KEY: Record<PrayerPeriod, string> = {
  fajr: "Fajr",
  sunrise: "Shuruq",
  zuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

// ─────────────────────────────────────────────────
//  Time utilities
// ─────────────────────────────────────────────────
interface NextPrayer {
  key: string;
  meta: PrayerMeta;
  minutes: number;
}

const TIMING_KEYS: Record<string, keyof PrayerTimings> = {
  Fajr: "fajr",
  Dhuhr: "dhuhr",
  Asr: "asr",
  Maghrib: "maghrib",
  Isha: "isha",
};

function computeNextPrayer(timings: PrayerTimings, nowDate: Date): NextPrayer | null {
  const currentMins = nowDate.getHours() * 60 + nowDate.getMinutes();
  const entries = PRAYER_NAMES.map((name) => ({
    key: name,
    meta: PRAYER_META[name],
    minutes: parseApiTime((timings as Record<string, string>)[TIMING_KEYS[name]] ?? ""),
  }));
  let next = entries.find((e) => e.minutes > currentMins);
  if (!next) next = entries[0];
  return next ?? null;
}

function formatCountdown(diffTotalMinutes: number, diffSeconds: number): string {
  // diffTotalMinutes already accounts for partial minute
  // we use seconds to sub-minute precision
  const totalSec = Math.max(0, diffTotalMinutes * 60 - diffSeconds);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────────
//  Main widget component
// ─────────────────────────────────────────────────
export function NextPrayerWidget() {
  const reducedMotion = useReducedMotion();
  const [timings, setTimings] = useState<PrayerTimings | null>(() => readCachedTimings());
  const [loadError, setLoadError] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const fetchedRef = useRef(false);

  // Load timings — cache-first, lightweight fetch fallback
  useEffect(() => {
    const cached = readCachedTimings();
    if (cached) {
      setTimings(cached);
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchPrayerTimings(readPrayerSettings())
      .then((t) => setTimings(t))
      .catch(() => setLoadError(true));
  }, []);

  // Live clock — tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Derived values
  const nextPrayer = timings ? computeNextPrayer(timings, now) : null;

  const currentMins = now.getHours() * 60 + now.getMinutes();
  const currentSecs = now.getSeconds();

  let diffMins = 0;
  let progressFraction = 0;

  if (nextPrayer) {
    let raw = nextPrayer.minutes - currentMins;
    if (raw <= 0) raw += 24 * 60;
    diffMins = raw;
    // For the ring: we use a 24h window for a reasonable visual arc.
    // The ring depletes as time passes toward the next prayer.
    // To get a meaningful "window" per prayer period we use the gap
    // between consecutive prayers, approximated as max(diffMins, 1).
    // Simpler: ring always starts "full" when prayer just happened and empties.
    // We don't know the previous prayer time easily here, so use a fixed
    // 24h max as denominator — ring fills from 0% at midnight to full just
    // before the prayer and resets. This is still visually informative.
    const maxWindow = 24 * 60;
    progressFraction = Math.max(0, Math.min(1, (maxWindow - diffMins) / maxWindow));
  }

  const countdown = nextPrayer ? formatCountdown(diffMins, currentSecs) : "--:--";

  // SVG ring constants
  const SVG_SIZE = 100;
  const CX = 50;
  const CY = 50;
  const RING_R = 39;
  const STROKE = 5;
  const circumference = 2 * Math.PI * RING_R;
  // Remaining arc (time left fraction of ring)
  const remainingFraction = 1 - progressFraction;
  const dashOffset = circumference * (1 - remainingFraction);

  const accent = nextPrayer?.meta.accent ?? "rgba(99,102,241,0.90)";
  const track  = nextPrayer?.meta.track  ?? "rgba(99,102,241,0.20)";
  const icon   = nextPrayer?.key
    ? (PRAYER_ICON_MAP[nextPrayer.key] ?? PRAYER_ICON_FALLBACK)
    : PRAYER_ICON_FALLBACK;
  const displayKey  = nextPrayer?.key;
  const displayName = nextPrayer?.meta.arabicName ?? "—";

  const isLoading = !timings && !loadError;

  // Silently hide on error — adhan page still fully functional
  if (loadError) return null;

  return (
    <section
      aria-label="الصلاة القادمة"
      className="h-full w-full fade-in-up stagger-2"
    >
      <Link href="/adhan" className="block h-full w-full">
        {/* Glass panel */}
        <div
          className="group relative overflow-hidden rounded-[2rem] border border-white/5 border-t-white/10 border-l-white/10 backdrop-blur-2xl h-full flex flex-col justify-center p-6 cursor-pointer transition-colors hover:bg-white/[0.04]"
          style={{
            background: "rgba(255,255,255,0.02)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Top highlight line */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent.replace('0.90', '0.4')}, transparent)`,
            }}
          />

          {/* Aurora accent blobs (diffused) */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div
              className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl transition-colors duration-1000"
              style={{ background: accent, opacity: 0.15 }}
            />
            <div
              className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full blur-3xl transition-colors duration-1000"
              style={{ background: accent, opacity: 0.08 }}
            />
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4" dir="rtl">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shrink-0"
                style={{ background: "rgba(255,255,255,0.05)", boxShadow: `0 0 15px ${accent.replace('0.90', '0.2')}` }}
              >
                {isLoading ? (
                  <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={displayKey ?? "loading"}
                      src={icon}
                      alt=""
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={reducedMotion ? { duration: 0 } : spring_smooth}
                      className="h-6 w-6 brightness-0 invert"
                      draggable={false}
                    />
                  </AnimatePresence>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold tracking-widest text-white/40 uppercase">
                  الصلاة القادمة
                </span>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={displayKey ?? "loading-name"}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={reducedMotion ? { duration: 0 } : spring_smooth}
                    className="text-lg font-bold leading-tight text-white"
                  >
                    {isLoading ? (
                      <span className="inline-block h-5 w-16 rounded bg-white/10 animate-pulse" />
                    ) : (
                      displayName
                    )}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2" dir="ltr">
              <AnimatePresence mode="wait">
                <motion.div
                  key={countdown}
                  initial={false}
                  animate={{ opacity: 1 }}
                  className="font-mono font-bold tracking-tighter tabular-nums text-3xl sm:text-4xl"
                  style={{
                    color: accent,
                    lineHeight: "1",
                    textShadow: `0 4px 20px ${accent.replace('0.90', '0.4')}`,
                  }}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {isLoading ? (
                    <span className="inline-block h-8 w-24 rounded-xl bg-white/10 animate-pulse" />
                  ) : (
                    countdown
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
