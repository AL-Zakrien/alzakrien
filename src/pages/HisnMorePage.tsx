import { Link, useParams } from "wouter";
import { ArrowRight } from "lucide-react";
import { HISN_ALMUSLIM_REST_ITEMS } from "@/pages/MoreAthkar";
import { DhikrCard } from "@/components/DhikrCard";
import { useEffect, useMemo, useState } from "react";
import type { Dhikr } from "@/data/athkar";
import { hisnChapterMeta } from "@/data/hisnMeta";

interface HisnApiItem {
  ID?: number;
  ARABIC_TEXT?: string;
  REPEAT?: number | string;
}

type HisnApiResponse = Record<string, HisnApiItem[]>;

export function HisnMorePage() {
  const { chapter } = useParams<{ chapter: string }>();
  const chapterNumber = Number(chapter);
  const item = HISN_ALMUSLIM_REST_ITEMS.find((x) => x.chapter === chapterNumber);
  const [adhkar, setAdhkar] = useState<Dhikr[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = useMemo(
    () => `https://www.hisnmuslim.com/api/ar/${chapterNumber}.json`,
    [chapterNumber]
  );

  useEffect(() => {
    if (!item) return;

    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(apiUrl, { signal: controller.signal });
        if (!response.ok) throw new Error("تعذر جلب بيانات الذكر.");

        const rawText = await response.text();
        const cleaned = rawText.replace(/^\uFEFF/, "").trim();
        const json = JSON.parse(cleaned) as HisnApiResponse;

        const firstKey = Object.keys(json)[0];
        const rows = firstKey ? json[firstKey] : [];

        const sortedRows = [...(rows ?? [])].sort(
          (a, b) => Number(a.ID ?? 0) - Number(b.ID ?? 0)
        );

        const hasMultipleItems = sortedRows.length > 1;
        const meta = hisnChapterMeta[chapterNumber];
        const mapped: Dhikr[] = sortedRows.map((row, index) => ({
          id: `hisn-${chapterNumber}-${row.ID ?? index}`,
          title: hasMultipleItems ? `${item.title} - الذكر ${index + 1}` : item.title,
          text: row.ARABIC_TEXT ?? "",
          count: 0,
          repeat: Number(row.REPEAT) || 1,
          source: "حصن المسلم",
          benefit: meta?.benefit,
          explanation: meta?.explanation,
        }));

        setAdhkar(mapped);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("تعذر تحميل نص الذكر الآن. حاول مرة أخرى.");
          setAdhkar([]);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [apiUrl, chapterNumber, item]);

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
