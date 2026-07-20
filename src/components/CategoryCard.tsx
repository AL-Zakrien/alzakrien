import { Link } from "wouter";
import type { AthkarCategory } from "@/data/athkar";
import { categorySlugs } from "@/data/athkar";
import { motion } from "framer-motion";
import { spring_smooth, tap_card } from "@/lib/motion";
import { usePrayerPeriod } from "@/context/PrayerPeriodContext";
import { AURORA_PALETTES } from "@/components/DynamicBackground";
import { Sunrise, MoonStar, Moon, Droplets, Volume2, BookOpen } from "lucide-react";

interface CategoryCardProps {
  category: AthkarCategory;
  index: number;
}

// ── Icon Mapping (Strictly inanimate symbols) ──────────────────────────────
function getCategoryIcon(id: string, props: React.SVGProps<SVGSVGElement>) {
  switch (id) {
    case "morning":
      return <Sunrise {...props} />;
    case "evening":
      return <MoonStar {...props} />;
    case "sleep":
      return <Moon {...props} />;
    case "wudu":
      return <Droplets {...props} />;
    case "adhan":
      return <Volume2 {...props} />;
    case "masjid":
      // Minimal dome/arch inline SVG
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 1.5} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4c-3 0-5 3-5 6v10h10V10c0-3-2-6-5-6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2" />
        </svg>
      );
    case "prayer":
    case "after_prayer":
      // Prayer mat/geometric abstract
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 1.5} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 11l2 2-2 2-2-2z" />
        </svg>
      );
    case "home-remembrances":
      // Minimal house
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 1.5} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "wakeup":
      // Sun rising over horizon
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 1.5} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16h16" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12l-1.5-1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l1.5-1.5" />
        </svg>
      );
    default:
      return <BookOpen {...props} />;
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

export function CategoryCard({ category, index }: CategoryCardProps) {
  // ── Live period → palette lookup ──────────────────────────────────────────
  const { effectivePeriod } = usePrayerPeriod();
  const palette = AURORA_PALETTES[effectivePeriod] ?? AURORA_PALETTES.isha;
  const glowColor  = palette.c1; // corner glow
  const iconColor  = palette.c2; // icon accent

  const slug = categorySlugs[category.id] || category.id;

  return (
    <Link href={`/home/${slug}`}>
      <motion.div
        className="group relative overflow-hidden cursor-pointer rounded-2xl border border-white/5 border-t-white/10 border-l-white/10 backdrop-blur-xl bg-white/5 h-36 flex flex-col justify-between items-start text-right p-4 sm:p-5"
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
          Uses heavy blur and 25% opacity (40 hex) to stay contained.
        */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 96,
            height: 96,
            background: `radial-gradient(circle at 100% 0%, ${glowColor}40 0%, ${glowColor}00 70%)`,
            filter: "blur(28px)", // Heavy blur, stays within 96x96 bounds
            pointerEvents: "none",
            transition: "background 0.8s ease",
          }}
        />

        {/* ── Top Section: Dynamic Icon ───────────────────────────────────── */}
        <div className="relative z-10">
          {getCategoryIcon(category.id, {
            className: "w-6 h-6 opacity-80",
            style: { color: iconColor, transition: "color 0.8s ease" },
            strokeWidth: 1.5,
          })}
        </div>

        {/* ── Bottom Section: Pill Badge + Text ───────────────────────────── */}
        <div className="relative z-10 flex flex-col items-start gap-1 w-full">
          {/* Premium Pill Badge for Count */}
          <div className="bg-white/10 rounded-full px-2.5 py-0.5 mb-1 backdrop-blur-md border border-white/5">
            <span className="text-[10px] font-medium text-slate-200">
              {category.athkar.length} أذكار
            </span>
          </div>
          
          {/* Title */}
          <h3 className="font-ui font-bold text-slate-100 leading-tight text-base sm:text-lg w-full truncate">
            {category.title}
          </h3>

          {/* Subtitle */}
          {category.subtitle && (
            <p className="text-slate-400 leading-tight text-[10px] sm:text-[11px] w-full truncate">
              {category.subtitle}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
