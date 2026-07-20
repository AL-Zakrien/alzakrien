import { Link } from "wouter";
import type { AthkarCategory } from "@/data/athkar";
import { categorySlugs } from "@/data/athkar";
import { motion } from "framer-motion";
import { spring_smooth, tap_card } from "@/lib/motion";
import { usePrayerPeriod } from "@/context/PrayerPeriodContext";
import { AURORA_PALETTES } from "@/components/DynamicBackground";
import { BookOpen } from "lucide-react";

// 1. استدعي الأيقونات بشكل مباشر (Import)
import SunIcon from '../assets/s/icons8-sun-50.svg';
import MoonIcon from '../assets/s/icons8-moon-symbol-50.svg';
import BedIcon from '../assets/s/icons8-bed-50.svg';
import TasbihIcon from '../assets/s/icons8-tasbih-50.svg';
import SoundIcon from '../assets/s/icons8-sound-50.svg';
import BlurIcon from '../assets/s/icons8-blur-50.svg';
import RugIcon from '../assets/s/icons8-prayer-rug-50.svg';
import MosqueIcon from '../assets/s/icons8-mosque-50.svg';

// 2. الخريطة الثابتة للأيقونات
const iconMap: Record<string, string> = {
  "أذكار الصباح": SunIcon,
  "أذكار المساء": MoonIcon,
  "أذكار النوم": BedIcon,
  "أذكار بعد الصلاة": TasbihIcon,
  "أذكار الأذان": SoundIcon,
  "أذكار الطهارة": BlurIcon,
  "أذكار الصلاة": RugIcon,
  "أذكار المسجد": MosqueIcon
};

interface CategoryCardProps {
  category: AthkarCategory;
  index: number;
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
          Uses heavy blur and 30% opacity (4D hex) linked to active AURORA_PALETTES.
        */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 96,
            height: 96,
            background: `radial-gradient(circle at 100% 0%, ${glowColor}4D 0%, ${glowColor}00 70%)`,
            filter: "blur(24px)", // Enough blur to blend, but tight enough to stay visible
            pointerEvents: "none",
            transition: "background 0.8s ease",
          }}
        />

        {/* ── Top Section: Dynamic Icon ───────────────────────────────────── */}
        <div className="relative z-10">
          {iconMap[category.title] ? (
            <div 
              className="w-6 h-6 opacity-80"
              style={{
                backgroundColor: iconColor,
                maskImage: `url(${iconMap[category.title]})`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: `url(${iconMap[category.title]})`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                transition: "background-color 0.8s ease"
              }}
            />
          ) : (
            <BookOpen 
              className="w-6 h-6 opacity-80"
              style={{ color: iconColor, transition: "color 0.8s ease" }} 
              strokeWidth={1.5}
            />
          )}
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
