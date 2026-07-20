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

// Spring hover lift — no colour shift handled by accent badge only
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
  // c2 = mid-tone blob color used as the solid flat accent
  const accentColor = palette.c2;

  const slug = categorySlugs[category.id] || category.id;

  return (
    <Link href={`/home/${slug}`}>
      <motion.div
        className="group relative block overflow-hidden cursor-pointer"
        data-testid={`card-category-${category.id}`}
        style={{
          // Dark neutral glass surface — no gradient, no tint
          background: "#1c1e2b",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.07)",
          animationDelay: `${Math.min(index, 6) * 60}ms`,
        }}
        initial={cardRest}
        whileHover={cardHover}
        whileTap={tap_card}
        transition={spring_smooth}
      >
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

          {/* ── Solid flat accent badge ─────────────────────────────────────────
              Flat hard-edged background-color from the active period's c2.
              No gradient, no blur, no glow — just a clean solid fill.
              Updates live via usePrayerPeriod() when period changes.          */}
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              // ← Flat solid color. No radial-gradient, no blur, no opacity wash.
              backgroundColor: accentColor,
              // Smooth transition between periods (color only, no shape change)
              transition: "background-color 0.8s ease",
            }}
          >
            <span
              className="font-ui font-bold tabular-nums"
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.95)",
                lineHeight: 1,
              }}
            >
              {category.athkar.length}
            </span>
            <span
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.7)",
                marginTop: 2,
                letterSpacing: "0.01em",
              }}
            >
              ذكر
            </span>
          </div>
        </div>

        {/* ── Top-edge highlight for glass depth ────────────────────────────── */}
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
      </motion.div>
    </Link>
  );
}
