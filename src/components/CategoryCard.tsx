import { Link } from "wouter";
import type { AthkarCategory } from "@/data/athkar";
import { categorySlugs } from "@/data/athkar";
import { motion } from "framer-motion";
import { spring_smooth, tap_card } from "@/lib/motion";
import { usePrayerPeriod } from "@/context/PrayerPeriodContext";
import { AURORA_PALETTES } from "@/components/DynamicBackground";
import {
  Sunrise,
  Moon,
  BedDouble,
  HandMetal,
  Droplets,
  Radio,
  Building2,
  BookOpenCheck,
  BookOpen,
  Home,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Icon registry — maps the data's icon string to a Lucide component ───────
const ICON_MAP: Record<string, LucideIcon> = {
  Sunrise,
  Moon,
  BedDouble,
  HandMetal,
  Droplets,
  Radio,
  Building2,
  BookOpenCheck,
  BookOpen,
  Home,
};

interface CategoryCardProps {
  category: AthkarCategory;
  index: number;
}

// Spring hover lift — no colour shift, that's handled by the glow layer
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
  // Use c2 (the mid-tone blob color) at ~30% for the glow; c1 for the icon tint.
  // Both update automatically when the period changes (or via DevPeriodPreview).
  const glowColor = palette.c2;   // radial gradient anchor color
  const iconColor = palette.c1;   // icon stroke tint

  const Icon = ICON_MAP[category.icon] ?? BookOpen;
  const slug = categorySlugs[category.id] || category.id;

  return (
    <Link href={`/home/${slug}`}>
      <motion.div
        className="group relative block overflow-hidden cursor-pointer"
        data-testid={`card-category-${category.id}`}
        style={{
          // Dark neutral surface — identical for ALL cards regardless of category
          background: "#12131c",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.07)",
          animationDelay: `${Math.min(index, 6) * 60}ms`,
        }}
        initial={cardRest}
        whileHover={cardHover}
        whileTap={tap_card}
        transition={spring_smooth}
      >
        {/* ── Period-reactive radial glow ── anchored bottom-right (RTL: bottom-left visually) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            // ~30% opacity hex suffix: "4D" ≈ 0.30, "40" ≈ 0.25
            background: `radial-gradient(ellipse 90% 85% at 95% 110%, ${glowColor}4D 0%, transparent 68%)`,
            pointerEvents: "none",
            // Smooth crossfade when period changes
            transition: "background 0.8s ease",
          }}
        />

        {/* ── Card body ──────────────────────────────────────────────────────── */}
        <div
          className="relative flex items-center gap-3 p-4 sm:p-5"
          dir="rtl"
        >
          {/* Icon — stroke-only, tinted with the period's c1 color */}
          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              color: iconColor,
              transition: "color 0.8s ease",
            }}
          >
            <Icon strokeWidth={1.4} style={{ width: 24, height: 24 }} />
          </div>

          {/* Text — title + subtitle */}
          <div className="flex-1 min-w-0 text-right">
            <h3
              className="font-ui font-semibold text-slate-100 leading-snug truncate"
              style={{ fontSize: 13 }}
            >
              {category.title}
            </h3>
            {category.subtitle && (
              <p
                className="text-slate-400 leading-snug mt-0.5 truncate"
                style={{ fontSize: 10 }}
              >
                {category.subtitle}
              </p>
            )}
          </div>

          {/* Count — tinted with the period's c2 glow color */}
          <div
            className="flex-shrink-0 flex flex-col items-center"
            style={{ minWidth: 32 }}
          >
            <span
              className="font-ui font-bold tabular-nums"
              style={{
                fontSize: 14,
                color: glowColor,
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
