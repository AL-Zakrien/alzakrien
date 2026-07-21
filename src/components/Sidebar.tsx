import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BookOpen, Volume2, Target, type LucideIcon } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { spring_snappy, spring_smooth } from "@/lib/motion";
import {
  readCachedTimings,
  readPrayerSettings,
  fetchPrayerTimings,
  parseApiTime,
  type PrayerTimings,
} from "@/lib/prayerPeriod";

// ─────────────────────────────────────────────────────────────────────────────
//  Aurora prayer meta — same accents as NextPrayerWidget, scoped locally.
//  Only the 5 surfaced prayers need a meta entry here.
// ─────────────────────────────────────────────────────────────────────────────
interface PrayerMeta {
  arabicName: string;
  accent: string;
}

const PRAYER_META: Record<string, PrayerMeta> = {
  Fajr:    { arabicName: "الفجر",   accent: "rgba(99,102,241,0.90)" },
  Dhuhr:   { arabicName: "الظهر",   accent: "rgba(56,189,248,0.90)" },
  Asr:     { arabicName: "العصر",   accent: "rgba(251,191,36,0.90)" },
  Maghrib: { arabicName: "المغرب",  accent: "rgba(249,115,22,0.90)" },
  Isha:    { arabicName: "العشاء",  accent: "rgba(168,85,247,0.90)" },
};

const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
const TIMING_KEYS: Record<string, keyof PrayerTimings> = {
  Fajr: "fajr",
  Dhuhr: "dhuhr",
  Asr: "asr",
  Maghrib: "maghrib",
  Isha: "isha",
};

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/",          label: "الرئيسية",  icon: Home },
  { href: "/adhan",     label: "الأذان",    icon: Volume2 },
  { href: "/tasbih",    label: "المسبحة",   icon: Target },
  { href: "/favorites", label: "محفوظات",   icon: BookOpen },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Compact next-prayer card — cache-first, mirrors the Bento NextPrayerWidget.
//  Reuses the same localStorage cache ("prayerTimes") that PrayerTimersHome
//  writes to, so there is no second network source of truth.
// ─────────────────────────────────────────────────────────────────────────────
function computeNextPrayer(timings: PrayerTimings, now: Date) {
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const entries = PRAYER_NAMES.map((name) => ({
    key: name,
    meta: PRAYER_META[name],
    minutes: parseApiTime(String((timings as Record<string, string>)[TIMING_KEYS[name]] ?? "")),
  }));
  let next = entries.find((e) => e.minutes > currentMins);
  if (!next) next = entries[0];
  return next ?? null;
}

