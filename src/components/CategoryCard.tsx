import { Link } from "wouter";
import type { AthkarCategory } from "@/data/athkar";
import { categorySlugs } from "@/data/athkar";
import { motion } from "framer-motion";
import { spring_smooth, tap_card } from "@/lib/motion";
import { usePrayerPeriod } from "@/context/PrayerPeriodContext";
import { AURORA_PALETTES } from "@/components/DynamicBackground";

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
  const glowColor  = palette.c1;  // corner glow (darker blob = more ambient)
  const countColor = palette.c2;  // count number accent

  const slug = categorySlugs[category.id] || category.id;

  return (
    <Link href={`/home/${slug}`}>
      <motion.div
        className="group relative overflow-hidden cursor-pointer rounded-2xl border border-white/5 backdrop-blur-lg bg-white/5 aspect-square flex flex-col items-center justify-center text-center p-3"
        data-testid={`card-category-${category.id}`}
        style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
        initial={cardRest}
        whileHover={cardHover}
        whileTap={tap_card}
        transition={spring_smooth}
      >
        {/*
          ── Localized corner glow — strictly behind the bottom-right corner ──
          72×72 px absolute box: physically cannot bleed across card center.
          filter:blur(16px) diffuses the light without touching the card body.
          Fades to same-hue-zero-alpha (no CSS black-bleed artifact).
        */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 80,
            height: 80,
            background: `radial-gradient(circle at 100% 100%, ${glowColor}55 0%, ${glowColor}00 70%)`,
            filter: "blur(16px)",
            pointerEvents: "none",
            transition: "background 0.8s ease",
          }}
        />

        {/* Top-edge glint — glass depth */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
            pointerEvents: "none",
          }}
        />

        {/* ── Card content — vertically centered ──────────────────────────── */}
        <div className="relative flex flex-col items-center gap-2 w-full px-1">

          {/* Title */}
          <h3
            className="font-ui font-bold text-slate-100 leading-tight text-center w-full"
            style={{ fontSize: 13 }}
            dir="rtl"
          >
            {category.title}
          </h3>

          {/* Subtitle — one line, muted, smaller */}
          {category.subtitle && (
            <p
              className="text-slate-500 leading-tight text-center w-full truncate"
              style={{ fontSize: 10 }}
              dir="rtl"
            >
              {category.subtitle}
            </p>
          )}

          {/* Count badge */}
          <div className="flex flex-col items-center mt-1">
            <span
              className="font-ui font-bold tabular-nums"
              style={{
                fontSize: 18,
                color: countColor,
                opacity: 0.9,
                transition: "color 0.8s ease",
              }}
            >
              {category.athkar.length}
            </span>
            <span className="text-slate-500" style={{ fontSize: 8, marginTop: 1 }}>
              ذكر
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
