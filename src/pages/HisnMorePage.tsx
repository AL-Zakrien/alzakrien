import { Link, useParams } from "wouter";
import { ArrowRight } from "lucide-react";
import { HISN_ALMUSLIM_REST_ITEMS } from "@/pages/MoreAthkar";
import { DhikrCard } from "@/components/DhikrCard";
import { useEffect, useState } from "react";
import type { Dhikr } from "@/data/athkar";
import hisnJson from "@/data/hisn_almuslim.json";

export function HisnMorePage() {
  const { chapter } = useParams<{ chapter: string }>();
  const chapterNumber = Number(chapter);
  const item = HISN_ALMUSLIM_REST_ITEMS.find((x) => x.chapter === chapterNumber);
  const [adhkar, setAdhkar] = useState<Dhikr[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;

    try {
      setLoading(true);
      setError(null);

      const keys = Object.keys(hisnJson);
      const chapterName = keys[chapterNumber + 1];
      if (!chapterName) throw new Error("الفصل غير موجود");

      const chapterData = (hisnJson as Record<string, { text: string[] }>)[chapterName];
      if (!chapterData || !Array.isArray(chapterData.text)) {
        throw new Error("محتوى الفصل فارغ أو غير موجود");
      }

      const rows = chapterData.text;
      const hasMultipleItems = rows.length > 1;
      const mapped: Dhikr[] = rows.map((text, index) => ({
        id: `hisn-${chapterNumber}-${index}`,
        title: hasMultipleItems ? `${item.title} - الذكر ${index + 1}` : item.title,
        text: text,
        count: 0,
        repeat: 1,
        source: "حصن المسلم",
        benefit: undefined,
        explanation: undefined,
      }));

      setAdhkar(mapped);
    } catch (err) {
      setError("حدث خطأ أثناء تحميل محتوى الفصل.");
      setAdhkar([]);
    } finally {
      setLoading(false);
    }
  }, [chapterNumber, item]);

  if (!item) {
    return (
      <div className="islamic-pattern min-h-screen">
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-20">
          <div className="text-center bg-card/90 border border-border rounded-2xl p-8">
            <h2 className="font-serif text-xl font-bold mb-2">الذكر غير موجود</h2>
            <Link href="/more">
              <span className="text-primary hover:text-primary/80 cursor-pointer">
                العودة إلى المزيد من الأذكار
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="islamic-pattern min-h-screen">
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">
        <div className="flex items-center justify-between mb-4 fade-in-up stagger-1">
          <Link href="/more">
            <span className="flex items-center gap-2 text-primary cursor-pointer hover:text-primary/80 transition-colors">
              <ArrowRight className="h-5 w-5" />
              <span className="text-sm font-bold">العودة</span>
            </span>
          </Link>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-foreground text-right">
            {item.title}
          </h1>
        </div>

        {!loading && !error && (
          <div className="flex items-center justify-end gap-2 mb-4">
            <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg">
              {adhkar.length}
            </span>
            <span className="text-xs text-muted-foreground">ذكر في هذا الباب</span>
          </div>
        )}

        {loading && (
          <div className="text-center text-sm text-muted-foreground py-8">جاري تحميل الذكر...</div>
        )}

        {error && (
          <div className="text-center text-sm text-destructive py-8">{error}</div>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-4 mt-2 mb-8">
            {adhkar.map((dhikr, index) => (
              <DhikrCard key={dhikr.id} dhikr={dhikr} index={index} fontSize={20} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
