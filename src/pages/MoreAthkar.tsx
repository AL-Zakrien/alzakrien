import { athkarCategories } from "@/data/athkar";
import { CategoryCard } from "@/components/CategoryCard";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export const HISN_ALMUSLIM_REST_ITEMS = [
  { chapter: 29, title: "الدعاء إذا تقلب ليلًا" },
  { chapter: 30, title: "دعاء الفزع في النوم ومن بُلِي بالوحشة" },
  { chapter: 31, title: "ما يفعل من رأى الرؤيا أو الحلم" },
  { chapter: 32, title: "دعاء قنوت الوتر" },
  { chapter: 33, title: "الذكر عقب السلام من الوتر" },
  { chapter: 34, title: "دعاء الهم والحزن" },
  { chapter: 35, title: "دعاء الكرب" },
  { chapter: 36, title: "دعاء لقاء العدو وذي السلطان" },
  { chapter: 37, title: "دعاء من خاف ظلم السلطان" },
  { chapter: 38, title: "الدعاء على العدو" },
  { chapter: 39, title: "ما يقول من خاف قومًا" },
  { chapter: 40, title: "دعاء من أصابه وسوسة في الإيمان" },
  { chapter: 41, title: "دعاء قضاء الدين" },
  { chapter: 42, title: "دعاء الوسوسة في الصلاة والقراءة" },
  { chapter: 43, title: "دعاء من استصعب عليه أمر" },
  { chapter: 44, title: "ما يقول ويفعل من أذنب ذنبًا" },
  { chapter: 45, title: "دعاء طرد الشيطان ووساوسه" },
  { chapter: 46, title: "الدعاء حينما يقع ما لا يرضاه أو غُلِب على أمره" },
  { chapter: 47, title: "تهنئة المولود له وجوابه" },
  { chapter: 48, title: "ما يعوّذ به الأولاد" },
  { chapter: 49, title: "الدعاء للمريض في عيادته" },
  { chapter: 50, title: "فضل عيادة المريض" },
  { chapter: 51, title: "دعاء المريض الذي يئس من حياته" },
  { chapter: 52, title: "تلقين المحتضر" },
  { chapter: 53, title: "دعاء من أصيب بمصيبة" },
  { chapter: 54, title: "الدعاء عند إغماض الميت" },
  { chapter: 55, title: "الدعاء للميت في الصلاة عليه" },
  { chapter: 56, title: "الدعاء للفرط في الصلاة عليه" },
  { chapter: 57, title: "دعاء التعزية" },
  { chapter: 58, title: "الدعاء عند إدخال الميت القبر" },
  { chapter: 59, title: "الدعاء بعد دفن الميت" },
  { chapter: 60, title: "دعاء زيارة القبور" },
  { chapter: 61, title: "دعاء الريح" },
  { chapter: 62, title: "دعاء الرعد" },
  { chapter: 63, title: "من أدعية الاستسقاء" },
  { chapter: 64, title: "الدعاء إذا نزل المطر" },
  { chapter: 65, title: "الذكر بعد نزول المطر" },
  { chapter: 66, title: "من أدعية الاستصحاء" },
  { chapter: 67, title: "دعاء رؤية الهلال" },
  { chapter: 68, title: "الدعاء عند إفطار الصائم" },
  { chapter: 69, title: "الدعاء قبل الطعام" },
  { chapter: 70, title: "الدعاء عند الفراغ من الطعام" },
  { chapter: 71, title: "دعاء الضيف لصاحب الطعام" },
  { chapter: 72, title: "التعريض بالدعاء لطلب الطعام أو الشراب" },
  { chapter: 73, title: "الدعاء إذا أفطر عند أهل بيت" },
  { chapter: 74, title: "دعاء الصائم إذا حضر الطعام ولم يفطر" },
  { chapter: 75, title: "ما يقول الصائم إذا سابه أحد" },
  { chapter: 76, title: "الدعاء عند رؤية باكورة الثمر" },
  { chapter: 77, title: "دعاء العطاس" },
  { chapter: 78, title: "ما يقال للكافر إذا عطس فحمد الله" },
  { chapter: 79, title: "الدعاء للمتزوج" },
  { chapter: 80, title: "دعاء المتزوج وشراء الدابة" },
  { chapter: 81, title: "الدعاء قبل إتيان الزوجة" },
  { chapter: 82, title: "دعاء الغضب" },
  { chapter: 83, title: "دعاء من رأى مبتلى" },
  { chapter: 84, title: "ما يقال في المجلس" },
  { chapter: 85, title: "كفارة المجلس" },
  { chapter: 86, title: "الدعاء لمن صنع إليك معروفًا" },
  { chapter: 87, title: "ما يعصم الله به من الدجال" },
  { chapter: 88, title: "الدعاء لمن قال إني أحبك في الله" },
  { chapter: 89, title: "الدعاء لمن عرض عليك ماله" },
  { chapter: 90, title: "الدعاء لمن أقرض عند القضاء" },
  { chapter: 91, title: "دعاء الخوف من الشرك" },
  { chapter: 92, title: "الدعاء لمن قال بارك الله فيك" },
  { chapter: 93, title: "دعاء كراهية الطيرة" },
  { chapter: 94, title: "دعاء الركوب" },
  { chapter: 95, title: "دعاء السفر" },
  { chapter: 96, title: "دعاء دخول القرية أو البلدة" },
  { chapter: 97, title: "دعاء دخول السوق" },
  { chapter: 98, title: "الدعاء إذا تعس المركوب" },
  { chapter: 100, title: "دعاء المسافر للمقيم" },
  { chapter: 101, title: "دعاء المقيم للمسافر" },
  { chapter: 102, title: "التكبير والتسبيح في سير السفر" },
  { chapter: 103, title: "دعاء المسافر إذا أسحر" },
  { chapter: 104, title: "الدعاء إذا نزل منزلًا في سفر أو غيره" },
  { chapter: 105, title: "ذكر الرجوع من السفر" },
  { chapter: 106, title: "ما يقول من أتاه أمر يسره أو يكرهه" },
  { chapter: 107, title: "فضل الصلاة على النبي ﷺ" },
  { chapter: 108, title: "إفشاء السلام" },
  { chapter: 109, title: "كيف يرد السلام على الكافر إذا سلم" },
  { chapter: 110, title: "الدعاء عند سماع صياح الديك ونهيق الحمار" },
  { chapter: 111, title: "دعاء نباح الكلاب بالليل" },
  { chapter: 112, title: "الدعاء لمن سببته" },
  { chapter: 113, title: "ما يقول المسلم إذا مدح المسلم" },
  { chapter: 114, title: "ما يقول المسلم إذا زُكِّي" },
  { chapter: 115, title: "كيف يلبي المحرم في الحج أو العمرة؟" },
  { chapter: 116, title: "التكبير إذا أتى الركن الأسود" },
  { chapter: 117, title: "الدعاء بين الركن اليماني والحجر الأسود" },
  { chapter: 118, title: "دعاء الوقوف على الصفا والمروة" },
  { chapter: 119, title: "الدعاء يوم عرفة" },
  { chapter: 120, title: "الذكر عند المشعر الحرام" },
  { chapter: 121, title: "التكبير عند رمي الجمار مع كل حصاة" },
  { chapter: 122, title: "دعاء عند التعجب والأمر السار" },
  { chapter: 123, title: "ما يفعل من أتاه أمر يسره" },
  { chapter: 124, title: "ما يقول من أحس وجعًا في جسده" },
  { chapter: 125, title: "دعاء من خشي أن يصيب شيئًا بعينه" },
  { chapter: 126, title: "ما يقال عند الفزع" },
  { chapter: 127, title: "ما يقول عند الذبح أو النحر" },
  { chapter: 128, title: "ما يقول لرد كيد مردة الشياطين" },
  { chapter: 129, title: "الاستغفار والتوبة" },
  { chapter: 130, title: "فضل التسبيح والتحميد والتهليل والتكبير" },
  { chapter: 131, title: "كيف كان النبي يسبح؟" },
  { chapter: 132, title: "من أنواع الخير والآداب الجامعة" },
];

