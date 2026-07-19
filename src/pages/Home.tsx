import { Link, useLocation } from "wouter";
import type { ReactNode } from "react";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { spring_smooth } from "@/lib/motion";
import { NextPrayerWidget } from "@/components/NextPrayerWidget";
import { athkarCategories, categorySlugs } from "@/data/athkar";
import { ArrowLeft, Search } from "lucide-react";
import { getCachedHisnAthkar, fetchAllHisnAthkar } from "@/data/hisnSearchData";
import { HISN_ALMUSLIM_REST_ITEMS } from "@/pages/MoreAthkar";
import { GlassCard } from "@/components/glass/GlassCard";
import { AthkarTabs } from "@/components/AthkarTabs";
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

  return (
    <div className="min-h-screen relative">
      <div
        className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10"
        style={{ transform: 'translateZ(0)' }}
      >

        {/* ──────────────────────────────────────────────────
            HERO — Bismillah + Ayah
            No card wrapper — blends directly into the aurora.
            Amiri (display) for Bismillah, Cairo for ayah.
        ────────────────────────────────────────────────── */}
        <section
          className="text-center mb-14 mt-10 sm:mt-14"
          aria-label="البسملة والآية الكريمة"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={spring_smooth}
          >
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
              className="font-ui text-white/90 arabic-text leading-relaxed max-w-2xl mx-auto hero-ayah"
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.375rem)",
                fontWeight: 500,
              }}
            >
              ﴿وَالذَّاكِرِينَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتِ أَعَدَّ اللَّهُ لَهُم مَّغْفِرَةً وَأَجْرًا عَظِيمًا﴾
            </p>
          </motion.div>
        </section>

        <AuthenticityBand />

        {/* ── STAGGERED SECTIONS: NextPrayer → Search → Tabs → Quick Links → Footer ── */}
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="show"
        >
          {/* NEXT PRAYER WIDGET */}
          <NextPrayerWidget />

          {/* SEARCH BAR */}
          <motion.div className="mb-8" variants={sectionVariant}>
            <GlassCard className="p-1">
            <div className="relative group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-amber-300 transition-colors z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن ذكر، دعاء، أو سورة..."
                className="relative w-full h-14 bg-transparent backdrop-blur-xl pr-12 pl-4 text-right text-base text-slate-100 placeholder:text-slate-400 outline-none focus:ring-0 border-0"
                dir="rtl"
              />
            </div>
            </GlassCard>
          </motion.div>

          {/* SEARCH RESULTS */}
          {searchQuery.trim() && (
            <motion.div variants={sectionVariant}>
              <GlassCard className="mb-8 p-4 shadow-2xl z-50 relative">
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
                      <div className="group rounded-xl p-3 text-right hover:bg-white/10 transition-colors cursor-pointer">
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

          {/* ATHKAR TABS */}
          <motion.section className="mb-10" aria-label="الأذكار" variants={sectionVariant}>
            <AthkarTabs categories={mainCategories} />
          </motion.section>

        {/* ──────────────────────────────────────────────────
            QUICK LINKS
        ────────────────────────────────────────────────── */}
        <GlassCard className="p-4 mb-10">
          <div className="space-y-3">
            <Link href="/more">
              <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/12 transition-colors cursor-pointer flex items-center justify-between">
                <ArrowLeft className="relative h-5 w-5 text-amber-300/70 group-hover:-translate-x-1 transition-transform" />
                <div className="relative text-right">
                  <h3 className="font-bold text-lg text-slate-100">جميع الأذكار</h3>
                  <p className="text-sm text-slate-300/80">تصفح موسوعة حصن المسلم كاملة</p>
                </div>
              </div>
            </Link>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/tasbih">
                <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/12 transition-colors cursor-pointer">
                  <div className="relative flex items-center justify-between">
                    <ArrowLeft className="h-5 w-5 text-amber-300/70 group-hover:-translate-x-1 transition-transform" />
                    <div className="text-right">
                      <h3 className="font-bold text-lg text-amber-100">المسبحة</h3>
                      <p className="text-sm text-amber-200/60">عداد الأذكار الذكي</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/adhan">
                <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/12 transition-colors cursor-pointer">
                  <div className="relative flex items-center justify-between">
                    <ArrowLeft className="h-5 w-5 text-sky-300/70 group-hover:-translate-x-1 transition-transform" />
                    <div className="text-right">
                      <h3 className="font-bold text-lg text-sky-100">الأذان</h3>
                      <p className="text-sm text-sky-200/60">مواقيت الصلاة</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </GlassCard>

          {/* FOOTER DU'A */}
          <motion.div className="text-center pt-6 pb-12" variants={sectionVariant}>
          <div className="ornamental-divider w-32 mx-auto mb-4" />
          <p className="arabic-text text-base text-amber-300/65 leading-relaxed">
            اللَّهُمَّ اجْعَلْنَا مِنَ الذَّاكِرِينَ لك كَثِيرًا
          </p>
          <div className="ornamental-divider w-32 mx-auto mt-4" />
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
