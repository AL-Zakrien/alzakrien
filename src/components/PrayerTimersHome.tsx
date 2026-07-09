import { useState, useEffect, useCallback, useRef } from "react";
import { Settings, X, MapPin, Loader as Loader2, Navigation } from "lucide-react";
import { notificationManager } from "@/utils/notifications";

interface PrayerTime {
  name: string;
  arabicName: string;
  minutes: number;
  time12: string;
  isNext?: boolean;
}

interface LocationSettings {
  city: string;
  country: string;
  cityLabel: string;
  method: number;
  latitude?: number;
  longitude?: number;
}

interface CityOption {
  id: string;
  label: string;
  city: string;
  country: string;
  method: number;
}

/** أرقام طرق الحساب المعتمدة في Aladhan */
const VALID_ALADHAN_METHOD_IDS = new Set([1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 99]);

/** خريطة ترجمة أسماء الدول من العربي/الشائع إلى الإنجليزي */
const COUNTRY_AR_TO_EN: Record<string, string> = {
  "مصر": "Egypt",
  "السعودية": "Saudi Arabia",
  "المملكة العربية السعودية": "Saudi Arabia",
  "الإمارات": "United Arab Emirates",
  "الإمارات العربية المتحدة": "United Arab Emirates",
  "الكويت": "Kuwait",
  "قطر": "Qatar",
  "الأردن": "Jordan",
  "تركيا": "Turkey",
  "المغرب": "Morocco",
  "الجزائر": "Algeria",
  "تونس": "Tunisia",
  "ليبيا": "Libya",
  "السودان": "Sudan",
  "العراق": "Iraq",
  "سوريا": "Syria",
  "لبنان": "Lebanon",
  "فلسطين": "Palestine",
  "اليمن": "Yemen",
  "عمان": "Oman",
  "سلطنة عمان": "Oman",
  "البحرين": "Bahrain",
  "إندونيسيا": "Indonesia",
  "ماليزيا": "Malaysia",
  "باكستان": "Pakistan",
  "بنغلاديش": "Bangladesh",
  "الهند": "India",
  "نيجيريا": "Nigeria",
  "السنغال": "Senegal",
  "الصومال": "Somalia",
  "أمريكا": "United States",
  "الولايات المتحدة": "United States",
  "الولايات المتحدة الأمريكية": "United States",
  "بريطانيا": "United Kingdom",
  "المملكة المتحدة": "United Kingdom",
  "كندا": "Canada",
  "أستراليا": "Australia",
  "فرنسا": "France",
  "ألمانيا": "Germany",
  "هولندا": "Netherlands",
  "بلجيكا": "Belgium",
  "السويد": "Sweden",
  "النرويج": "Norway",
  "الدنمارك": "Denmark",
  "سويسرا": "Switzerland",
  "إيطاليا": "Italy",
  "إسبانيا": "Spain",
  "روسيا": "Russia",
  "الصين": "China",
  "اليابان": "Japan",
  "كوريا": "South Korea",
  "جنوب أفريقيا": "South Africa",
  "إثيوبيا": "Ethiopia",
  "كينيا": "Kenya",
  "غانا": "Ghana",
  "موريتانيا": "Mauritania",
  "موريشيوس": "Mauritius",
  "أفغانستان": "Afghanistan",
  "إيران": "Iran",
  "أذربيجان": "Azerbaijan",
  "كازاخستان": "Kazakhstan",
  "أوزبكستان": "Uzbekistan",
  "البوسنة": "Bosnia and Herzegovina",
  "ألبانيا": "Albania",
  "كوسوفو": "Kosovo",
  "تايلاند": "Thailand",
  "فيتنام": "Vietnam",
  "الفلبين": "Philippines",
  "سنغافورة": "Singapore",
  "ميانمار": "Myanmar",
  "كمبوديا": "Cambodia",
  "لاوس": "Laos",
  "غوام": "Guam",
  "تايوان": "Taiwan",
  "هونغ كونغ": "Hong Kong",
  "ماكاو": "Macao",
  "إسرائيل": "Israel",
  "الضفة الغربية": "Palestine",
  "قطاع غزة": "Palestine",
};

