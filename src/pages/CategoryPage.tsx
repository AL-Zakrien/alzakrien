import { Link, useParams } from "wouter";
import { ArrowRight, ArrowLeft, RefreshCw, CheckCircle, BookOpen, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DhikrCard } from "@/components/DhikrCard";
import { getCategoryById, categorySlugs, slugToCategoryId } from "@/data/athkar";
import { useTashkeel } from "@/context/TashkeelContext";
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { spring_smooth } from "@/lib/motion";

export function CategoryPage() {
  const params = useParams<{ id?: string; category?: string }>();
  const idOrSlug = params.category || params.id || "";
  const decoded = decodeURIComponent(idOrSlug);
  const categoryId = slugToCategoryId[decoded] || decoded;
  const category = getCategoryById(categoryId);
  const [key, setKey] = useState(0);
  const [targetDhikrId, setTargetDhikrId] = useState<string | null>(null);
  const { showTashkeel, toggleTashkeel } = useTashkeel();
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window === "undefined") return 18;
    const saved = window.localStorage.getItem("dhikrFontSize");
    const parsed = saved ? parseInt(saved, 10) : NaN;
    return Number.isNaN(parsed) ? 18 : parsed;
  });

  const resetAll = useCallback(() => {
    setKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const hash = window.location.hash || "";
    if (hash.startsWith("#dhikr-")) {
      setTargetDhikrId(hash.replace("#dhikr-", ""));
    } else {
      setTargetDhikrId(null);
    }
  }, [categoryId]);

  useEffect(() => {
    if (!targetDhikrId) return;
    const timer = setTimeout(() => {
      const target = document.getElementById(`dhikr-${targetDhikrId}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [targetDhikrId, key]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("dhikrFontSize", String(fontSize));
  }, [fontSize]);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring_smooth}
        >
          <div className="text-4xl mb-4 text-primary/60">•</div>
          <h2 className="text-xl font-bold mb-2">الصفحة غير موجودة</h2>
          <Link href="/"><span className="text-primary hover:underline cursor-pointer">العودة للرئيسية</span></Link>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="islamic-pattern min-h-screen"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring_smooth}
    >
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center justify-end gap-2 mb-8">
          <Link href="/">
            <span
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm cursor-pointer"
              data-testid="link-back-home"
            >
              الرئيسية
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <span className="text-muted-foreground/40 text-sm">/</span>
          <span className="text-sm font-semibold text-primary">{category.title}</span>
        </div>

        {/* Hero Header */}
        <div className="relative mb-8">
          <div className="relative bg-linear-to-bl from-primary/8 via-card to-accent/5 border border-primary/15 rounded-3xl p-8 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-l from-primary via-accent to-primary opacity-60" />

            <div className="absolute top-4 left-4 text-accent/15 text-6xl font-serif leading-none select-none">﴾</div>
            <div className="absolute bottom-4 right-4 text-accent/15 text-6xl font-serif leading-none select-none">﴿</div>

            <div className="relative text-center">
              <h1
                className="font-serif text-3xl font-bold text-foreground mb-2"
                data-testid="text-category-title"
              >
                {category.title}
              </h1>

              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {category.description}
              </p>

              <div className="flex items-center justify-center gap-4 mt-5">
                <div className="h-px flex-1 max-w-20 bg-linear-to-l from-primary/30 to-transparent" />
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                </div>
                <div className="h-px flex-1 max-w-20 bg-linear-to-r from-primary/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* Info bar */}
        <div className="flex items-center justify-between mb-5">
          <Link
            href={["morning", "evening", "wudu", "sleep", "prayer"].includes(category.id) ? "/" : "/more"}
            onClick={() => {
              if (["morning", "evening", "wudu", "sleep", "prayer"].includes(category.id)) {
                const slug = categorySlugs[category.id] || category.id;
                sessionStorage.setItem('homeScrollPosition', JSON.stringify({
                  y: window.scrollY,
                  from: "/home/" + slug
                }));
              }
            }}
          >
            <span className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-between">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5 text-primary/40" />
              <span>حصن المسلم</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 bg-primary/8 rounded-full">
              <CheckCircle className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-xs font-semibold text-primary">{category.athkar.length}</span>
            </div>
            <button
              type="button"
              onClick={toggleTashkeel}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full border transition-all text-xs font-semibold ${
                showTashkeel
                  ? "bg-card/70 border-border/60 text-muted-foreground/80 hover:text-primary hover:border-primary/40"
                  : "bg-primary/10 border-primary/30 text-primary"
              }`}
              aria-label={showTashkeel ? "إزالة التشكيل" : "إظهار التشكيل"}
            >
              <Type className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{showTashkeel ? "تشكيل" : "تشكيل"}</span>
            </button>
            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-card/70 border border-border/60 rounded-full">
              <button
                type="button"
                onClick={() => setFontSize((size) => Math.max(14, size - 2))}
                className="w-6 h-6 flex items-center justify-center rounded-full text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                aria-label="تصغير الخط"
              >
                A-
              </button>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground/70 min-w-8 sm:min-w-8 text-center">
                {fontSize}px
              </span>
              <button
                type="button"
                onClick={() => setFontSize((size) => Math.min(26, size + 2))}
                className="w-6 h-6 flex items-center justify-center rounded-full text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                aria-label="تكبير الخط"
              >
                A+
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div key={key} className="flex flex-col gap-4 mt-2 mb-8">
          {category.athkar.map((dhikr, index) => (
            <DhikrCard
              key={`${dhikr.id}-${key}`}
              dhikr={dhikr}
              index={index}
              fontSize={fontSize}
              initialOpen={targetDhikrId === dhikr.id}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px flex-1 max-w-15 bg-linear-to-l from-border to-transparent" />
            <span className="text-xs text-muted-foreground/50">•</span>
            <div className="h-px flex-1 max-w-15 bg-linear-to-r from-border to-transparent" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetAll}
            className="flex items-center gap-2 rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all mx-auto"
            data-testid="button-reset-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>إعادة الجميع</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
