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
import { useFavorites } from "@/context/FavoritesContext";

// Spring-based stagger variants
const pageVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const sectionVariant = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: spring_smooth },
};

// ── Mobile-only Favorites Section ────────────────────────────────────────────
function MobileFavoritesSection() {
  const { favorites } = useFavorites();

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <Link href="/favorites">
          <span className="text-xs text-amber-400/70 cursor-pointer">رؤية الكل</span>
        </Link>
        <h2 className="text-sm font-bold text-slate-300/70">المفضّلة</h2>
      </div>
      {favorites.length === 0 ? (
        <GlassCard className="p-4 text-center">
          <p className="text-sm text-slate-400">لا يوجد عنصر في المفضّلة</p>
        </GlassCard>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {favorites.slice(0, 6).map((fav) => (
            <Link key={fav.id} href={`/home/${fav.categoryId}#dhikr-${fav.id}`}>
              <GlassCard className="min-w-[160px] max-w-[180px] p-3 cursor-pointer hover:bg-white/10 transition-colors flex-shrink-0">
                <p className="text-xs text-amber-300/80 font-medium mb-1 text-right">{fav.categoryTitle}</p>
                <p className="text-xs text-slate-200/80 text-right line-clamp-3 leading-relaxed arabic-text">
                  {fav.text}
                </p>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

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

  // ── Contextual Greeting ───────────────────────────────────────────────────
  const hour = new Date().getHours();
  let greeting = "";
  if (hour >= 4 && hour < 12) greeting = "صباح الخير";
  else if (hour >= 12 && hour < 15) greeting = "طاب نهارك";
  else if (hour >= 15 && hour < 20) greeting = "مساء الخير";
  else greeting = "طابت ليلتك";

  const isMorningHighlight = hour >= 4 && hour < 12;
  const isEveningHighlight = hour >= 15 && hour < 20;
  const isSleepHighlight = hour >= 20 || hour < 4;

  const today = new Date();
  const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(today);
  const gregorianDate = new Intl.DateTimeFormat('ar-SA', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(today);

  return (
    <div className="min-h-screen relative">
      <div
        className="w-full px-4 sm:px-6 relative z-10"
        style={{ transform: 'translateZ(0)' }}
      >

        {/* ══════════════════════════════════════════════════════════════════
            HERO — البسملة والآية (مشترك بين الموبايل والديسكتوب)
        ══════════════════════════════════════════════════════════════════ */}
        <section
          className="text-center mb-8 mt-8 sm:mt-14"
          aria-label="البسملة"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={spring_smooth}
          >
            {/* Bismillah
                موبايل: clamp تبدأ من 1.6rem (صغيرة مناسبة للشاشة)
                ديسكتوب: تكبر لـ 3.75rem */}
            <h1
              className="font-athkar arabic-text text-white font-bold mb-5 hero-bismillah"
              style={{
                fontSize: "clamp(1.6rem, 5vw, 3.75rem)",
                lineHeight: "1.6",
                letterSpacing: "0.01em",
              }}
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </h1>

            {/* Ornamental divider */}
            <div
              aria-hidden="true"
              className="flex items-center justify-center gap-4 mb-5"
            >
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400/30" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400/30" />
            </div>

            {/* Ayah — تظهر على الديسكتوب فقط عشان لا تزدحم على الموبايل */}
            <p
              className="hidden sm:block font-ui text-white/80 arabic-text leading-relaxed max-w-2xl mx-auto hero-ayah"
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                fontWeight: 500,
              }}
            >
              ﴿وَالذَّاكِرِينَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتِ أَعَدَّ اللَّهُ لَهُم مَّغْفِرَةً وَأَجْرًا عَظِيمًا﴾
            </p>
          </motion.div>
        </section>

        {/* ── شريط البحث (مشترك) ── */}
        <motion.div
          className="max-w-md mx-auto mb-8"
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

        {/* نتائج البحث */}
        <AnimatePresence>
          {searchQuery.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto mb-8 relative z-50"
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
            MOBILE LAYOUT — يظهر على شاشات < 768px فقط
        ══════════════════════════════════════════════════════════════════ */}
        <div className="md:hidden mt-6">

          {/* التحية */}
          <p className="text-right text-amber-400/80 font-bold text-base mb-4">
            {greeting}
          </p>

          {/* Next Prayer Widget */}
          <div className="mb-6">
            <NextPrayerWidget />
          </div>

          {/* أذكار يومية — 2×2 */}
          <div className="mb-6">
            <h2 className="text-right text-xs font-bold text-slate-400/80 mb-3 tracking-wide">
              أذكار يومية
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {mainCategories.slice(0, 4).map((cat, i) => (
                <CategoryCard key={cat.id} category={cat} index={i} variant="default" />
              ))}
            </div>
          </div>

          {/* المفضّلة */}
          <MobileFavoritesSection />

          {/* الفئات — 4 أعمدة */}
          <div className="mb-8">
            <h2 className="text-right text-xs font-bold text-slate-400/80 mb-3 tracking-wide">
              الفئات
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {mainCategories.slice(4).map((cat, i) => (
                <CategoryCard key={cat.id} category={cat} index={i + 4} variant="compact" />
              ))}
            </div>
          </div>

        </div>
        {/* ══ end MOBILE LAYOUT ══ */}


        {/* ══════════════════════════════════════════════════════════════════
            DESKTOP BENTO GRID — يظهر على شاشات ≥ 768px فقط
        ══════════════════════════════════════════════════════════════════ */}
        <div className="hidden md:block mt-6">
          <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="show"
            dir="rtl"
          >

            {/* ── ROW 1: التحية + التاريخ | Next Prayer ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

              {/* بطاقة التحية والتاريخ */}
              <motion.div className="lg:col-span-2" variants={sectionVariant}>
                <div
                  className="relative overflow-hidden rounded-3xl border border-white/5 backdrop-blur-2xl h-full flex flex-col justify-center p-6 sm:p-8 transition-colors hover:bg-white/[0.04]"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="relative z-10 flex flex-col gap-2">
                    <h2 className="text-amber-400 font-bold text-2xl sm:text-3xl tracking-wide drop-shadow-sm">
                      {greeting}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-slate-200/90 mt-1">
                      <p className="font-medium text-base sm:text-lg tracking-tight">{hijriDate}</p>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <p className="font-medium text-sm sm:text-base opacity-80">{gregorianDate}</p>
                    </div>
                  </div>
                  {/* Decorative blob */}
                  <div className="absolute left-0 bottom-0 pointer-events-none opacity-20 transform -translate-x-1/2 translate-y-1/2 blur-2xl">
                    <div className="w-48 h-48 rounded-full bg-amber-400/40" />
                  </div>
                </div>
              </motion.div>

              {/* Next Prayer Widget */}
              <motion.div className="lg:col-span-1" variants={sectionVariant}>
                <NextPrayerWidget />
              </motion.div>

            </div>
            {/* ── end ROW 1 ── */}

            {/* ── ROW 2+: كروت الأذكار ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[minmax(120px,auto)]">

              {/* أذكار الصباح — hero */}
              <motion.div className="col-span-1 lg:col-span-2" variants={sectionVariant}>
                <CategoryCard category={mainCategories[0]} index={0} variant="hero" isHighlighted={isMorningHighlight} />
              </motion.div>

              {/* أذكار المساء — hero */}
              <motion.div className="col-span-1 lg:col-span-2" variants={sectionVariant}>
                <CategoryCard category={mainCategories[1]} index={1} variant="hero" isHighlighted={isEveningHighlight} />
              </motion.div>

              {/* الكروت الثانوية (6 كروت) */}
              {mainCategories.slice(2).map((cat, i) => (
                <motion.div key={cat.id} className="col-span-1" variants={sectionVariant}>
                  <CategoryCard
                    category={cat}
                    index={i + 2}
                    isHighlighted={isSleepHighlight && cat.title === "أذكار النوم"}
                  />
                </motion.div>
              ))}

              {/* بانر جميع الأذكار */}
              <motion.div className="col-span-2 lg:col-span-4" variants={sectionVariant}>
                <Link href="/more">
                  <motion.div
                    className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-2xl p-5 hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center justify-between"
                    style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.05)" }}
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

              {/* المسبحة */}
              <motion.div className="col-span-1 lg:col-span-2" variants={sectionVariant}>
                <Link href="/tasbih">
                  <motion.div
                    className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-2xl p-5 hover:bg-white/[0.04] transition-colors cursor-pointer h-full"
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

              {/* الأذان */}
              <motion.div className="col-span-1 lg:col-span-2" variants={sectionVariant}>
                <Link href="/adhan">
                  <motion.div
                    className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-2xl p-5 hover:bg-white/[0.04] transition-colors cursor-pointer h-full"
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

            </div>
            {/* ── end ROW 2+ ── */}

          </motion.div>
        </div>
        {/* ══ end DESKTOP BENTO GRID ══ */}


        {/* Footer Dua — مشترك */}
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