/** خريطة ترجمة أسماء المدن من العربي إلى الإنجليزي */
const CITY_AR_TO_EN: Record<string, string> = {
  "مكة": "Mecca",
  "مكة المكرمة": "Mecca",
  "المدينة": "Medina",
  "المدينة المنورة": "Medina",
  "الرياض": "Riyadh",
  "جدة": "Jeddah",
  "جده": "Jeddah",
  "الدمام": "Dammam",
  "الطائف": "Taif",
  "القاهرة": "Cairo",
  "الإسكندرية": "Alexandria",
  "الاسكندرية": "Alexandria",
  "الجيزة": "Giza",
  "الأقصر": "Luxor",
  "أسوان": "Aswan",
  "بورسعيد": "Port Said",
  "بور سعيد": "Port Said",
  "السويس": "Suez",
  "الفيوم": "Faiyum",
  "بني سويف": "Beni Suef",
  "بنى سويف": "Beni Suef",
  "المنيا": "Minya",
  "أسيوط": "Assiut",
  "سوهاج": "Sohag",
  "قنا": "Qena",
  "مطروح": "Marsa Matruh",
  "العريش": "Arish",
  "رفح": "Rafah",
  "الزقازيق": "Zagazig",
  "دبي": "Dubai",
  "أبوظبي": "Abu Dhabi",
  "أبو ظبي": "Abu Dhabi",
  "الشارقة": "Sharjah",
  "عجمان": "Ajman",
  "الكويت": "Kuwait City",
  "الدوحة": "Doha",
  "عمّان": "Amman",
  "عمان": "Amman",
  "إسطنبول": "Istanbul",
  "اسطنبول": "Istanbul",
  "أنقرة": "Ankara",
  "بغداد": "Baghdad",
  "البصرة": "Basra",
  "دمشق": "Damascus",
  "حلب": "Aleppo",
  "بيروت": "Beirut",
  "الخرطوم": "Khartoum",
  "طرابلس": "Tripoli",
  "تونس": "Tunis",
  "الجزائر": "Algiers",
  "الرباط": "Rabat",
  "الدار البيضاء": "Casablanca",
  "مراكش": "Marrakech",
  "صنعاء": "Sanaa",
  "عدن": "Aden",
  "مسقط": "Muscat",
  "المنامة": "Manama",
  "جاكرتا": "Jakarta",
  "كوالالمبور": "Kuala Lumpur",
  "كراتشي": "Karachi",
  "لاهور": "Lahore",
  "إسلام آباد": "Islamabad",
  "ذاكا": "Dhaka",
  "دكا": "Dhaka",
  "مومباي": "Mumbai",
  "دلهي": "Delhi",
  "نيودلهي": "New Delhi",
  "لندن": "London",
  "باريس": "Paris",
  "برلين": "Berlin",
  "مدريد": "Madrid",
  "روما": "Rome",
  "أمستردام": "Amsterdam",
  "بروكسل": "Brussels",
  "ستوكهولم": "Stockholm",
  "أوسلو": "Oslo",
  "كوبنهاغن": "Copenhagen",
  "زيورخ": "Zurich",
  "نيويورك": "New York",
  "لوس أنجلوس": "Los Angeles",
  "شيكاغو": "Chicago",
  "تورنتو": "Toronto",
  "سيدني": "Sydney",
  "ملبورن": "Melbourne",
  "موسكو": "Moscow",
  "بكين": "Beijing",
  "طوكيو": "Tokyo",
  "سيول": "Seoul",
  "نيروبي": "Nairobi",
};

function translateToEnglish(text: string, map: Record<string, string>): string {
  const trimmed = text.trim();
  if (map[trimmed]) return map[trimmed];
  const lower = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(map)) {
    if (key.toLowerCase() === lower) return val;
  }
  return trimmed;
}

const DEFAULT_SETTINGS: LocationSettings = {
  city: "Mecca", country: "Saudi Arabia", cityLabel: "مكة المكرمة", method: 4,
};

const CITY_OPTIONS: CityOption[] = [
  { id: "mecca",    label: "مكة المكرمة",    city: "Mecca",        country: "Saudi Arabia",        method: 4  },
  { id: "medina",   label: "المدينة المنورة", city: "Medina",       country: "Saudi Arabia",        method: 4  },
  { id: "riyadh",   label: "الرياض",          city: "Riyadh",       country: "Saudi Arabia",        method: 4  },
  { id: "jeddah",   label: "جدة",             city: "Jeddah",       country: "Saudi Arabia",        method: 4  },
  { id: "cairo",    label: "القاهرة",         city: "Cairo",        country: "Egypt",               method: 5  },
  { id: "alex",     label: "الإسكندرية",     city: "Alexandria",   country: "Egypt",               method: 5  },
  { id: "dubai",    label: "دبي",             city: "Dubai",        country: "United Arab Emirates",method: 8  },
  { id: "abudhabi", label: "أبوظبي",          city: "Abu Dhabi",    country: "United Arab Emirates",method: 8  },
  { id: "kuwait",   label: "الكويت",          city: "Kuwait",       country: "Kuwait",              method: 9  },
  { id: "doha",     label: "الدوحة",          city: "Doha",         country: "Qatar",               method: 10 },
  { id: "amman",    label: "عمّان",           city: "Amman",        country: "Jordan",              method: 3  },
  { id: "istanbul", label: "إسطنبول",        city: "Istanbul",     country: "Turkey",              method: 13 },
  { id: "custom",   label: "مدينتي (أي دولة)", city: "",           country: "",                    method: 4  },
];

interface CountryOption {
  value: string;
  label: string;
  method: number;
}

