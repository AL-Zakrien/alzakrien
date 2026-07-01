import type { Dhikr } from "./athkar";
import { HISN_ALMUSLIM_REST_ITEMS } from "@/pages/MoreAthkar";
import { hisnChapterMeta } from "./hisnMeta";

interface HisnApiItem {
  ID?: number;
  ARABIC_TEXT?: string;
  REPEAT?: number | string;
}

type HisnApiResponse = Record<string, HisnApiItem[]>;

const CACHE_KEY = "hisn-search-data-v1";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedData {
  timestamp: number;
  data: Dhikr[];
}

export async function fetchAllHisnAthkar(): Promise<Dhikr[]> {
  // Check cache first
  const cachedRaw = localStorage.getItem(CACHE_KEY);
  if (cachedRaw) {
    try {
      const cached: CachedData = JSON.parse(cachedRaw);
      const now = Date.now();
      if (now - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    } catch {
      // ignore malformed cache
    }
  }

  // Fetch all chapters
  const allAthkar: Dhikr[] = [];
  
  const results = await Promise.allSettled(
    HISN_ALMUSLIM_REST_ITEMS.map(async (item) => {
      try {
        const response = await fetch(`https://www.hisnmuslim.com/api/ar/${item.chapter}.json`);
        if (!response.ok) return [];

        const rawText = await response.text();
        const cleaned = rawText.replace(/^\uFEFF/, "").trim();
        const json = JSON.parse(cleaned) as HisnApiResponse;

        const firstKey = Object.keys(json)[0];
        const rows = firstKey ? json[firstKey] : [];

        const sortedRows = [...(rows ?? [])].sort(
          (a, b) => Number(a.ID ?? 0) - Number(b.ID ?? 0)
        );

        const hasMultipleItems = sortedRows.length > 1;
        const meta = hisnChapterMeta[item.chapter];
        
        return sortedRows.map((row, index) => ({
          id: `hisn-${item.chapter}-${row.ID ?? index}`,
          title: hasMultipleItems ? `${item.title} - الذكر ${index + 1}` : item.title,
          text: row.ARABIC_TEXT ?? "",
          count: 0,
          repeat: Number(row.REPEAT) || 1,
          source: "حصن المسلم",
          benefit: meta?.benefit,
          explanation: meta?.explanation,
        })) as Dhikr[];
      } catch {
        return [];
      }
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      allAthkar.push(...result.value);
    }
  }

  // Cache the results
  const cacheData: CachedData = {
    timestamp: Date.now(),
    data: allAthkar,
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

  return allAthkar;
}

export function getCachedHisnAthkar(): Dhikr[] | null {
  const cachedRaw = localStorage.getItem(CACHE_KEY);
  if (!cachedRaw) return null;

  try {
    const cached: CachedData = JSON.parse(cachedRaw);
    const now = Date.now();
    if (now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  } catch {
    // ignore malformed cache
  }
  return null;
}
