import { Link, useLocation } from "wouter";
import type { ReactNode } from "react";
import { useMemo, useState, useEffect } from "react";
import { PrayerTimersHome } from "@/components/PrayerTimersHome";
import { CategoryCard } from "@/components/CategoryCard";
import { athkarCategories } from "@/data/athkar";
import { ArrowLeft, Search, ExternalLink, BookOpen, Compass, Sparkles, Heart, Moon, Sun, Droplets, Bell, Building2, Hand, Home as HomeIcon, Sunrise } from "lucide-react";
import { getCachedHisnAthkar, fetchAllHisnAthkar } from "@/data/hisnSearchData";
import { HISN_ALMUSLIM_REST_ITEMS } from "@/pages/MoreAthkar";

const SOURCE_TILES = [
  { id: "quran", label: "القرآن الكريم", sub: "أساس الأذكار والعبادات", icon: BookOpen, span: "lg:col-span-2", accent: "amber" },
  { id: "bukhari", label: "صحيح البخاري", sub: "أصحّ كتب الحديث النبوي", icon: Sparkles, span: "", accent: "emerald" },
  { id: "qibla", label: "اتجاه القبلة", sub: "تحديد دقيق للموقع", icon: Compass, span: "", accent: "sky" },
  { id: "hisn", label: "حصن المسلم", sub: "مصدر الأذكار — سعيد القحطاني", icon: Heart, span: "lg:col-span-2", accent: "rose" },
  { id: "dorar", label: "الدرر السنية", sub: "موسوعة شرح الأحاديث", icon: ExternalLink, span: "", accent: "indigo", href: "https://dorar.net/hadith" },
];

const ACCENT_MAP: Record<string, { text: string; ring: string; glow: string; bg: string }> = {
  amber:   { text: "text-amber-300",   ring: "group-hover:border-amber-500/30",   glow: "group-hover:shadow-amber-500/10",   bg: "from-amber-500/10" },
  emerald: { text: "text-emerald-300", ring: "group-hover:border-emerald-500/30", glow: "group-hover:shadow-emerald-500/10", bg: "from-emerald-500/10" },
  sky:     { text: "text-sky-300",     ring: "group-hover:border-sky-500/30",     glow: "group-hover:shadow-sky-500/10",     bg: "from-sky-500/10" },
  rose:    { text: "text-rose-300",    ring: "group-hover:border-rose-500/30",    glow: "group-hover:shadow-rose-500/10",     bg: "from-rose-500/10" },
  indigo:  { text: "text-indigo-300", ring: "group-hover:border-indigo-500/30",  glow: "group-hover:shadow-indigo-500/10",  bg: "from-indigo-500/10" },
};

const CATEGORY_ICONS: Record<string, typeof Sun> = {
  morning: Sunrise,
  evening: Sun,
  sleep: Moon,
  after_prayer: Hand,
  wudu: Droplets,
  adhan: Bell,
  masjid: Building2,
  prayer: Hand,
  "home-remembrances": HomeIcon,
  wakeup: Sunrise,
};

