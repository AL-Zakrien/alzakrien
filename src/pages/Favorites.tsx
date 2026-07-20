import { Link } from "wouter";
import { BookOpen, ArrowRight, Star } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { DhikrCard } from "@/components/DhikrCard";
import { motion } from "framer-motion";
import { spring_smooth } from "@/lib/motion";

export function Favorites() {
  const { favorites } = useFavorites();

  return (
    <motion.div
      className="islamic-pattern min-h-screen"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring_smooth}
    >
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3 scale-in">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(251,191,36,0.7)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h1
            className="font-serif text-3xl font-bold gradient-text mb-2"
            data-testid="text-favorites-title"
          >
            المحفوظات
          </h1>
          <p className="text-muted-foreground">
            الأذكار التي قمت بحفظها بالنجمة
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px flex-1 bg-border" />
            <Star className="h-4 w-4 text-accent" />
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-card border border-card-border rounded-2xl p-8 mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
              <Star className="h-6 w-6 text-accent" />
            </div>
            <h2 className="font-serif text-xl font-bold mb-2">لا توجد محفوظات بعد</h2>
            <p className="text-sm text-muted-foreground">
              افتح أي صفحة أذكار واضغط على النجمة بجانب الذكر ليظهر هنا.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mb-8">
            {favorites.map((item, i) => (
              <div key={item.id}>
                <div className="flex items-center justify-end gap-1.5 mb-1 px-1">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.categoryTitle}</span>
                </div>
                <DhikrCard dhikr={item} index={i} />
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="text-center">
          <Link href="/">
            <span
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              data-testid="link-back-home"
            >
              العودة للرئيسية
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
