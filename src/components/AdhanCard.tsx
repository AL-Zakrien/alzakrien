import { Link } from "wouter";
import { Clock } from "lucide-react";

interface AdhanCardProps {
  index: number;
}

export function AdhanCard({ index }: AdhanCardProps) {
  return (
    <Link href="/adhan">
      <span
        className={`adhan-card block relative overflow-hidden bg-orange-500/90 border border-orange-600/30 rounded-2xl p-5 fade-in-up stagger-${Math.min(index + 1, 6)} cursor-pointer group shadow-md`}
        data-testid="card-adhan"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-transparent to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute -top-20 -left-14 w-36 h-36 rounded-full bg-orange-300/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-300/60 via-amber-300/40 to-orange-300/60 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
        <div className="relative flex items-center gap-4">
          <div className="flex-1 text-right">
            <h3 className="font-serif text-lg font-bold text-white mb-0.5 group-hover:text-orange-50 transition-colors duration-200">
              أوقات الأذان
            </h3>
            <p className="text-xs text-orange-50/80 leading-relaxed">معرفة أوقات الصلوات المفروضة في موقعك</p>
          </div>
          <div className="flex-shrink-0 p-3 rounded-xl bg-white/20 group-hover:bg-white/30 transition-colors">
            <Clock className="h-6 w-6 text-white" />
          </div>
        </div>
      </span>
    </Link>
  );
}
