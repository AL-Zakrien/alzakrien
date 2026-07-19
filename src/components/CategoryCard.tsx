import { Link } from "wouter";
import type { AthkarCategory } from "@/data/athkar";
import { categorySlugs } from "@/data/athkar";
import type { LucideIcon } from "lucide-react";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { spring_smooth, tap_card } from "@/lib/motion";

interface CategoryCardProps {
  category: AthkarCategory;
  index: number;
  Icon?: LucideIcon;
}

// Hover treatment: shadow elevation glow -- complements the spring y-lift without
// competing with the aurora color mood. Box-shadow grows on hover rather than
// shifting background/gradient colors.
const cardHover = {
  y: -3,
  scale: 1.005,
  boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(245,158,11,0.18)",
};

const cardRest = {
  y: 0,
  scale: 1,
  boxShadow: "0 2px 8px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.05)",
};

export function CategoryCard({ category, index, Icon: IconProp }: CategoryCardProps) {
  const Icon = IconProp ?? BookOpen;
  const slug = categorySlugs[category.id] || category.id;
  return (
    <Link href={`/home/${slug}`}>
      <motion.div
        className="group relative block overflow-hidden border border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent backdrop-blur-xl p-4 sm:p-5 fade-in-up cursor-pointer"
        data-testid={`card-category-${category.id}`}
        style={{
          animationDelay: `${Math.min(index, 6) * 60}ms`,
          borderRadius: 'var(--radius-lg)',
          boxShadow: "0 2px 8px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
        initial={cardRest}
        whileHover={cardHover}
        whileTap={tap_card}
        transition={spring_smooth}
      >
        <div className="relative flex items-center gap-4">
          {/* Hollow-glass circle icon */}
          <div className="relative flex-shrink-0">
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md flex items-center justify-center">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-slate-300" strokeWidth={1.5} />
            </div>
          </div>

          {/* Text content */}
          <div className="flex-1 text-right min-w-0">
            <h3 className="font-serif text-base sm:text-lg font-bold text-slate-100 mb-0.5">
              {category.title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-1">{category.description}</p>
          </div>

          {/* Count badge */}
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <span className="text-sm font-bold text-amber-300/80 bg-amber-500/5 border border-amber-500/10 px-2.5 py-1 rounded-lg">
              {category.athkar.length}
            </span>
            <span className="text-[10px] text-slate-500">???</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
