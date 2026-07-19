import { Link } from "wouter";
import type { AthkarCategory } from "@/data/athkar";
import { categorySlugs } from "@/data/athkar";
import { motion } from "framer-motion";
import { spring_smooth, tap_card } from "@/lib/motion";
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
};

interface CategoryCardProps {
  category: AthkarCategory;
  index: number;
}

// Card rest state — subtle lift on hover, no colour shift
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
  const Icon = ICON_MAP[category.icon] ?? BookOpen;
  const slug = categorySlugs[category.id] || category.id;
  // Accent hex — falls back to white if the field is missing (legacy entries)
  const accent = category.accent ?? "#FFFFFF";

  return (
    <Link href={`/home/${slug}`}>
      <motion.div
        className="group relative block overflow-hidden cursor-pointer"
        data-testid={`card-category-${category.id}`}
        style={{
          // Dark neutral card surface — same for ALL cards
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
        {/* ── Radial glow — anchored bottom-right (RTL: visually bottom-left) ─ */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            // Soft radial gradient using the category accent at ~28% opacity
            background: `radial-gradient(ellipse 90% 85% at 95% 110%, ${accent}48 0%, transparent 68%)`,
            pointerEvents: "none",
          }}
        />

        {/* ── Card body ─────────────────────────────────────────────────────── */}
        <div
          className="relative flex items-center gap-4 p-4 sm:p-5"
          dir="rtl"
        >
          {/* Icon — stroke-only, tinted with the accent color */}
          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              color: accent,
            }}
          >
            <Icon strokeWidth={1.4} style={{ width: 26, height: 26 }} />
          </div>

          {/* Text block — title + subtitle */}
          <div className="flex-1 min-w-0 text-right">
            <h3
              className="font-ui font-semibold text-slate-100 leading-snug truncate"
              style={{ fontSize: 14 }}
            >
              {category.title}
            </h3>
            {category.subtitle && (
              <p
                className="text-slate-400 leading-snug mt-0.5 truncate"
                style={{ fontSize: 11 }}
              >
                {category.subtitle}
              </p>
            )}
          </div>

          {/* Count badge */}
          <div
            className="flex-shrink-0 flex flex-col items-center"
            style={{ minWidth: 36 }}
          >
            <span
              className="font-ui font-bold tabular-nums"
              style={{
                fontSize: 15,
                color: accent,
                opacity: 0.85,
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

        {/* ── Subtle top-edge highlight for glass realism ───────────────────── */}
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
