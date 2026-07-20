import type { Dhikr } from "./athkar";
import { HISN_ALMUSLIM_REST_ITEMS } from "@/pages/MoreAthkar";
import hisnJson from "./hisn_almuslim.json";

// Note: Supplication benefits, sources, or Hadith footnotes are kept undefined/empty per user request.

export async function fetchAllHisnAthkar(): Promise<Dhikr[]> {
  const allAthkar: Dhikr[] = [];
  const keys = Object.keys(hisnJson);

  HISN_ALMUSLIM_REST_ITEMS.forEach((item) => {
    const chapterName = keys[item.chapter + 1];
    if (!chapterName) return;

    const chapterData = (hisnJson as Record<string, { text: string[] }>)[chapterName];
    if (!chapterData || !Array.isArray(chapterData.text)) return;

    const rows = chapterData.text;
    const hasMultipleItems = rows.length > 1;

    rows.forEach((text, index) => {
      allAthkar.push({
        id: `hisn-${item.chapter}-${index}`,
        title: hasMultipleItems ? `${item.title} - الذكر ${index + 1}` : item.title,
        text: text,
        count: 0,
        repeat: 1,
        source: "حصن المسلم",
        benefit: undefined,
        explanation: undefined,
      });
    });
  });

  return allAthkar;
}

export function getCachedHisnAthkar(): Dhikr[] | null {
  // Since we load locally in sub-milliseconds, caching is no longer necessary.
  // We return null to force fetchAllHisnAthkar to build the list locally.
  return null;
}
