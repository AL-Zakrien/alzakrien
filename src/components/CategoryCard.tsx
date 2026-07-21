import { Link } from "wouter";
import type { AthkarCategory } from "@/data/athkar";
import { categorySlugs } from "@/data/athkar";
import { motion } from "framer-motion";
import { spring_smooth, tap_card } from "@/lib/motion";
import { usePrayerPeriod } from "@/context/PrayerPeriodContext";
import { AURORA_PALETTES } from "@/components/DynamicBackground";
import { BookOpen } from "lucide-react";

// استيراد الأيقونات كمسارات (URL) لمنع الخطأ البرمجي في React
import SunIcon from '../assets/s/icons8-sun-50.svg?url';
import MoonIcon from '../assets/s/icons8-moon-symbol-50.svg?url';
import BedIcon from '../assets/s/icons8-bed-50.svg?url';
import TasbihIcon from '../assets/s/icons8-tasbih-50.svg?url';
import SoundIcon from '../assets/s/icons8-sound-50.svg?url';
import BlurIcon from '../assets/s/icons8-blur-50.svg?url';
import RugIcon from '../assets/s/icons8-prayer-rug-50.svg?url';
import MosqueIcon from '../assets/s/icons8-mosque-50.svg?url';

interface CategoryCardProps {
  category: AthkarCategory;
  index: number;
  /** "hero" = taller, larger icon, stronger glass. "default" = normal card. "compact" = small card. */
  variant?: "hero" | "default" | "compact";
  isHighlighted?: boolean;
}

// دالة تحديد الأيقونة بإرجاع صورة <img>
function getCategoryIcon(title: string, size: "sm" | "lg" | "xs" = "sm") {
  const cls = size === "lg"
    ? "w-8 h-8 brightness-0 invert opacity-80"
    : size === "xs"
    ? "w-4 h-4 brightness-0 invert opacity-70"
    : "w-6 h-6 brightness-0 invert opacity-80";

  switch (title) {
    case "أذكار الصباح":
      return <img src={SunIcon} className={cls} alt="أذكار الصباح" />;
    case "أذكار المساء":
      return <img src={MoonIcon} className={cls} alt="أذكار المساء" />;
    case "أذكار النوم":
      return <img src={BedIcon} className={cls} alt="أذكار النوم" />;
    case "أذكار بعد الصلاة": 
      return <img src={TasbihIcon} className={cls} alt="Tasbih" />;
    case "أذكار الأذان":
      return <img src={SoundIcon} className={cls} alt="الأذان" />;
    case "أذكار الطهارة":
      return <img src={BlurIcon} className={cls} alt="الطهارة" />;
    case "أذكار الصلاة":
      return <img src={RugIcon} className={cls} alt="الصلاة" />;
    case "أذكار المسجد":
      return <img src={MosqueIcon} className={cls} alt="المسجد" />;
    default:
      return <BookOpen className={`${size === "lg" ? "w-8 h-8" : size === "xs" ? "w-4 h-4" : "w-6 h-6"} text-white opacity-80`} strokeWidth={1.5} />;
  }
}

// ── Framer Motion physics — unchanged ─────────────────────────────────────────
const cardHover = {
  y: -4,
  scale: 1.03,
  boxShadow: "0 16px 40px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.12)",
};
const cardRest = {
  y: 0,
  scale: 1,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.06)",
};

export function CategoryCard({ category, index, variant = "default", isHighlighted = false }: CategoryCardProps) {
  const isHero = variant === "hero";
  const isCompact = variant === "compact";

  // ── Live period → palette lookup ──────────────────────────────────────────
  const { effectivePeriod } = usePrayerPeriod();
  const palette = AURORA_PALETTES[effectivePeriod] ?? AURORA_PALETTES.isha;
  const glowColor  = palette.c1; // corner glow
  const iconColor  = palette.c2; // icon accent (kept for future use)

  const slug = categorySlugs[category.id] || category.id;

  // ── Variant-driven styles ─────────────────────────────────────────────────
  const heightClass   = isHero
      ? "h-full min-h-[11rem]"
      : isCompact
      ? "h-full min-h-[5rem]"
      : "h-full min-h-[9rem]";
  const baseGlass     = isHero ? "bg-white/[0.03] backdrop-blur-2xl" : "bg-white/[0.02] backdrop-blur-xl";
  const glassClass    = isHighlighted ? `${baseGlass} border-amber-400/30 ring-1 ring-amber-400/10` : `${baseGlass} border-white/5 border-t-white/10 border-l-white/10`;
  const glowOpacity   = isHero ? "60"                  : "4D";
  const glowSize      = isHero ? 120                   : 96;
  const titleClass    = isHero
      ? "font-ui font-bold text-white leading-tight text-lg sm:text-xl w-full"
      : isCompact
      ? "font-ui font-bold text-slate-100 leading-tight text-[9px] w-full truncate text-right overflow-hidden"
      : "font-ui font-bold text-slate-100 leading-tight text-base sm:text-lg w-full truncate";
  const subtitleClass = isHero
      ? "text-slate-300/80 leading-tight text-xs sm:text-sm w-full"
      : isCompact
      ? "hidden"
      : "text-slate-400 leading-tight text-[10px] sm:text-[11px] w-full truncate";

  return (
    <Link href={`/home/${slug}`} className="block h-full w-full">
      <motion.div
        className={`group relative overflow-hidden cursor-pointer rounded-3xl border ${glassClass} ${heightClass} flex flex-col justify-between items-start text-right ${isCompact ? "p-2" : "p-5 sm:p-6"}`}
        data-testid={`card-category-${category.id}`}
        style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
        initial={cardRest}
        whileHover={cardHover}
        whileTap={tap_card}
        transition={spring_smooth}
        dir="rtl"
      >
        {/*
          ── Localized corner glow — strictly behind the icon at top-right ──
        */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: glowSize,
            height: glowSize,
            background: `radial-gradient(circle at 100% 0%, ${glowColor}${glowOpacity} 0%, ${glowColor}00 70%)`,
            filter: isHero ? "blur(28px)" : "blur(24px)",
            pointerEvents: "none",
            transition: "background 0.8s ease",
          }}
        />

        {/* ── Highlight Glow (if active) ── */}
        {isHighlighted && (
          <div 
            className="absolute inset-0 bg-amber-400/5 blur-2xl pointer-events-none"
            aria-hidden="true"
          />
        )}

        <div className="relative z-10">
          {getCategoryIcon(category.title, isHero ? "lg" : isCompact ? "xs" : "sm")}
        </div>

        {/* ── Bottom Section: Pill Badge + Text ───────────────────────────── */}
        <div className="relative z-10 flex flex-col items-start gap-1 w-full mt-4">
          {/* Premium Pill Badge for Count */}
          {!isCompact && (
            <div className="bg-white/10 rounded-full px-2.5 py-0.5 mb-1 backdrop-blur-md border border-white/5">
              <span className="text-[10px] font-medium text-slate-200">
                {category.athkar.length} أذكار
              </span>
            </div>
          )}
          
          {/* Title */}
          <h3 className={titleClass}>
            {category.title}
          </h3>

          {/* Subtitle */}
          {category.subtitle && (
            <p className={subtitleClass}>
              {category.subtitle}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