function formatCountdown(diffMinutes: number, diffSeconds: number): string {
  const totalSec = Math.max(0, diffMinutes * 60 - diffSeconds);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function SidebarNextPrayer() {
  const [timings, setTimings] = useState<PrayerTimings | null>(() => readCachedTimings());
  const [loadError, setLoadError] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const fetchedRef = useRef(false);

  // Cache-first load; only fetch on a cold cache (no second fetch otherwise).
  useEffect(() => {
    const cached = readCachedTimings();
    if (cached) {
      setTimings(cached);
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchPrayerTimings(readPrayerSettings())
      .then(setTimings)
      .catch(() => setLoadError(true));
  }, []);

  // Live clock — 1s tick for the countdown.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const next = timings ? computeNextPrayer(timings, now) : null;
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const currentSecs = now.getSeconds();

  let diffMins = 0;
  if (next) {
    let raw = next.minutes - currentMins;
    if (raw <= 0) raw += 24 * 60;
    diffMins = raw;
  }

  const countdown = next ? formatCountdown(diffMins, currentSecs) : "--:--";
  const accent = next?.meta.accent ?? "rgba(99,102,241,0.90)";
  const displayName = next?.meta.arabicName ?? "—";
  const isLoading = !timings && !loadError;

  // Silently hide on hard error — /adhan page remains the source of truth.
  if (loadError) return null;

  return (
    <Link href="/adhan" className="block">
      <div
        className="group relative overflow-hidden rounded-2xl border border-white/5 backdrop-blur-2xl p-4 cursor-pointer transition-colors hover:bg-white/[0.04]"
        style={{
          background: "rgba(255,255,255,0.02)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Top accent hairline */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${accent.replace("0.90", "0.4")}, transparent)` }}
        />

        {/* Diffused aurora blob */}
        <div
          aria-hidden="true"
          className="absolute -top-8 -left-8 h-24 w-24 rounded-full blur-3xl pointer-events-none transition-colors duration-1000"
          style={{ background: accent, opacity: 0.14 }}
        />

        <div className="relative z-10 flex items-center justify-between gap-2" dir="rtl">
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold tracking-widest text-white/40 uppercase">
              الصلاة القادمة
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={displayName}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={spring_smooth}
                className="text-base font-bold leading-tight text-white"
              >
                {isLoading ? (
                  <span className="inline-block h-4 w-14 rounded bg-white/10 animate-pulse align-middle" />
                ) : (
                  displayName
                )}
              </motion.span>
            </AnimatePresence>
          </div>

          <div dir="ltr">
            <AnimatePresence mode="wait">
              <motion.span
                key={countdown}
                initial={false}
                animate={{ opacity: 1 }}
                className="font-mono font-bold tracking-tighter tabular-nums text-2xl"
                style={{
                  color: accent,
                  lineHeight: "1",
                  textShadow: `0 4px 20px ${accent.replace("0.90", "0.4")}`,
                }}
                aria-live="polite"
                aria-atomic="true"
              >
                {isLoading ? (
                  <span className="inline-block h-6 w-20 rounded-lg bg-white/10 animate-pulse align-middle" />
                ) : (
                  countdown
                )}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Sidebar — persistent right rail (RTL). Always visible while mounted;
//  DesktopLayout decides *whether* to mount it (no `hidden lg:flex` here).
// ─────────────────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const [location] = useLocation();
  const siteTitleMain = "الذاكرين";
  const siteTitleSub = "والذاكرات";

  return (
    <aside className="flex flex-col fixed top-0 right-0 h-screen w-72 bg-white/[0.02] backdrop-blur-2xl border-l border-white/5 z-50 p-6">
      {/* ── Brand block ── */}
      <div className="flex items-center justify-center gap-3 mb-8 mt-2">
        <img
          src={logo}
          alt="شعار الذاكرين والذاكرات"
          className="h-11 w-11 rounded-full object-cover shrink-0"
          style={{ border: "1.5px solid rgba(255,255,255,0.18)" }}
        />
        <div className="text-right">
          <div className="font-athkar text-lg font-bold text-white leading-tight">{siteTitleMain}</div>
          <div className="text-[10px] font-bold text-white/50 tracking-widest">{siteTitleSub}</div>
        </div>
      </div>

      {/* ── Next prayer card ── */}
      <div className="mb-6">
        <SidebarNextPrayer />
      </div>

      {/* ── Navigation ── */}
      <nav className="flex flex-col gap-1.5" aria-label="التنقل الرئيسي">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <a
                aria-current={isActive ? "page" : undefined}
                className="relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
                style={{
                  background: isActive ? "rgba(245,158,11,1)" : "transparent",
                  color: isActive ? "#0a0a14" : "rgba(255,255,255,0.82)",
                  boxShadow: isActive ? "0 2px 16px rgba(245,158,11,0.45)" : "none",
                }}
              >
                {/* Sliding active highlight (spring-driven via layoutId) */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      key="sidebar-nav-indicator"
                      layoutId="sidebar-nav-indicator"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        background: "rgba(245,158,11,1)",
                        boxShadow: "0 2px 16px rgba(245,158,11,0.45)",
                      }}
                      transition={spring_snappy}
                    />
                  )}
                </AnimatePresence>

                <span aria-hidden="true" className="relative z-10">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="relative z-10 text-base font-bold">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* ── Footer spacer + du'a ── */}
      <div className="mt-auto pt-6 text-center">
        <div className="ornamental-divider w-24 mx-auto mb-3 opacity-60" />
        <p className="arabic-text text-[11px] text-amber-300/55 leading-relaxed">
          اللَّهُمَّ اجْعَلْنَا مِنَ الذَّاكِرِينَ
        </p>
      </div>
    </aside>
  );
}