const COUNTRY_OPTIONS: CountryOption[] = [
  { value: "Saudi Arabia", label: "المملكة العربية السعودية", method: 4 },
  { value: "Egypt", label: "مصر", method: 5 },
  { value: "United Arab Emirates", label: "الإمارات العربية المتحدة", method: 8 },
  { value: "Kuwait", label: "الكويت", method: 9 },
  { value: "Qatar", label: "قطر", method: 10 },
  { value: "Jordan", label: "الأردن", method: 3 },
  { value: "Turkey", label: "تركيا", method: 13 },
  { value: "Morocco", label: "المغرب", method: 4 },
  { value: "Algeria", label: "الجزائر", method: 4 },
  { value: "Tunisia", label: "تونس", method: 4 },
  { value: "Sudan", label: "السودان", method: 4 },
  { value: "Libya", label: "ليبيا", method: 4 },
  { value: "Iraq", label: "العراق", method: 4 },
  { value: "Syria", label: "سوريا", method: 4 },
  { value: "Lebanon", label: "لبنان", method: 4 },
  { value: "Palestine", label: "فلسطين", method: 4 },
  { value: "Yemen", label: "اليمن", method: 4 },
  { value: "Oman", label: "عمان", method: 4 },
  { value: "Bahrain", label: "البحرين", method: 4 },
  { value: "Indonesia", label: "إندونيسيا", method: 11 },
  { value: "Malaysia", label: "ماليزيا", method: 11 },
  { value: "Pakistan", label: "باكستان", method: 4 },
  { value: "Bangladesh", label: "بنغلاديش", method: 4 },
  { value: "India", label: "الهند", method: 4 },
  { value: "Nigeria", label: "نيجيريا", method: 4 },
  { value: "South Africa", label: "جنوب أفريقيا", method: 4 },
  { value: "United States", label: "الولايات المتحدة الأمريكية", method: 14 },
  { value: "Canada", label: "كندا", method: 14 },
  { value: "United Kingdom", label: "المملكة المتحدة", method: 4 },
  { value: "France", label: "فرنسا", method: 4 },
  { value: "Germany", label: "ألمانيا", method: 4 },
  { value: "Spain", label: "إسبانيا", method: 4 },
  { value: "Italy", label: "إيطاليا", method: 4 },
  { value: "Australia", label: "أستراليا", method: 4 },
  { value: "China", label: "الصين", method: 4 },
  { value: "Japan", label: "اليابان", method: 4 },
  { value: "South Korea", label: "كوريا الجنوبية", method: 4 },
  { value: "Russia", label: "روسيا", method: 4 },
  { value: "Thailand", label: "تايلاند", method: 4 },
  { value: "Afghanistan", label: "أفغانستان", method: 4 },
];

const STORAGE_KEY = "athkari_prayer_settings_v2";

/** خريطة ربط المدن التي قد لا يقبلها API */
const CITY_FALLBACK: Record<string, Record<string, string>> = {
  "Egypt": {
    "Port Said": "Cairo",
    "Beni Suef": "Cairo",
    "Faiyum": "Cairo",
    "Minya": "Cairo",
    "Assiut": "Cairo",
    "Sohag": "Cairo",
    "Qena": "Luxor",
    "Marsa Matruh": "Alexandria",
    "Arish": "Alexandria",
    "Rafah": "Alexandria"
  }
};

function normalizeCityForAPI(city: string, country: string): string {
  const fallbacks = CITY_FALLBACK[country];
  if (fallbacks && fallbacks[city]) {
    return fallbacks[city];
  }
  return city;
}

function recommendedMethodForCountry(country: string): number {
  switch (country) {
    case "Saudi Arabia":   return 4;
    case "Egypt":          return 5;
    case "United Arab Emirates": return 8;
    case "Kuwait":         return 9;
    case "Qatar":          return 10;
    case "Jordan":         return 3;
    case "Turkey":         return 13;
    default:               return 4;
  }
}

function methodName(methodId: number): string {
  switch (methodId) {
    case 1:  return "مركز الدراسات الإسلامية";
    case 2:  return "رابطة العالم الإسلامي";
    case 3:  return "رابطة العالم الإسلامي";
    case 4:  return "أم القرى";
    case 5:  return "الهيئة المصرية";
    case 7:  return "معهد الجيوفيزياء";
    case 8:  return "الخليج العربي";
    case 9:  return "الكويت";
    case 10: return "قطر";
    case 11: return "ماليزيا";
    case 12: return "الجامعة الإسلامية";
    case 13: return "ديانت — تركيا";
    case 14: return "رابطة أمريكا الشمالية";
    case 15: return "الإمارات";
    default: return "أم القرى";
  }
}

function isCoordinateLocation(s: LocationSettings): boolean {
  if (
    typeof s.latitude === "number" &&
    Number.isFinite(s.latitude) &&
    typeof s.longitude === "number" &&
    Number.isFinite(s.longitude)
  ) {
    return true;
  }
  const city = String(s.city ?? "").trim();
  const country = String(s.country ?? "").trim();
  return /^-?\d+\.?\d*$/.test(city) && /^-?\d+\.?\d*$/.test(country);
}

function getLocationCoordinates(s: LocationSettings): { latitude: number; longitude: number } | null {
  if (
    typeof s.latitude === "number" &&
    Number.isFinite(s.latitude) &&
    typeof s.longitude === "number" &&
    Number.isFinite(s.longitude)
  ) {
    return { latitude: s.latitude, longitude: s.longitude };
  }

  const latitude = Number(String(s.city ?? "").trim());
  const longitude = Number(String(s.country ?? "").trim());
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return { latitude, longitude };
  }
  return null;
}

function inferEgyptFromText(city: string, cityLabel: string, country: string): boolean {
  if (country === "Egypt") return true;
  const blob = `${city} ${cityLabel} ${country}`.toLowerCase();
  return /\begypt\b|مصر|\bcairo\b|القاهرة|\balexandria\b|الإسكندرية|الاسكندرية/.test(blob);
}

