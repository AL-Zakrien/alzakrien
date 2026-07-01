import { Link } from "wouter";
import type { AthkarCategory } from "@/data/athkar";
import type { LucideIcon } from "lucide-react";
import { BookOpen } from "lucide-react";

interface CategoryCardProps {
  category: AthkarCategory;
  index: number;
  Icon?: LucideIcon;
}

export function CategoryCard({ category, index, Icon: IconProp }: CategoryCardProps) {
  const Icon = IconProp ?? BookOpen;
  return (
    <Link href={`/category/${category.id}`}>
      <span
        className="group relative block overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent backdrop-blur-xl p-4 sm:p-5 fade-in-up cursor-pointer transition-all duration-300 hover:border-amber-500/20 hover:-translate-y-0.5"
        data-testid={`card-category-${category.id}`}
        style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
      >
        {/* Subtle hover wash */}
        <div className="absolute inset-0 bg-gradient-to-l from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top hairline accent on hover */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />

        <div className="relative flex items-center gap-4">
          {/* Floating hollow-glass circle icon */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover:border-amber-500/20 group-hover:bg-amber-500/5">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-slate-300 group-hover:text-amber-300 transition-colors duration-300" strokeWidth={1.5} />
            </div>
          </div>

          {/* Text content */}
          <div className="flex-1 text-right min-w-0">
            <h3 className="font-serif text-base sm:text-lg font-bold text-slate-100 mb-0.5 group-hover:text-amber-100 transition-colors duration-300">
              {category.title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-1">{category.description}</p>
          </div>

          {/* Count badge */}
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <span className="text-sm font-bold text-amber-300/80 bg-amber-500/5 border border-amber-500/10 px-2.5 py-1 rounded-lg">
              {category.athkar.length}
            </span>
            <span className="text-[10px] text-slate-500">ذكر</span>
          </div>
        </div>
      </span>
    </Link>
  );
}
