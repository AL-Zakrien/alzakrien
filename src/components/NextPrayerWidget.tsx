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
  const { devOverride } = usePrayerPeriod();
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

  // Dev preview hook: when the dev-only override is set, swap the
  // displayed icon/accent/track/name to the override's period.
  // The countdown and progress ring still reflect the real next prayer.
  const overrideKey = devOverride ? AURORA_TO_WIDGET_KEY[devOverride] : null;
  const overrideMeta = overrideKey ? PRAYER_META[overrideKey] : null;

  const displayKey = overrideKey ?? nextPrayer?.key;
  const displayName = overrideMeta?.arabicName ?? nextPrayer?.meta.arabicName ?? "—";
  const displayAccent = overrideMeta?.accent ?? nextPrayer?.meta.accent ?? "rgba(99,102,241,0.90)";
  const displayTrack = overrideMeta?.track ?? nextPrayer?.meta.track ?? "rgba(99,102,241,0.20)";
  const displayIcon = displayKey
    ? (PRAYER_ICON_MAP[displayKey] ?? PRAYER_ICON_FALLBACK)
    : PRAYER_ICON_FALLBACK;

  // Back-compat aliases — keeps the rest of the JSX untouched.
  const accent = displayAccent;
  const track = displayTrack;
  const icon = displayIcon;

  const isLoading = !timings && !loadError;

  // Silently hide on error — adhan page still fully functional
  if (loadError) return null;

  return (
    <section
      aria-label="الصلاة القادمة"
      className="mb-8 fade-in-up stagger-2"
    >
      {/* Glass panel */}
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-2xl"
        style={{
          background: "rgba(255,255,255,0.06)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        {/* Top highlight */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
          }}
        />

        {/* Aurora accent blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute -top-10 -right-8 h-28 w-28 rounded-full blur-3xl"
            style={{ background: accent, opacity: 0.10 }}
          />
          <div
            className="absolute -bottom-8 -left-6 h-24 w-24 rounded-full blur-3xl"
            style={{ background: accent, opacity: 0.06 }}
          />
        </div>

        {/* Content row — RTL layout */}
        <div className="relative flex items-center gap-4 px-4 py-3.5 sm:px-5 sm:py-4" dir="rtl">

          {/* SVG progress ring */}
          <div
            className="relative flex-shrink-0"
            style={{ width: SVG_SIZE, height: SVG_SIZE }}
            role="img"
            aria-label={
              nextPrayer
                ? (devOverride
                    ? `معاينة: ${displayName} — متبقي على ${nextPrayer.meta.arabicName}: ${countdown}`
                    : `متبقي على ${nextPrayer.meta.arabicName}: ${countdown}`)
                : "جاري التحميل"
            }
          >
            <svg
              width={SVG_SIZE}
              height={SVG_SIZE}
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
              style={{ transform: "rotate(-90deg)" }}
              aria-hidden="true"
            >
              {/* Background track */}
              <circle
                cx={CX}
                cy={CY}
                r={RING_R}
                fill="none"
                stroke={track}
                strokeWidth={STROKE}
              />
              {/* Foreground arc — remaining time */}
              {!isLoading && (
                <circle
                  cx={CX}
                  cy={CY}
                  r={RING_R}
                  fill="none"
                  stroke={accent}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{
                    transition: reducedMotion
                      ? "none"
                      : "stroke-dashoffset 1s linear, stroke 0.8s ease",
                    filter: `drop-shadow(0 0 5px ${accent})`,
                  }}
                />
              )}
            </svg>

            {/* Icon in ring centre */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              aria-hidden="true"
            >
              {isLoading ? (
                <div
                  className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white/70"
                  style={{
                    animation: reducedMotion ? "none" : "spin 1s linear infinite",
                  }}
                />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={displayKey ?? "loading"}
                    src={icon}
                    alt=""
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={reducedMotion ? { duration: 0 } : { duration: 0.35 }}
                    className="h-10 w-10"
                    draggable={false}
                  />
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Prayer name + countdown */}
          <div className="flex-1 min-w-0 text-right">
            <p
              className="text-[10px] font-semibold tracking-widest mb-0.5 uppercase"
              style={{ color: "rgba(255,255,255,0.42)" }}
            >
              الصلاة القادمة
            </p>

            <AnimatePresence mode="wait">
              <motion.p
                key={displayKey ?? "loading-name"}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
                className="text-xl sm:text-2xl font-bold leading-tight text-white"
              >
                {isLoading ? (
                  <span
                    className="inline-block h-6 w-20 rounded bg-white/10 animate-pulse"
                    aria-hidden="true"
                  />
                ) : (
                  displayName
                )}
              </motion.p>
            </AnimatePresence>

            {/* Live countdown */}
            <p
              className="mt-1 font-mono text-sm sm:text-base font-bold tracking-widest tabular-nums"
              style={{ color: accent }}
              aria-live="polite"
              aria-atomic="true"
            >
              {isLoading ? (
                <span
                  className="inline-block h-4 w-16 rounded bg-white/10 animate-pulse"
                  aria-hidden="true"
                />
              ) : (
                countdown
              )}
            </p>
          </div>

          {/* Link to full Adhan page */}
          <Link href="/adhan">
            <div
              className="flex-shrink-0 group flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/10 cursor-pointer"
              style={{ border: "1px solid rgba(255,255,255,0.10)" }}
              title="جداول مواقيت الصلاة الكاملة"
            >
              <ArrowLeft
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1"
                style={{ color: accent }}
              />
              <span
                className="text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                جداول الصلاة
              </span>
            </div>
          </Link>
        </div>

        {/* Bottom hairline */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            opacity: 0.25,
          }}
        />
      </div>
    </section>
  );
}