const OFFICIAL_COUNTRY_METHODS = [
  "Saudi Arabia",
  "Egypt",
  "United Arab Emirates",
  "Kuwait",
  "Qatar",
  "Jordan",
  "Turkey",
] as const;

function countryHasOfficialMethod(country: string): boolean {
  return (OFFICIAL_COUNTRY_METHODS as readonly string[]).includes(country);
}

function parseMethodId(raw: unknown): number | null {
  const n = typeof raw === "number" && Number.isFinite(raw) ? raw : Number(raw);
  if (Number.isFinite(n) && VALID_ALADHAN_METHOD_IDS.has(n)) return n;
  return null;
}

function toCalcMethodId(raw: unknown, countryHint: string): number {
  const parsed = parseMethodId(raw);
  if (parsed != null) return parsed;
  const country = String(countryHint ?? "").trim();
  const coordLike = /^-?\d+\.?\d*$/.test(country);
  if (!coordLike && country && countryHasOfficialMethod(country)) return recommendedMethodForCountry(country);
  return DEFAULT_SETTINGS.method;
}

function matchPresetFromLabels(s: LocationSettings): CityOption | null {
  const hay = `${s.city} ${s.cityLabel} ${s.country}`;
  const order: { id: string; test: (h: string) => boolean }[] = [
    { id: "mecca", test: (h) => /مكة|mecca|makkah|makka/i.test(h) },
    { id: "medina", test: (h) => /المدينة المنورة|المدينة|medina|madinah/i.test(h) },
    { id: "riyadh", test: (h) => /الرياض|riyadh|ar riyad/i.test(h) },
    { id: "jeddah", test: (h) => /جدة|جده|jeddah|jedda/i.test(h) },
    { id: "cairo", test: (h) => /القاهرة|\bcairo\b/i.test(h) },
    { id: "alex", test: (h) => /الإسكندرية|الاسكندرية|\balexandria\b/i.test(h) },
    { id: "dubai", test: (h) => /دبي|\bdubai\b/i.test(h) },
    { id: "abudhabi", test: (h) => /أبو\s*ظبي|abu\s*dhabi|abudhabi/i.test(h) },
    { id: "kuwait", test: (h) => /الكويت|\bkuwait\b/i.test(h) },
    { id: "doha", test: (h) => /الدوحة|\bdoha\b/i.test(h) },
    { id: "amman", test: (h) => /عمّان|عمان|amman/i.test(h) },
    { id: "istanbul", test: (h) => /إسطنبول|اسطنبول|\bistanbul\b/i.test(h) },
  ];
  for (const { id, test } of order) {
    if (!test(hay)) continue;
    const opt = CITY_OPTIONS.find((c) => c.id === id);
    if (opt && opt.id !== "custom") return opt;
  }
  return null;
}

function resolveSelectedCityId(s: LocationSettings): string {
  if (isCoordinateLocation(s)) return "custom";
  const exact = CITY_OPTIONS.find(
    (c) => c.id !== "custom" && c.city === s.city && c.country === s.country,
  );
  if (exact) return exact.id;
  const inferred = matchPresetFromLabels(s);
  if (inferred) return inferred.id;
  return "custom";
}

function normalizeFromPreset(s: LocationSettings, preset: CityOption): LocationSettings {
  return {
    ...s,
    city: preset.city,
    country: preset.country,
    cityLabel: preset.label,
    method: preset.method,
  };
}

function alignMethodWithLocation(s: LocationSettings): LocationSettings {
  const method0 = toCalcMethodId(s.method, s.country);
  s = { ...s, method: method0 };

  if (isCoordinateLocation(s)) return s;

  const exact = CITY_OPTIONS.find(
    (c) => c.id !== "custom" && c.city === s.city && c.country === s.country,
  );
  if (exact) {
    return normalizeFromPreset(s, exact);
  }

  const inferred = matchPresetFromLabels(s);
  if (inferred) {
    return normalizeFromPreset(s, inferred);
  }

  if (inferEgyptFromText(s.city, s.cityLabel, s.country)) {
    let next: LocationSettings = { ...s, country: "Egypt", method: 5 };
    const combined = `${next.city} ${next.cityLabel}`;
    if (/القاهرة|\bcairo\b/i.test(combined)) {
      next.city = "Cairo";
      if (!next.cityLabel?.trim()) next.cityLabel = "القاهرة";
    } else if (/الإسكندرية|الاسكندرية|\balexandria\b/i.test(combined)) {
      next.city = "Alexandria";
      if (!next.cityLabel?.trim()) next.cityLabel = "الإسكندرية";
    }
    return next;
  }

  if (countryHasOfficialMethod(s.country)) {
    const want = recommendedMethodForCountry(s.country);
    if (s.method !== want) return { ...s, method: want };
  }

  return s;
}

function loadSettings(): LocationSettings {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return DEFAULT_SETTINGS;
}

function readInitialSettings(): LocationSettings {
  const raw = loadSettings();
  const aligned = alignMethodWithLocation(raw);
  if (JSON.stringify(aligned) !== JSON.stringify(raw)) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(aligned));
    } catch {
      /* ignore */
    }
  }
  return aligned;
}