export function Home() {
  const mainCategories = athkarCategories.slice(0, 12);
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
    <div className="min-h-screen bg-slate-950 relative">
      {/* Deep indigo and amber aurora background accents */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 h-[28rem] w-[28rem] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[24rem] w-[24rem] rounded-full bg-indigo-700/10 blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 relative z-10">

        {/* ════════════════════════════════════════════════════════════
            HEADER HERO SECTION — Basmala preserved exactly as-is
           ════════════════════════════════════════════════════════════ */}
        <div className="text-center mb-10 fade-in-up">
          <div className="bg-white dark:bg-card border border-border shadow-sm rounded-[2rem] p-8 mb-6 relative overflow-hidden transform-gpu hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-accent to-primary/40" />
            <div className="relative z-10">
              <h1 className="arabic-text text-4xl sm:text-5xl gradient-text font-bold mb-4" style={{ fontFamily: "'Amiri Quran', serif" }}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </h1>
              <p className="text-muted-foreground arabic-text text-lg leading-relaxed max-w-2xl mx-auto">
                ﴿وَالذَّاكِرِينَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتِ أَعَدَّ اللَّهُ لَهُم مَّغْفِرَةً وَأَجْرًا عَظِيمًا﴾
              </p>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            TOP SECTION — Sources Matrix (المصادر والعلوم الشرعية)
            Asymmetrical grid / fluid tile formation
           ════════════════════════════════════════════════════════════ */}
        <section className="mb-10 fade-in-up stagger-1" aria-label="المصادر والعلوم الشرعية">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-l from-amber-500/30 to-transparent" />
            <h2 className="text-xs font-bold text-amber-300/80 uppercase tracking-[0.2em] whitespace-nowrap">
              المصادر والعلوم الشرعية
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {SOURCE_TILES.map((tile) => {
              const Icon = tile.icon;
              const accent = ACCENT_MAP[tile.accent] ?? ACCENT_MAP.amber;
              const content = (
                <div
                  className={`group relative overflow-hidden rounded-2xl border border-white/5 ${tile.span} bg-slate-900/40 backdrop-blur-xl p-4 sm:p-5 transition-all duration-300 hover:shadow-xl ${accent.ring} ${accent.glow} hover:-translate-y-0.5`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${accent.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative flex items-start gap-3">
                    <div className={`flex-shrink-0 mt-0.5 p-2 rounded-xl border border-white/5 bg-white/[0.03] ${accent.text}`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
                    </div>
                    <div className="text-right min-w-0">
                      <p className={`text-sm sm:text-base font-bold text-slate-100 mb-0.5`}>{tile.label}</p>
                      <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{tile.sub}</p>
                    </div>
                  </div>
                </div>
              );

              if (tile.href) {
                return (
                  <a key={tile.id} href={tile.href} target="_blank" rel="noopener noreferrer" className={tile.span}>
                    {content}
                  </a>
                );
              }
              return (
                <div key={tile.id} className={tile.span}>
                  {content}
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            MIDDLE SECTION — Reimagined Prayer Dashboard
            Immersive digital glass panel
           ════════════════════════════════════════════════════════════ */}
        <section className="mb-10 fade-in-up stagger-2" aria-label="أوقات الصلاة">
          <PrayerTimersHome />
        </section>

        {/* ════════════════════════════════════════════════════════════
            SEARCH — integrated glass search bar
           ════════════════════════════════════════════════════════════ */}
        <div className="mb-8 fade-in-up">
          <div className="relative group">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/5 to-indigo-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-amber-300 transition-colors z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن ذكر، دعاء، أو سورة..."
              className="relative w-full h-14 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl pr-12 pl-4 text-right text-base text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-500/30 focus:ring-4 focus:ring-amber-500/5 shadow-lg transition-all"
              dir="rtl"
            />
          </div>
        </div>

        {searchQuery.trim() && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-2xl p-4 shadow-2xl fade-in-up z-50 relative">
            {loadingHisn ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid gap-2">
                {searchResults.map((item) => (
                  <Link
                    key={`${item.categoryId}-${item.id}`}
                    href={item.isHisn ? `/more/hisn/${item.chapter}#dhikr-${item.id}` : `/category/${item.categoryId}#dhikr-${item.id}`}
                  >
                    <div className="group rounded-xl p-3 text-right hover:bg-white/[0.04] transition-colors cursor-pointer border border-transparent hover:border-amber-500/10">
                      <p className="text-sm font-bold text-slate-100 mb-1">{highlightSearchMatch(item.textPreview, searchQuery)}</p>
                      <p className="text-xs text-amber-300/70 font-medium">{item.categoryTitle}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">لم نجد نتائج بحث متطابقة..</p>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            BOTTOM SECTION — Next-Gen Athkar Capsules
            Organic flowing capsule designs with frosted glass
           ════════════════════════════════════════════════════════════ */}
        <section className="mb-10 fade-in-up stagger-4" aria-label="الأذكار">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gradient-to-l from-indigo-500/30 to-transparent" />
            <h2 className="text-xs font-bold text-indigo-300/80 uppercase tracking-[0.2em] whitespace-nowrap">
              الأذكار والأدعية
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/30 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mainCategories.map((category, index) => {
              const Icon = CATEGORY_ICONS[category.id] ?? BookOpen;
              return (
                <CategoryCard key={category.id} category={category} index={index} Icon={Icon} />
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            SPECIAL LINKS — glass capsule style
           ════════════════════════════════════════════════════════════ */}
        <div className="space-y-3 mb-10 fade-in-up stagger-5">
          <Link href="/more">
            <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent backdrop-blur-xl p-5 hover:border-amber-500/20 transition-all cursor-pointer flex items-center justify-between">
              <div className="absolute inset-0 bg-gradient-to-l from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <ArrowLeft className="relative h-5 w-5 text-amber-300/70 group-hover:-translate-x-1 transition-transform" />
              <div className="relative text-right">
                <h3 className="font-bold text-lg text-slate-100">جميع الأذكار</h3>
                <p className="text-sm text-slate-400">تصفح موسوعة حصن المسلم كاملة</p>
              </div>
            </div>
          </Link>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/tasbih">
              <div className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent backdrop-blur-xl p-5 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-l from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
              <div className="group relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-r from-sky-500/10 to-transparent backdrop-blur-xl p-5 hover:shadow-lg hover:shadow-sky-500/10 transition-all cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-l from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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

        <div className="text-center py-10 opacity-60 fade-in-up stagger-6">
          <div className="w-24 h-px bg-amber-500/20 mx-auto mb-6" />
          <p className="arabic-text text-base italic text-amber-300/70">اللَّهُمَّ اجْعَلْنَا مِنَ الذَّاكِرِينَ لك كَثِيرًا</p>
        </div>
      </div>
    </div>
  );
}
