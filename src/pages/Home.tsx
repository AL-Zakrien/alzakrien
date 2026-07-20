import { Link, useLocation } from "wouter";
import type { ReactNode } from "react";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { spring_smooth } from "@/lib/motion";
import { NextPrayerWidget } from "@/components/NextPrayerWidget";
import { athkarCategories, categorySlugs } from "@/data/athkar";
import { ArrowLeft, Search } from "lucide-react";
import { getCachedHisnAthkar, fetchAllHisnAthkar } from "@/data/hisnSearchData";
import { HISN_ALMUSLIM_REST_ITEMS } from "@/pages/MoreAthkar";
import { GlassCard } from "@/components/glass/GlassCard";
import { CategoryCard } from "@/components/CategoryCard";
import { AuthenticityBand } from "@/components/AuthenticityBand";

// Spring-based stagger variants — replaces CSS fade-in-up + stagger-N classes
const pageVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const sectionVariant = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: spring_smooth },
};

export function Home() {
  const mainCategories = athkarCategories.slice(0, 8);
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();
  const [hisnAthkar, setHisnAthkar] = useState<any[]>([]);
  const [loadingHisn, setLoadingHisn] = useState(false);

  useEffect(() => {
    const cached = getCachedHisnAthkar();
    if (cached) {
      setHisnAthkar(cached);
    } else {
      setLoadingHisn(true);
      fetchAllHisnAthkar().then((data) => {
        setHisnAthkar(data);
        setLoadingHisn(false);
      }).catch(() => {
        setLoadingHisn(false);
      });
    }
  }, []);

  useEffect(() => {
    const savedPosition = sessionStorage.getItem('homeScrollPosition');
    if (savedPosition) {
      const pos = JSON.parse(savedPosition);
      if (location === "/" || location === "") {
        window.scrollTo({ top: pos.y, behavior: 'smooth' });
        sessionStorage.removeItem('homeScrollPosition');
      }
    }
  }, [location]);

  const normalizeArabic = (value: string) =>
    value
      .normalize("NFKD")
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
      .replace(/ـ/g, "")
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const foldArabicWithMap = (value: string) => {
    const map: number[] = [];
    let folded = "";
    for (let i = 0; i < value.length; i++) {
      const ch = value[i];
      if (/[\u064B-\u065F\u0670\u06D6-\u06ED]/.test(ch) || ch === "ـ") continue;
      let base = ch;
      if (/[أإآٱ]/.test(base)) base = "ا";
      if (base === "ى") base = "ي";
      folded += base.toLowerCase();
      map.push(i);
    }
    return { folded, map };
  };

  const highlightSearchMatch = (text: string, query: string): ReactNode => {
    const rawQuery = query.trim();
    if (!rawQuery) return text;
    const source = foldArabicWithMap(text);
    const needle = foldArabicWithMap(rawQuery).folded;
    if (!needle) return text;
    const ranges: Array<{ start: number; end: number }> = [];
    let from = 0;
    while (from < source.folded.length) {
      const at = source.folded.indexOf(needle, from);
      if (at === -1) break;
      const start = source.map[at];
      const endMapIndex = at + needle.length - 1;
      const end = (source.map[endMapIndex] ?? start) + 1;
      ranges.push({ start, end });
      from = at + needle.length;
    }
    if (ranges.length === 0) return text;
    const nodes: ReactNode[] = [];
    let cursor = 0;
    ranges.forEach((r, idx) => {
      if (r.start > cursor) nodes.push(text.slice(cursor, r.start));
      nodes.push(
        <mark key={`${r.start}-${r.end}-${idx}`} className="bg-amber-400/20 text-amber-200 rounded px-0.5">
          {text.slice(r.start, r.end)}
        </mark>
      );
      cursor = r.end;
    });
    if (cursor < text.length) nodes.push(text.slice(cursor));
    return nodes;
  };

  const searchResults = useMemo(() => {
    const normalizedQuery = normalizeArabic(searchQuery);
    if (!normalizedQuery) return [];
    const results: Array<{ id: string; textPreview: string; categoryId: string; categoryTitle: string; isHisn?: boolean; chapter?: number }> = [];
    for (const category of athkarCategories) {
      for (const dhikr of category.athkar) {
        const haystack = normalizeArabic(`${dhikr.title ?? ""} ${dhikr.text} ${category.title}`);
        if (haystack.includes(normalizedQuery)) {
          results.push({
            id: dhikr.id,
            textPreview: dhikr.text.replace(/\s+/g, " ").trim(),
            categoryId: category.id,
            categoryTitle: category.title,
          });
        }
      }
    }
    for (const dhikr of hisnAthkar) {
      const haystack = normalizeArabic(`${dhikr.title ?? ""} ${dhikr.text}`);
      if (haystack.includes(normalizedQuery)) {
        const match = dhikr.id.match(/hisn-(\d+)-/);
        const chapter = match ? parseInt(match[1]) : undefined;
        const hisnItem = HISN_ALMUSLIM_REST_ITEMS.find(item => item.chapter === chapter);
        results.push({
          id: dhikr.id,
          textPreview: dhikr.text.replace(/\s+/g, " ").trim(),
          categoryId: `hisn-${chapter}`,
          categoryTitle: hisnItem?.title || "حصن المسلم",
          isHisn: true,
          chapter,
        });
      }
    }
    return results.slice(0, 15);
  }, [searchQuery, hisnAthkar]);

  // ── Contextual Greeting Logic ─────────────────────────────────────────────
  const hour = new Date().getHours();
  let greeting = "";
  if (hour >= 4 && hour < 12) greeting = "صباح الخير";
  else if (hour >= 12 && hour < 15) greeting = "طاب نهارك";
  else if (hour >= 15 && hour < 20) greeting = "مساء الخير";
  else greeting = "طابت ليلتك";

  // Determine highlighted categories
  const isMorningHighlight = hour >= 4 && hour < 12;
  const isEveningHighlight = hour >= 15 && hour < 20;
  const isSleepHighlight = hour >= 20 || hour < 4;

  return (
    <div className="min-h-screen relative">
      <div
        className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 relative z-10"
        style={{ transform: 'translateZ(0)' }}
      >

        {/* ──────────────────────────────────────────────────
            HERO — Contextual Greeting + Basmala + Ayah
        ────────────────────────────────────────────────── */}
        <section
          className="text-center mb-8 mt-10 sm:mt-14"
          aria-label="الترحيب والبسملة"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={spring_smooth}
          >
            {/* Contextual Greeting */}
            <h2 className="text-amber-400/80 font-bold text-lg sm:text-xl mb-4 tracking-wide">
              {greeting}
            </h2>

            {/* Bismillah — Amiri display font */}
            <h1
              className="font-athkar arabic-text text-white font-bold mb-5 hero-bismillah"
              style={{
                fontSize: "clamp(2rem, 6vw, 3.75rem)",
                lineHeight: "1.6",
                letterSpacing: "0.01em",
              }}
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </h1>

            {/* Subtle ornamental divider */}
            <div
              aria-hidden="true"
              className="flex items-center justify-center gap-4 mb-5"
            >
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400/30" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400/30" />
            </div>

            {/* Ayah — Cairo font */}
            <p
              className="font-ui text-white/80 arabic-text leading-relaxed max-w-2xl mx-auto hero-ayah"
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                fontWeight: 500,
              }}
            >
              ﴿وَالذَّاكِرِينَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتِ أَعَدَّ اللَّهُ لَهُم مَّغْفِرَةً وَأَجْرًا عَظِيمًا﴾
            </p>
          </motion.div>
        </section>

        {/* ── SLEEK SEARCH PILL ── */}
        <motion.div 
          className="max-w-md mx-auto mb-10" 
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring_smooth, delay: 0.1 }}
        >
          <div className="relative group overflow-hidden rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-colors hover:bg-white/[0.05]">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-amber-300 transition-colors z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن ذكر، دعاء..."
              className="relative w-full h-12 bg-transparent pr-12 pl-5 text-right text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-0 border-0"
              dir="rtl"
            />
          </div>
        </motion.div>

        {/* SEARCH RESULTS (conditionally shows below search pill) */}
        <AnimatePresence>
          {searchQuery.trim() && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto mb-10 relative z-50"
            >
              <GlassCard className="p-4 shadow-2xl rounded-3xl">
                {loadingHisn ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid gap-2">
                    {searchResults.map((item) => {
                      const slug = categorySlugs[item.categoryId] || item.categoryId;
                      return (
                        <Link
                          key={`${item.categoryId}-${item.id}`}
                          href={item.isHisn ? `/more/hisn/${item.chapter}#dhikr-${item.id}` : `/home/${slug}#dhikr-${item.id}`}
                        >
                          <div className="group rounded-2xl p-3 text-right hover:bg-white/10 transition-colors cursor-pointer">
                            <p className="text-sm font-bold text-slate-100 mb-1">{highlightSearchMatch(item.textPreview, searchQuery)}</p>
                            <p className="text-xs text-amber-300/70 font-medium">{item.categoryTitle}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">لم نجد نتائج بحث متطابقة..</p>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <AuthenticityBand />

        {/* ══════════════════════════════════════════════════════════════════
            BENTO GRID — Asymmetric dashboard layout
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[minmax(120px,auto)]"
          variants={pageVariants}
          initial="hidden"
          animate="show"
          dir="rtl"
        >

          {/* ── CELL: Next Prayer Widget (Hero focal element) ──
              Desktop: spans 2 cols × 2 rows — the biggest element.
              Mobile: full width, natural height. */}
          <motion.div
            className="md:col-span-1 lg:col-span-2 lg:row-span-2"
            variants={sectionVariant}
          >
            <NextPrayerWidget />
          </motion.div>

          {/* ── CELL: أذكار الصباح (Morning) — Primary ──
              Desktop: spans 2 cols on lg for prominence.
              Mobile: full width. */}
          <motion.div
            className="md:col-span-1 lg:col-span-2"
            variants={sectionVariant}
          >
            <CategoryCard category={mainCategories[0]} index={0} variant="hero" isHighlighted={isMorningHighlight} />
          </motion.div>

          {/* ── CELL: أذكار المساء (Evening) — Primary ──
              Desktop: spans 2 cols on lg. 
              Mobile: full width. */}
          <motion.div
            className="md:col-span-1 lg:col-span-2"
            variants={sectionVariant}
          >
            <CategoryCard category={mainCategories[1]} index={1} variant="hero" isHighlighted={isEveningHighlight} />
          </motion.div>

          {/* ── CELLS: Secondary Categories (6 remaining) ──
              Each takes 1 col on lg (4 per row → 2 rows).
              On md: 1 col each (2 per row → 3 rows). */}
          {mainCategories.slice(2).map((cat, i) => (
            <motion.div
              key={cat.id}
              className="md:col-span-1 lg:col-span-1"
              variants={sectionVariant}
            >
              <CategoryCard 
                category={cat} 
                index={i + 2} 
                isHighlighted={isSleepHighlight && cat.title === "أذكار النوم"} 
              />
            </motion.div>
          ))}

          {/* ── CELL: جميع الأذكار Banner (wide bottom) ──
              Spans full width on all breakpoints. */}
          <motion.div
            className="md:col-span-2 lg:col-span-4"
            variants={sectionVariant}
          >
            <Link href="/more">
              <motion.div
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-5 hover:bg-white/[0.05] transition-colors cursor-pointer flex items-center justify-between"
                style={{
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.07)",
                }}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={spring_smooth}
              >
                <ArrowLeft className="relative h-5 w-5 text-amber-300/70 group-hover:-translate-x-1 transition-transform" />
                <div className="relative text-right">
                  <h3 className="font-bold text-lg text-slate-100">جميع الأذكار</h3>
                  <p className="text-sm text-slate-300/80">تصفح موسوعة حصن المسلم كاملة</p>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* ── CELLS: Tasbih + Adhan (bottom pair) ──
              Each spans 2 cols on lg (side by side).
              On md: 1 col each. */}
          <motion.div
            className="md:col-span-1 lg:col-span-2"
            variants={sectionVariant}
          >
            <Link href="/tasbih">
              <motion.div
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5 hover:bg-white/[0.04] transition-colors cursor-pointer h-full"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={spring_smooth}
              >
                <div className="relative flex items-center justify-between">
                  <ArrowLeft className="h-5 w-5 text-amber-300/70 group-hover:-translate-x-1 transition-transform" />
                  <div className="text-right">
                    <h3 className="font-bold text-lg text-amber-100">المسبحة</h3>
                    <p className="text-sm text-amber-200/60">عداد الأذكار الذكي</p>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            className="md:col-span-1 lg:col-span-2"
            variants={sectionVariant}
          >
            <Link href="/adhan">
              <motion.div
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5 hover:bg-white/[0.04] transition-colors cursor-pointer h-full"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={spring_smooth}
              >
                <div className="relative flex items-center justify-between">
                  <ArrowLeft className="h-5 w-5 text-sky-300/70 group-hover:-translate-x-1 transition-transform" />
                  <div className="text-right">
                    <h3 className="font-bold text-lg text-sky-100">الأذان</h3>
                    <p className="text-sm text-sky-200/60">مواقيت الصلاة</p>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>

        </motion.div>

        {/* FOOTER DU'A — outside the grid, full width */}
        <motion.div
          className="text-center pt-8 pb-12"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring_smooth, delay: 0.5 }}
        >
          <div className="ornamental-divider w-32 mx-auto mb-4" />
          <p className="arabic-text text-base text-amber-300/65 leading-relaxed">
            اللَّهُمَّ اجْعَلْنَا مِنَ الذَّاكِرِينَ لك كَثِيرًا
          </p>
          <div className="ornamental-divider w-32 mx-auto mt-4" />
        </motion.div>

      </div>
    </div>
  );
}

