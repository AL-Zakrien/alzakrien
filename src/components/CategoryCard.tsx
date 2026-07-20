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

// ── Framer Motion physics — unchanged from original ───────────────────────────
const cardHover = {
  y: -4,
  scale: 1.008,
  boxShadow: "0 12px 32px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.10)",
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
  // c1 = darkest blob — reads best as a contained corner glow (not neon)
  // c2 = mid-tone — used for the count number tint
  const glowColor = palette.c1;  // corner glow color
  const countColor = palette.c2; // count number tint

  const slug = categorySlugs[category.id] || category.id;

  return (
    <Link href={`/home/${slug}`}>
      <motion.div
        className="group relative block overflow-hidden cursor-pointer rounded-2xl border border-white/5 backdrop-blur-lg bg-white/5"
        data-testid={`card-category-${category.id}`}
        style={{
          animationDelay: `${Math.min(index, 6) * 60}ms`,
        }}
        initial={cardRest}
        whileHover={cardHover}
        whileTap={tap_card}
        transition={spring_smooth}
      >
        {/*
          ── Corner glow — strictly behind the count badge ──────────────────────
          Positioned at the END corner of the card (right: 0, bottom: 0 in CSS
          coords = left corner visually in RTL layout, where the count badge sits).
          Uses filter:blur to create a soft local bloom — NOT a gradient across
          the card. The 56×56 px box stays well within the badge corner and cannot
          bleed across the card body.
        */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 72,
            height: 72,
            // Radial glow at 30% opacity — stays within the small box
            background: `radial-gradient(circle at 100% 100%, ${glowColor}4D 0%, ${glowColor}00 70%)`,
            // Heavy blur to soften the edge; combined with the small box size
            // this keeps the glow strictly local to the badge corner
            filter: "blur(12px)",
            pointerEvents: "none",
            // Smooth crossfade between periods
            transition: "background 0.8s ease",
          }}
        />

        {/* ── Top-edge highlight for glass depth ──────────────────────────────── */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
            pointerEvents: "none",
          }}
        />

        {/* ── Card body ──────────────────────────────────────────────────────── */}
        <div
          className="relative flex items-center gap-3 p-4 sm:p-5"
          dir="rtl"
        >
          {/* Text — title + subtitle */}
          <div className="flex-1 min-w-0 text-right">
            <h3
              className="font-ui font-bold text-slate-100 leading-snug truncate"
              style={{ fontSize: 15 }}
            >
              {category.title}
            </h3>
            {category.subtitle && (
              <p
                className="text-slate-400 leading-snug mt-1 truncate"
                style={{ fontSize: 12 }}
              >
                {category.subtitle}
              </p>
            )}
          </div>

          {/* Count — tinted with the period's c2 color */}
          <div
            className="flex-shrink-0 flex flex-col items-center"
            style={{ minWidth: 32 }}
          >
            <span
              className="font-ui font-bold tabular-nums"
              style={{
                fontSize: 14,
                color: countColor,
                opacity: 0.9,
                transition: "color 0.8s ease",
              }}
            >
              {category.athkar.length}
            </span>
            <span
              className="text-slate-500"
              style={{ fontSize: 9, marginTop: 1 }}
            >
              ذكر
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
