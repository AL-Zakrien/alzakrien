export type PrayerPeriod = "fajr" | "sunrise" | "zuhr" | "asr" | "maghrib" | "isha";

export interface PrayerTimings {
  fajr: string;
  sunrise?: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface LocationSettings {
  city: string;
  country: string;
  cityLabel: string;
  method: number;
  latitude?: number;
  longitude?: number;
}

const STORAGE_KEY = "athkari_prayer_settings_v2";
const TIMINGS_CACHE_KEY = "prayerTimes";

const DEFAULT_SETTINGS: LocationSettings = {
  city: "Mecca",
  country: "Saudi Arabia",
  cityLabel: "مكة المكرمة",
  method: 4,
};

const VALID_ALADHAN_METHOD_IDS = new Set([1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 99]);

export function parseApiTime(timeStr: string): number {
  const match = String(timeStr).match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** الفترة الحالية بين أوقات الصلاة (من بيانات Aladhan، بدون ساعات ثابتة). */
export function computePrayerPeriod(timings: PrayerTimings, now = new Date()): PrayerPeriod {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const boundaries: { period: PrayerPeriod; minutes: number }[] = [
    { period: "fajr", minutes: parseApiTime(timings.fajr) },
    ...(timings.sunrise
      ? [{ period: "sunrise" as const, minutes: parseApiTime(timings.sunrise) }]
      : []),
    { period: "zuhr", minutes: parseApiTime(timings.dhuhr) },
    { period: "asr", minutes: parseApiTime(timings.asr) },
    { period: "maghrib", minutes: parseApiTime(timings.maghrib) },
    { period: "isha", minutes: parseApiTime(timings.isha) },
  ];

  if (currentMinutes < boundaries[0].minutes) {
    return "isha";
  }

  let period: PrayerPeriod = "isha";
  for (const boundary of boundaries) {
    if (currentMinutes >= boundary.minutes) {
      period = boundary.period;
    }
  }

  return period;
}

export function readCachedTimings(): PrayerTimings | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(TIMINGS_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PrayerTimings>;
    if (!parsed.fajr || !parsed.dhuhr || !parsed.asr || !parsed.maghrib || !parsed.isha) {
      return null;
    }

    return {
      fajr: parsed.fajr,
      sunrise: parsed.sunrise,
      dhuhr: parsed.dhuhr,
      asr: parsed.asr,
      maghrib: parsed.maghrib,
      isha: parsed.isha,
    };
  } catch {
    return null;
  }
}

export function cacheTimings(timings: PrayerTimings): void {
  try {
    window.localStorage.setItem(TIMINGS_CACHE_KEY, JSON.stringify(timings));
  } catch {
    /* ignore quota errors */
  }
}

export function readPrayerSettings(): LocationSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as LocationSettings;
  } catch {
    /* ignore */
  }

  return DEFAULT_SETTINGS;
}

function getLocationCoordinates(settings: LocationSettings): { latitude: number; longitude: number } | null {
  if (
    typeof settings.latitude === "number" &&
    Number.isFinite(settings.latitude) &&
    typeof settings.longitude === "number" &&
    Number.isFinite(settings.longitude)
  ) {
    return { latitude: settings.latitude, longitude: settings.longitude };
  }

  const latitude = Number(String(settings.city ?? "").trim());
  const longitude = Number(String(settings.country ?? "").trim());
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return { latitude, longitude };
  }

  return null;
}

function recommendedMethodForCountry(country: string): number {
  switch (country) {
    case "Saudi Arabia":
      return 4;
    case "Egypt":
      return 5;
    case "United Arab Emirates":
      return 8;
    case "Kuwait":
      return 9;
    case "Qatar":
      return 10;
    case "Jordan":
      return 3;
    case "Turkey":
      return 13;
    default:
      return 4;
  }
}

function toCalcMethodId(raw: unknown, countryHint: string): number {
  const n = typeof raw === "number" && Number.isFinite(raw) ? raw : Number(raw);
  if (Number.isFinite(n) && VALID_ALADHAN_METHOD_IDS.has(n)) return n;
  return recommendedMethodForCountry(countryHint);
}

export async function fetchPrayerTimings(settings = readPrayerSettings()): Promise<PrayerTimings> {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  const dateStr = `${dd}-${mm}-${yyyy}`;
  const methodId = toCalcMethodId(settings.method, settings.country);
  const coordinates = getLocationCoordinates(settings);

  let url = "";
  if (coordinates) {
    url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&method=${methodId}`;
  } else {
    const city = String(settings.city ?? "").trim();
    const country = String(settings.country ?? "").trim();
    if (!city || !country) throw new Error("MISSING_CITY_OR_COUNTRY");
    url = `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${methodId}`;
  }

  let response: Response | null = null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      break;
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 1200));
    }
  }

  if (!response) throw lastError ?? new Error("NETWORK_ERROR");

  const data = await response.json();
  if (data.code !== 200) {
    throw new Error(typeof data?.data === "string" ? data.data : "API error");
  }

  const t = data.data.timings;
  const timings: PrayerTimings = {
    fajr: t.Fajr,
    sunrise: t.Sunrise,
    dhuhr: t.Dhuhr,
    asr: t.Asr,
    maghrib: t.Maghrib,
    isha: t.Isha,
  };

  cacheTimings(timings);
  return timings;
}

export function getInitialPrayerPeriod(): PrayerPeriod {
  const cached = readCachedTimings();
  if (cached) return computePrayerPeriod(cached);
  return "isha";
}