function getItemDescription(title: string) {
  if (title.startsWith("ما ")) return title;
  const cleanedTitle = title.replace(/^(الدعاء|دعاء|الذكر)\s+/, "").trim();
  return `ما يقال عند ${cleanedTitle}`;
}

export function MoreAthkar() {
  const [hisnCounts, setHisnCounts] = useState<Record<number, number>>({});
  const moreCategories = athkarCategories.slice(12);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const cacheKey = "hisn-chapter-counts-v1";
    const cachedRaw = window.localStorage.getItem(cacheKey);
    let cachedCounts: Record<number, number> = {};

    if (cachedRaw) {
      try {
        cachedCounts = JSON.parse(cachedRaw) as Record<number, number>;
        setHisnCounts(cachedCounts);
      } catch {
        // ignore
      }
    }

    const missingChapters = HISN_ALMUSLIM_REST_ITEMS
      .map((item) => item.chapter)
      .filter((chapter) => !(chapter in cachedCounts));

    if (missingChapters.length === 0) return;

    let cancelled = false;

    const loadCounts = async () => {
      const countEntries = await Promise.all(
        missingChapters.map(async (chapter) => {
          try {
            const response = await fetch(`https://www.hisnmuslim.com/api/ar/${chapter}.json`);
            if (!response.ok) return [chapter, 1] as const;

            const rawText = await response.text();
            const cleaned = rawText.replace(/^\uFEFF/, "").trim();
            const data = JSON.parse(cleaned) as Record<string, unknown>;
            const firstKey = Object.keys(data)[0];
            const list = firstKey ? data[firstKey] : [];
            const count = Array.isArray(list) ? list.length : 1;
            return [chapter, Math.max(1, count)] as const;
          } catch {
            return [chapter, 1] as const;
          }
        })
      );

      if (cancelled) return;

      setHisnCounts((prev) => {
        const next = { ...prev };
        for (const [chapter, count] of countEntries) {
          next[chapter] = count;
        }
        window.localStorage.setItem(cacheKey, JSON.stringify(next));
        return next;
      });
    };

    loadCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="islamic-pattern min-h-screen">
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-20">
        <div className="flex items-center justify-between mb-6 fade-in-up stagger-1">
          <Link href="/">
            <span className="flex items-center gap-2 text-primary cursor-pointer hover:text-primary/80 transition-colors">
              <ArrowRight className="h-5 w-5" />
              <span className="text-sm font-bold">الرئيسية</span>
            </span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            المزيد من الأذكار
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {moreCategories.map((cat, i) => {
            const isLastOddItem =
              moreCategories.length % 2 === 1 && i === moreCategories.length - 1;
            return (
              <div key={cat.id} className={isLastOddItem ? "sm:col-span-2" : ""}>
                <CategoryCard category={cat} index={i} />
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {HISN_ALMUSLIM_REST_ITEMS.map((item, i) => (
            <Link key={item.chapter} href={`/more/hisn/${item.chapter}`}>
              <span
                className={`category-card block relative overflow-hidden bg-white dark:bg-card border border-border/60 rounded-2xl p-5 fade-in-up stagger-${Math.min(i + 1, 6)} cursor-pointer group shadow-sm transition-all duration-300 hover:shadow-md`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
                <div className="relative flex items-center gap-4">
                  <div className="flex-1 text-right">
                    <h3 className="font-serif text-lg font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {getItemDescription(item.title)}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg">
                      {hisnCounts[item.chapter] ?? 1}
                    </span>
                    <span className="text-[10px] text-muted-foreground opacity-70">ذكر</span>
                  </div>
                  <ArrowLeft className="h-4 w-4 text-primary/40 group-hover:text-primary group-hover:-translate-x-1 transition-all" />
                </div>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