function toTime12(h24: number, m: number): string {
  const period = h24 < 12 ? "ص" : "م";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function parseApiTime(timeStr: string): number {
  const match = String(timeStr).match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  const h = Number(match[1]);
  const m = Number(match[2]);
  return h * 60 + m;
}

function formatDate(): string {
  const now = new Date();
  const dayNames = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  const monthNames = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  return `${dayNames[now.getDay()]}، ${now.getDate()} ${monthNames[now.getMonth()]}`;
}

function formatHijriDateLocal(): string {
  const now = new Date();
  const hijriMonths = ["محرم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"];
  const JD = Math.floor((now.getTime() / 86400000) + 2440587.5);
  const l = JD - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return `${day} ${hijriMonths[month - 1]} ${year} هـ`;
}

export function PrayerTimersHome() {
  const [now, setNow] = useState(new Date());
  const [settings, setSettings] = useState<LocationSettings>(() => readInitialSettings());
  const [hijriLine, setHijriLine] = useState<string>(() => formatHijriDateLocal());
  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<string>(() => resolveSelectedCityId(readInitialSettings()));
  const [customCityInput, setCustomCityInput] = useState("");
  const [customCountryInput, setCustomCountryInput] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const fetchPrayerTimes = useCallback(async (loc: LocationSettings) => {
    setLoading(true);
    setError(false);
    setErrorMessage("");
    try {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      const dateStr = `${dd}-${mm}-${yyyy}`;
      const methodId = toCalcMethodId(loc.method, loc.country);
      const coordinates = getLocationCoordinates(loc);
      let url = "";
      if (coordinates) {
        url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&method=${methodId}`;
      } else {
        const city = String(loc.city ?? "").trim();
        const country = String(loc.country ?? "").trim();
        if (!city || !country) throw new Error("MISSING_CITY_OR_COUNTRY");
        const normalizedCity = normalizeCityForAPI(city, country);
        url = `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(normalizedCity)}&country=${encodeURIComponent(country)}&method=${methodId}`;
      }

      let res: Response | null = null;
      let lastFetchError: unknown = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          res = await fetch(url, { signal: AbortSignal.timeout(10000) });
          break;
        } catch (e) {
          lastFetchError = e;
          if (attempt === 0) await new Promise((r) => setTimeout(r, 1200));
        }
      }
      if (!res) throw lastFetchError ?? new Error("NETWORK_ERROR");

      const data = await res.json();
      if (data.code !== 200) {
        const apiMessage = typeof data?.data === "string" ? data.data : "API error";
        throw new Error(apiMessage);
      }
      const hijri = data.data?.date?.hijri;
      if (hijri?.day != null && hijri?.year != null) {
        const mar = hijri.month?.ar ?? hijri.month?.en;
        if (mar) setHijriLine(`${hijri.day} ${mar} ${hijri.year} هـ`);
        else setHijriLine(formatHijriDateLocal());
      } else {
        setHijriLine(formatHijriDateLocal());
      }
      const t = data.data.timings;

      // Save prayer times for persistence
      try {
        const timingsToSave = {
          fajr: t.Fajr,
          sunrise: t.Sunrise,
          dhuhr: t.Dhuhr,
          asr: t.Asr,
          maghrib: t.Maghrib,
          isha: t.Isha
        };
        localStorage.setItem('prayerTimes', JSON.stringify(timingsToSave));
      } catch (e) {
        console.error("Failed to save prayer times:", e);
      }

      const raw = [
        { name: "Fajr",    arabicName: "الفجر",   time: t.Fajr },
        { name: "Dhuhr",   arabicName: "الظهر",   time: t.Dhuhr },
        { name: "Asr",     arabicName: "العصر",   time: t.Asr },
        { name: "Maghrib", arabicName: "المغرب",  time: t.Maghrib },
        { name: "Isha",    arabicName: "العشاء",  time: t.Isha },
      ];
      const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
      let nextIndex = raw.findIndex((p) => parseApiTime(p.time) > currentMinutes);
      if (nextIndex === -1) nextIndex = 0;
      setPrayers(raw.map((p, i) => {
        const mins = parseApiTime(p.time);
        return { name: p.name, arabicName: p.arabicName, minutes: mins, time12: toTime12(Math.floor(mins / 60), mins % 60), isNext: i === nextIndex };
      }));

      // Schedule notifications if enabled
      const prayerTimesForNotifications = {
        fajr: new Date(`${today.toDateString()} ${t.Fajr}`),
        dhuhr: new Date(`${today.toDateString()} ${t.Dhuhr}`),
        asr: new Date(`${today.toDateString()} ${t.Asr}`),
        maghrib: new Date(`${today.toDateString()} ${t.Maghrib}`),
        isha: new Date(`${today.toDateString()} ${t.Isha}`)
      };
      notificationManager.scheduleNotifications(prayerTimesForNotifications);
    } catch (err) {
      setError(true);
      const message = err instanceof Error ? err.message : String(err ?? "");
      console.error("Prayer times fetch error:", message);
      if (message === "MISSING_CITY_OR_COUNTRY") {
        setErrorMessage("يرجى كتابة اسم المدينة والدولة، أو استخدم زر تحديد الموقع.");
      } else if (message === "NETWORK_ERROR" || message.includes("fetch") || message.includes("network")) {
        setErrorMessage("تعذّر الاتصال بالإنترنت — تحقق من اتصالك ثم اضغط إعادة المحاولة.");
      } else if (message.toLowerCase().includes("invalid") || message.toLowerCase().includes("not found")) {
        setErrorMessage(`اسم المدينة أو الدولة غير صحيح. جرّب مدينة شهيرة.`);
      } else {
        setErrorMessage(`خطأ: ${message || "تعذّر تحميل أوقات الصلاة"}`);
      }
      setHijriLine(formatHijriDateLocal());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrayerTimes(settings); }, [settings, fetchPrayerTimes]);

  useEffect(() => {
    const timer = setInterval(() => {
      const n = new Date();
      setNow(n);
      if (prayers.length > 0) {
        const currentMinutes = n.getHours() * 60 + n.getMinutes();
        let nextIndex = prayers.findIndex((p) => p.minutes > currentMinutes);
        if (nextIndex === -1) nextIndex = 0;
        
        // Only update prayers if the nextIndex has changed to avoid unnecessary re-renders
        setPrayers((prev) => {
          const currentIndex = prev.findIndex(p => p.isNext);
          if (currentIndex === nextIndex) return prev;
          return prev.map((p, i) => ({ ...p, isNext: i === nextIndex }));
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [prayers.length]); // Only depend on prayers length for initialization

  const nextPrayer = prayers.find((p) => p.isNext);

  function applyLocationChange() {
    const selected = CITY_OPTIONS.find((c) => c.id === selectedCityId) ?? CITY_OPTIONS[0];
    let newSettings: LocationSettings;
    if (selected.id === "custom") {
      const rawCity = customCityInput.trim();
      const rawCountry = customCountryInput.trim();
      if (!rawCity || !rawCountry) {
        setError(true);
        setErrorMessage("يرجى اختيار دولة من القائمة وكتابة اسم المدينة.");
        return;
      }
      const selectedCountry = COUNTRY_OPTIONS.find(c => c.value === rawCountry);
      if (selectedCountry) {
        const translatedCity = translateToEnglish(rawCity, CITY_AR_TO_EN);
        newSettings = alignMethodWithLocation({
          city: translatedCity,
          country: selectedCountry.value,
          cityLabel: `${rawCity}، ${selectedCountry.label}`,
          method: selectedCountry.method,
          latitude: undefined,
          longitude: undefined,
        });
      } else {
        const customCity = translateToEnglish(rawCity, CITY_AR_TO_EN);
        const customCountry = translateToEnglish(rawCountry, COUNTRY_AR_TO_EN);
        const cityLabel = `${rawCity}، ${rawCountry}`;
        const method = countryHasOfficialMethod(customCountry)
          ? recommendedMethodForCountry(customCountry)
          : toCalcMethodId(settings.method, customCountry);
        newSettings = alignMethodWithLocation({
          city: customCity,
          country: customCountry,
          cityLabel,
          method,
          latitude: undefined,
          longitude: undefined,
        });
      }
    } else {
      newSettings = alignMethodWithLocation({
        city: selected.city,
        country: selected.country,
        cityLabel: selected.label,
        method: selected.method,
        latitude: undefined,
        longitude: undefined,
      });
    }
    setError(false);
    setErrorMessage("");
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    setShowSettings(false);
  }

  function syncSettingsToPresetCityId(cityId: string) {
    const selected = CITY_OPTIONS.find((c) => c.id === cityId);
    if (!selected || selected.id === "custom") return;
    setSettings((prev) => {
      const next = alignMethodWithLocation({
        ...prev,
        city: selected.city,
        country: selected.country,
        cityLabel: selected.label,
        method: selected.method,
        latitude: undefined,
        longitude: undefined,
      });
      if (JSON.stringify(next) === JSON.stringify(prev)) return prev;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function onPresetCitySelected(cityId: string) {
    setSelectedCityId(cityId);
    if (cityId === "custom") return;
    setCustomCityInput("");
    setCustomCountryInput("");
    syncSettingsToPresetCityId(cityId);
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setError(true);
      setErrorMessage("المتصفح لا يدعم تحديد الموقع الجغرافي.");
      return;
    }

    setGeoLoading(true);
    setError(false);
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const today = new Date();
          const dd = String(today.getDate()).padStart(2, "0");
          const mm = String(today.getMonth() + 1).padStart(2, "0");
          const yyyy = today.getFullYear();
          const snap = settingsRef.current;
          const methodId = toCalcMethodId(snap.method, snap.country);

          const timingsUrl = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${latitude}&longitude=${longitude}&method=${methodId}`;
          const timingsRes = await fetch(timingsUrl);
          const timingsData = await timingsRes.json();

          if (timingsData.code !== 200) {
            throw new Error("فشل الحصول على أوقات الصلاة من الإحداثيات");
          }

          let city = "";
          let country = "";

          try {
            const geoRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`,
              { signal: AbortSignal.timeout(5000) }
            );
            if (geoRes.ok) {
              const geo = await geoRes.json();
              city = String(geo.city || geo.locality || geo.principalSubdivision || "").trim();
              country = String(geo.countryName || "").trim();
            }
          } catch (geoErr) {
            console.log("تنبيه: تعذر تحديد اسم المدينة، سيتم استخدام الإحداثيات");
          }

          const meta = timingsData.data?.meta;
          const timezone = meta?.timezone || "";
          if (!city) {
            city = timezone.split("/")[1]?.replace(/_/g, " ") || "موقعك الحالي";
          }

          const cityLabel = city && country ? `${city}، ${country}` : (city || "الموقع المكتشف");
          const calculatedMethod = country && countryHasOfficialMethod(country)
            ? recommendedMethodForCountry(country)
            : methodId;

          const newSettings: LocationSettings = {
            city: city || "Current Location",
            country: country || "World",
            cityLabel,
            method: calculatedMethod,
            latitude,
            longitude,
          };

          setError(false);
          setErrorMessage("");
          setSettings(newSettings);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
          setSelectedCityId("custom");
          setCustomCityInput(city);
          setCustomCountryInput(country);
          setShowSettings(false);
        } catch (err) {
          console.error("خطأ في تحديد الموقع:", err);
          setError(true);
          setErrorMessage("حدث خطأ أثناء معالجة موقعك. تأكد من الاتصال بالإنترنت.");
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        setGeoLoading(false);
        setError(true);
        
        let errorMsg = "";
        switch (error.code) {
          case 1:
            errorMsg = "لم تسمح للموقع بالوصول إلى موقعك الجغرافي.";
            break;
          case 2:
            errorMsg = "تعذر الحصول على موقعك الجغرافي.";
            break;
          case 3:
            errorMsg = "انتهت مهلة الوقت المخصصة لتحديد الموقع.";
            break;
          default:
            errorMsg = "حدث خطأ غير معروف أثناء تحديد الموقع.";
        }
        setErrorMessage(errorMsg);
      },
      { 
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] p-5 sm:p-6 mb-4 border border-white/10 bg-slate-900/50 backdrop-blur-2xl shadow-2xl transition-all duration-500"
      data-testid="card-prayer-timers-home"
    >
      {/* Ambient aurora accents inside the panel */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-20 -left-16 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-12 h-44 w-44 rounded-full bg-amber-500/8 blur-3xl" />
      </div>

      {/* Top hairline accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      {/* Header — city + hijri date */}
      <div className="relative mb-4 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 backdrop-blur-sm">
        <div className="relative flex items-start justify-center">
          <button
            onClick={() => {
              if (showSettings) {
                setShowSettings(false);
                return;
              }
              setShowSettings(true);
              const id = resolveSelectedCityId(settings);
              setSelectedCityId(id);
              const coords = getLocationCoordinates(settings);
              if (id === "custom") {
                setCustomCityInput(coords ? "" : (settings.city || "").trim());
                setCustomCountryInput(coords ? "" : (settings.country || "").trim());
              } else {
                setCustomCityInput("");
                setCustomCountryInput("");
              }
              queueMicrotask(() => {
                if (id !== "custom") syncSettingsToPresetCityId(id);
                else {
                  const aligned = alignMethodWithLocation(settings);
                  if (JSON.stringify(aligned) !== JSON.stringify(settings)) {
                    setSettings(aligned);
                    try {
                      localStorage.setItem(STORAGE_KEY, JSON.stringify(aligned));
                    } catch {
                      /* ignore */
                    }
                  }
                }
              });
            }}
            className="absolute left-0 top-0.5 p-1.5 rounded-lg hover:bg-amber-500/10 transition-all duration-300 transform hover:scale-110"
            data-testid="button-prayer-settings"
            title="اختيار المدينة"
          >
            <Settings className="h-3.5 w-3.5 text-amber-300/70" />
          </button>
          <div className="text-center arabic-text">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <MapPin className="h-3.5 w-3.5 text-amber-300/70" />
              <span className="text-sm font-bold text-slate-100 font-ui">{settings.cityLabel}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-light">{hijriLine}</p>
            <p className="text-[11px] text-slate-500 font-light">{formatDate()}</p>
          </div>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="mb-4 bg-slate-950/60 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-xl animate-slide-down">
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/5">
            <button onClick={() => setShowSettings(false)} className="p-1 rounded hover:bg-white/5 transition-all duration-300 transform hover:scale-110">
              <X className="h-3.5 w-3.5 text-slate-400" />
            </button>
            <span className="text-xs font-bold text-slate-200">اختيار المدينة</span>
          </div>

          <div className="px-4 pb-4 pt-4">
            <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-slate-400 block text-right mb-2 font-semibold">المدينة</label>
                  <select
                    value={selectedCityId}
                    onChange={(e) => onPresetCitySelected(e.target.value)}
                    className="w-full bg-slate-900/60 text-slate-100 text-sm rounded-lg px-3 py-2 border border-white/10 outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 text-right font-ui"
                    dir="rtl"
                  >
                    {CITY_OPTIONS.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCityId !== "custom" && (
                  <div className="flex items-center justify-between bg-amber-500/5 rounded-lg border border-amber-500/10 px-3 py-2">
                    <span className="text-xs text-amber-300 font-medium">
                      {methodName(CITY_OPTIONS.find((c) => c.id === selectedCityId)?.method ?? 4)}
                    </span>
                    <span className="text-xs text-slate-400">طريقة الحساب</span>
                  </div>
                )}

                {selectedCityId === "custom" && (
                  <>
                    <div>
                      <label className="text-xs text-slate-400 block text-right mb-2 font-semibold">اسم المدينة</label>
                      <input
                        type="text"
                        value={customCityInput}
                        onChange={(e) => setCustomCityInput(e.target.value)}
                        placeholder="مثال: Jakarta أو القاهرة"
                        className="w-full bg-slate-900/60 text-slate-100 text-sm rounded-lg px-3 py-2 border border-white/10 outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 text-right placeholder:text-slate-500"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block text-right mb-2 font-semibold">اسم الدولة</label>
                      <select
                        value={customCountryInput}
                        onChange={(e) => setCustomCountryInput(e.target.value)}
                        className="w-full bg-slate-900/60 text-slate-100 text-sm rounded-lg px-3 py-2 border border-white/10 outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 text-right font-ui"
                        dir="rtl"
                      >
                        <option value="">— اختر دولة —</option>
                        {COUNTRY_OPTIONS.map((country) => (
                          <option key={country.value} value={country.value}>
                            {country.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {customCountryInput.trim() && (
                      <div className="flex items-center justify-between bg-amber-500/5 rounded-lg border border-amber-500/10 px-3 py-2">
                        <span className="text-xs text-amber-300 font-medium">
                          {methodName(recommendedMethodForCountry(
                            translateToEnglish(customCountryInput.trim(), COUNTRY_AR_TO_EN)
                          ))}
                        </span>
                        <span className="text-xs text-slate-400">طريقة الحساب</span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={detectLocation}
                    disabled={geoLoading}
                    className="flex items-center gap-1.5 flex-1 justify-center text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-200 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {geoLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                    <span>حدد موقعي تلقائياً</span>
                  </button>
                  <button
                    onClick={applyLocationChange}
                    className="flex-1 text-xs bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 py-2 rounded-lg hover:from-amber-400 hover:to-amber-300 transition-all font-semibold"
                  >
                    تطبيق
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}


      {/* Prayer times — immersive glass dashboard */}
      {!showSettings && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-10 mb-4">
              <Loader2 className="h-7 w-7 animate-spin text-amber-400/70" />
              <span className="text-base text-slate-400 mr-3 font-medium">جاري تحميل أوقات الصلاة...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 mb-4 bg-red-950/30 border border-red-500/20 rounded-2xl">
              <p className="text-sm text-red-300/90 mb-4 font-medium">
                {errorMessage || "تعذّر تحميل أوقات الصلاة — تحقق من اتصالك بالإنترنت."}
              </p>
              <button
                onClick={() => fetchPrayerTimes(settings)}
                className="text-sm bg-amber-500/80 hover:bg-amber-500 text-slate-950 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div className="relative animate-fade-in">
              {/* Next prayer — elite ambient neon glow accent block */}
              {nextPrayer && (
                <div className="relative mb-4 overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-l from-amber-500/10 via-amber-500/5 to-transparent p-4 backdrop-blur-sm">
                  <div className="absolute -top-12 -right-8 h-32 w-32 rounded-full bg-amber-500/15 blur-3xl animate-pulse" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-md animate-pulse" />
                        <div className="relative h-10 w-10 rounded-full border border-amber-400/30 bg-amber-500/10 flex items-center justify-center">
                          <span className="text-amber-300 text-lg">☪</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-amber-300/60 uppercase tracking-wider">الصلاة التالية</p>
                        <p className="text-lg font-bold text-amber-100">{nextPrayer.arabicName}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">المتبقي</p>
                      <p className="text-base font-mono font-bold text-amber-200">
                        {(() => {
                          const currentMinutes = now.getHours() * 60 + now.getMinutes();
                          let diff = nextPrayer.minutes - currentMinutes;
                          if (diff < 0) diff += 24 * 60;
                          const h = Math.floor(diff / 60);
                          const m = diff % 60;
                          return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Remaining prayers — stylized fluid row */}
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {(loading || error
                  ? ["الفجر","الظهر","العصر","المغرب","العشاء"].map((n) => ({ arabicName: n, time12: "—", isNext: false, name: n, minutes: 0 }))
                  : prayers
                ).map((prayer, index) => (
                  <div
                    key={prayer.name}
                    className={`relative overflow-hidden rounded-xl border p-2.5 sm:p-3 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 animate-fade-in ${
                      prayer.isNext
                        ? "border-amber-500/40 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                        : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                    }`}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    {prayer.isNext && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-16 rounded-full bg-amber-400/20 blur-2xl" />
                    )}
                    <p className={`relative text-[10px] sm:text-xs font-semibold mb-1 ${prayer.isNext ? "text-amber-300" : "text-slate-400"}`}>
                      {prayer.arabicName}
                    </p>
                    <p className={`relative text-sm sm:text-base font-bold font-mono ${prayer.isNext ? "text-amber-100" : "text-slate-200"}`}>
                      {prayer.time12}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Bottom decorative line */}
      <div className="mt-4 flex justify-center items-center gap-2 opacity-40">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        <div className="text-amber-300/50 text-[10px]">☪</div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/20 to-transparent" />
      </div>
    </div>
  );
}
