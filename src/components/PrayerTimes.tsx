import { useState, useEffect, useCallback, useRef } from "react";
import { Timer, Settings, X, MapPin, Loader2, Navigation } from "lucide-react";
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
  method: number; // طريقة الحساب المرتبطة بهذه المدينة تحديداً
}

/** أرقام طرق الحساب المعتمدة في Aladhan (تُستخدم داخلياً فقط مع اختيار المدينة) */
const VALID_ALADHAN_METHOD_IDS = new Set([1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 99]);

/** خريطة ترجمة أسماء الدول من العربي/الشائع إلى الإنجليزي المقبول من API */
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
  "المريد": "Mauritania",
  "غينيا": "Guinea",
  "غينيا بيساو": "Guinea-Bissau",
  "مالي": "Mali",
  "بوركينا فاسو": "Burkina Faso",
  "توغو": "Togo",
  "بنين": "Benin",
  "كوت ديفوار": "Côte d'Ivoire",
  "جمهورية الكونغو": "Congo",
  "جمهورية الكونغو الديمقراطية": "Democratic Republic of Congo",
  "الكاميرون": "Cameroon",
  "الغابون": "Gabon",
  "تشاد": "Chad",
  "أوغندا": "Uganda",
  "تنزانيا": "Tanzania",
  "موزمبيق": "Mozambique",
  "زيمبابوي": "Zimbabwe",
  "بوتسوانا": "Botswana",
  "ناميبيا": "Namibia",
  "ليسوتو": "Lesotho",
  "إسواتيني": "Eswatini",
  "مدغشقر": "Madagascar",
  "جزر القمر": "Comoros",
  "سيشل": "Seychelles",
  "ليتوانيا": "Lithuania",
  "لاتفيا": "Latvia",
  "استونيا": "Estonia",
  "بولندا": "Poland",
  "أوكرانيا": "Ukraine",
  "بيلاروسيا": "Belarus",
  "مولدوفا": "Moldova",
  "رومانيا": "Romania",
  "بلغاريا": "Bulgaria",
  "صربيا": "Serbia",
  "الجبل الأسود": "Montenegro",
  "كرواتيا": "Croatia",
  "البانيا": "Albania",
  "جمهورية مقدونيا": "North Macedonia",
  "اليونان": "Greece",
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
  // المدن المصرية
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
  "القاهرة الجديدة": "Cairo",
  "التجمع الخامس": "Cairo",
  "مدينة نصر": "Cairo",
  "المقطم": "Cairo",
  "التجمع الأول": "Cairo",
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
  "لاغوس": "Lagos",
  "أبوجا": "Abuja",
  "أديس أبابا": "Addis Ababa",
  "دكار": "Dakar",
  "مقديشو": "Mogadishu",
};

/**
 * يحاول ترجمة اسم المدينة أو الدولة من العربي إلى الإنجليزي.
 * إذا لم يجد ترجمة يُعيد النص كما هو (قد يكون إنجليزياً أصلاً).
 */
function translateToEnglish(text: string, map: Record<string, string>): string {
  const trimmed = text.trim();
  // بحث مباشر
  if (map[trimmed]) return map[trimmed];
  // بحث غير حساس لحالة الأحرف
  const lower = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(map)) {
    if (key.toLowerCase() === lower) return val;
  }
  return trimmed;
}

const DEFAULT_SETTINGS: LocationSettings = {
  city: "Mecca", country: "Saudi Arabia", cityLabel: "مكة المكرمة", method: 4,
};
/**
 * قائمة المدن مع طريقة الحساب المرتبطة بكل مدينة تحديداً
 *
 * معرّفات طرق الحساب (Aladhan):
 *  4  = أم القرى (السعودية)
 *  5  = الهيئة المصرية العامة للمساحة (مصر)
 *  8  = الخليج العربي / دبي
 *  9  = الكويت
 * 10  = قطر
 *  3  = رابطة العالم الإسلامي (الأردن)
 * 13  = ديانت (تركيا)
 */
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

/** قائمة الدول المشهيرة للاختيار المباشر */
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
const GEO_PROMPT_KEY = "athkari_geo_prompted_v1";

/** خريطة ربط المدن التي قد لا يقبلها API بمدن قريبة معروفة */
const CITY_FALLBACK: Record<string, Record<string, string>> = {
  "Egypt": {
    "Port Said": "Cairo", // بورسعيد -> القاهرة
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

/** يحاول الحصول على اسم مدينة معروفة للـ API من اسم مدينة قد لا يكون معروفاً */
function normalizeCityForAPI(city: string, country: string): string {
  const fallbacks = CITY_FALLBACK[country];
  if (fallbacks && fallbacks[city]) {
    return fallbacks[city];
  }
  return city;
}

/** طريقة الحساب الافتراضية حسب الدولة — تُستخدم للمدن المخصصة فقط */
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

/** يُعيد طريقة الحساب المرتبطة بالمدينة مباشرةً من CITY_OPTIONS */
function methodForPreset(cityId: string): number {
  const opt = CITY_OPTIONS.find((c) => c.id === cityId);
  return opt ? opt.method : DEFAULT_SETTINGS.method;
}

/** يُعيد الاسم العربي لطريقة الحساب بناءً على رقمها */
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

/** موقع محفوظ كإحداثيات (تحديد تلقائي) — لا نعيد تخمين الدولة من النص */
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

/** يضمن أن method رقم صالح — تجنّب ظهور «أم القرى» افتراضياً عندما يُحفظ method كنص في localStorage */
function toCalcMethodId(raw: unknown, countryHint: string): number {
  const parsed = parseMethodId(raw);
  if (parsed != null) return parsed;
  const country = String(countryHint ?? "").trim();
  const coordLike = /^-?\d+\.?\d*$/.test(country);
  if (!coordLike && country && countryHasOfficialMethod(country)) return recommendedMethodForCountry(country);
  return DEFAULT_SETTINGS.method;
}

/** يطابق مدينة القائمة من نص عربي/إنجليزي عندما لا يطابق حقل city الاسم الإنجليزي للـ API */
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

/** يحدد خيار القائمة من الإعدادات حتى لو كان حقل city عربيًا أو غير مطابق لاسم الـ API */
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
    method: preset.method, // الطريقة مرتبطة بالمدينة مباشرةً
  };
}

/** يربط طريقة الحساب بالدولة/المدينة — يصلح عدم التطابق (مكة + طريقة مصر، إلخ) */
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
  return `${dayNames[now.getDay()]}، ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
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

export function PrayerTimes() {
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
        // محاولة تطبيع اسم المدينة للـ API
        const normalizedCity = normalizeCityForAPI(city, country);
        url = `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(normalizedCity)}&country=${encodeURIComponent(country)}&method=${methodId}`;
      }

      // محاولتان في حال فشل الاتصال أول مرة
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
      
      // Schedule notifications after successfully getting prayer times
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
      console.error("Prayer times fetch error:", message, "City:", settings.city, "Country:", settings.country);
      if (message === "MISSING_CITY_OR_COUNTRY") {
        setErrorMessage("يرجى كتابة اسم المدينة والدولة، أو استخدم زر تحديد الموقع.");
      } else if (message === "NETWORK_ERROR" || message.includes("fetch") || message.includes("network") || message.includes("Failed")) {
        setErrorMessage("تعذّر الاتصال بالإنترنت — تحقق من اتصالك ثم اضغط إعادة المحاولة.");
      } else if (message.toLowerCase().includes("invalid") || message.toLowerCase().includes("not found") || message.toLowerCase().includes("city")) {
        setErrorMessage(`اسم المدينة (${settings.city}) أو الدولة (${settings.country}) غير صحيح. جرّب مدينة شهيرة أو استخدم الإحداثيات.`);
      } else {
        setErrorMessage(`خطأ: ${message || "تعذّر تحميل أوقات الصلاة — تحقق من اتصالك بالإنترنت."}`);
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

  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const nextPrayer = prayers.find((p) => p.isNext);
  const currentTotalSeconds = h * 3600 + m * 60 + s;
  let secondsLeft = nextPrayer ? nextPrayer.minutes * 60 - currentTotalSeconds : 0;
  if (secondsLeft <= 0) secondsLeft += 24 * 3600;
  const cd_h = Math.floor(secondsLeft / 3600);
  const cd_m = Math.floor((secondsLeft % 3600) / 60);
  const cd_s = secondsLeft % 60;
  const countdownStr = cd_h > 0
    ? `${cd_h}:${String(cd_m).padStart(2, "0")}:${String(cd_s).padStart(2, "0")}`
    : `${String(cd_m).padStart(2, "0")}:${String(cd_s).padStart(2, "0")}`;

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
      // إذا كانت الدولة من القائمة المعرّفة
      const selectedCountry = COUNTRY_OPTIONS.find(c => c.value === rawCountry);
      if (selectedCountry) {
        // استخدم الدولة المختارة مباشرة وترجم اسم المدينة إلى إنجليزي
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
        // محاولة ترجمة الدولة المكتوبة يدوياً
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
        method: selected.method, // الطريقة مرتبطة بالمدينة مباشرةً
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
        method: selected.method, // الطريقة مرتبطة بالمدينة مباشرةً
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

          // جلب أوقات الصلاة للإحداثيات المكتشفة
          const timingsUrl = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${latitude}&longitude=${longitude}&method=${methodId}`;
          const timingsRes = await fetch(timingsUrl);
          const timingsData = await timingsRes.json();

          if (timingsData.code !== 200) {
            throw new Error("فشل الحصول على أوقات الصلاة من الإحداثيات");
          }

          // جلب اسم المدينة والدولة من الإحداثيات
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

          // استخدام معلومات المنطقة الزمنية كبديل
          const meta = timingsData.data?.meta;
          const timezone = meta?.timezone || "";
          if (!city) {
            city = timezone.split("/")[1]?.replace(/_/g, " ") || "موقعك الحالي";
          }

          const cityLabel = city && country ? `${city}، ${country}` : (city || city || "الموقع المكتشف");
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
          setErrorMessage("حدث خطأ أثناء معالجة موقعك. تأكد من الاتصال بالإنترنت و يرجى المحاولة مجددا.");
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
            errorMsg = "لم تسمح للموقع بالوصول إلى موقعك الجغرافي. يرجى تفعيل هذا الإذن من إعدادات المتصفح.";
            break;
          case 2:
            errorMsg = "تعذر الحصول على موقعك الجغرافي. تأكد من إنك في منطقة بها إشارة GPS قوية.";
            break;
          case 3:
            errorMsg = "انتهت مهلة الوقت المخصصة لتحديد الموقع. يرجى المحاولة مجددا.";
            break;
          default:
            errorMsg = "حدث خطأ غير معروف أثناء تحديد الموقع.";
        }
        setErrorMessage(errorMsg);
      },
      { 
        enableHighAccuracy: false, // تقليل دقة البحث لسرعة أكبر
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  useEffect(() => {
    // لا نقوم بتحديد الموقع تلقائياً عند التحميل
    // المستخدم سيضغط على الزر بنفسه
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 sm:p-6 mb-5 text-amber-900 dark:text-white border border-amber-200 dark:border-orange-500/30 bg-gradient-to-br from-white dark:from-slate-900 via-amber-50 dark:via-slate-800 to-white dark:to-slate-900 shadow-lg dark:shadow-[0_16px_40px_-12px_rgba(249,115,22,0.3)] backdrop-blur-sm"
      data-testid="card-prayer-times"
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-20 -left-16 h-40 w-40 rounded-full bg-amber-300/30 dark:bg-orange-500/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-12 h-44 w-44 rounded-full bg-yellow-300/30 dark:bg-amber-500/15 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-amber-200/40 dark:bg-orange-400/10 blur-2xl animate-pulse delay-500" />
      </div>
      {/* Top row */}
      <div className="relative mb-4 rounded-xl border border-amber-200 dark:border-orange-500/30 bg-gradient-to-l from-amber-50 dark:from-slate-800/50 via-white dark:via-slate-700/50 to-amber-50 dark:to-slate-800/50 px-4 py-4 shadow-lg backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400 dark:via-orange-400/50 to-transparent" />
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
            className="absolute left-0 top-0.5 p-2 rounded-lg hover:bg-amber-200 dark:hover:bg-orange-500/20 transition-colors"
            data-testid="button-prayer-settings"
            title="اختيار المدينة"
          >
            <Settings className="h-4 w-4 text-amber-700 dark:text-orange-400" />
          </button>
          <div className="text-center arabic-text">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-amber-600 dark:text-orange-400" />
              <span className="text-base font-bold text-transparent bg-gradient-to-r from-amber-700 to-yellow-600 dark:from-orange-300 dark:to-amber-200 bg-clip-text font-ui">{settings.cityLabel}</span>
            </div>
            <p className="text-xs text-amber-700/70 dark:text-orange-200/70 font-light">{hijriLine}</p>
            <p className="text-xs text-amber-600/60 dark:text-orange-200/50 font-light">{formatDate()}</p>
          </div>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="mb-4 bg-white dark:bg-slate-800/50 rounded-xl border border-amber-200 dark:border-orange-500/30 overflow-hidden backdrop-blur-sm">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-amber-200 dark:border-orange-500/20">
            <button onClick={() => setShowSettings(false)} className="p-1 rounded hover:bg-amber-100 dark:hover:bg-orange-500/20 transition-colors">
              <X className="h-4 w-4 text-amber-700 dark:text-orange-400" />
            </button>
            <span className="text-sm font-bold text-amber-800 dark:text-orange-100">اختيار المدينة</span>
          </div>

          <div className="px-4 pb-4 pt-4">
            <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-amber-700/70 dark:text-orange-200/60 block text-right mb-2 font-semibold">المدينة</label>
                  <select
                    value={selectedCityId}
                    onChange={(e) => onPresetCitySelected(e.target.value)}
                    className="w-full bg-amber-50 dark:bg-slate-900/50 text-amber-900 dark:text-white text-sm rounded-lg px-3 py-2.5 border border-amber-200 dark:border-orange-500/30 outline-none focus:border-amber-400/60 dark:focus:border-orange-400/60 focus:ring-1 focus:ring-amber-400/30 text-right font-ui"
                    dir="rtl"
                  >
                    {CITY_OPTIONS.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* عرض طريقة الحساب المرتبطة بالمدينة المختارة */}
                {selectedCityId !== "custom" && (
                  <div className="flex items-center justify-between bg-amber-50 dark:bg-orange-500/10 rounded-lg border border-amber-200 dark:border-orange-500/20 px-3 py-2.5">
                    <span className="text-xs text-amber-800 dark:text-orange-300 font-medium">
                      {methodName(CITY_OPTIONS.find((c) => c.id === selectedCityId)?.method ?? 4)}
                    </span>
                    <span className="text-xs text-amber-700/70 dark:text-orange-200/50">طريقة الحساب</span>
                  </div>
                )}

                {selectedCityId === "custom" && (
                  <>
                    <div>
                      <label className="text-xs text-amber-700/70 dark:text-orange-200/60 block text-right mb-2 font-semibold">اسم المدينة</label>
                      <input
                        type="text"
                        value={customCityInput}
                        onChange={(e) => setCustomCityInput(e.target.value)}
                        placeholder="مثال: Jakarta أو القاهرة"
                        className="w-full bg-amber-50 dark:bg-slate-900/50 text-amber-900 dark:text-white text-sm rounded-lg px-3 py-2.5 border border-amber-200 dark:border-orange-500/30 outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 text-right placeholder:text-amber-400 dark:placeholder:text-orange-300/30"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-amber-700/70 dark:text-orange-200/60 block text-right mb-2 font-semibold">اسم الدولة</label>
                      <select
                        value={customCountryInput}
                        onChange={(e) => setCustomCountryInput(e.target.value)}
                        className="w-full bg-amber-50 dark:bg-slate-900/50 text-amber-900 dark:text-white text-sm rounded-lg px-3 py-2.5 border border-amber-200 dark:border-orange-500/30 outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 text-right font-ui"
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
                    {/* عرض طريقة الحساب المتوقعة للمدينة المخصصة */}
                    {customCountryInput.trim() && (
                      <div className="flex items-center justify-between bg-amber-50 dark:bg-orange-500/10 rounded-lg border border-amber-200 dark:border-orange-500/20 px-3 py-2.5">
                        <span className="text-xs text-amber-800 dark:text-orange-300 font-medium">
                          {methodName(recommendedMethodForCountry(
                            translateToEnglish(customCountryInput.trim(), COUNTRY_AR_TO_EN)
                          ))}
                        </span>
                        <span className="text-xs text-amber-700/70 dark:text-orange-200/50">طريقة الحساب</span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={detectLocation}
                    disabled={geoLoading}
                    className="flex items-center gap-1.5 flex-1 justify-center text-xs bg-amber-200 dark:bg-orange-500/20 hover:bg-amber-300 dark:hover:bg-orange-500/30 text-amber-800 dark:text-orange-200 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {geoLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                    <span>حدد موقعي تلقائياً</span>
                  </button>
                  <button
                    onClick={applyLocationChange}
                    className="flex-1 text-xs bg-gradient-to-r from-amber-700 to-amber-600 dark:from-orange-600 dark:to-amber-600 text-white py-2.5 rounded-lg hover:from-amber-600 hover:to-amber-500 dark:hover:from-orange-500 dark:hover:to-amber-500 transition-all font-semibold"
                  >
                    تطبيق
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Countdown & times */}
      {!showSettings && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-6 mb-4">
              <Loader2 className="h-5 w-5 animate-spin text-amber-600 dark:text-orange-400" />
              <span className="text-sm text-amber-700/70 dark:text-orange-200/60 mr-2">جاري تحميل أوقات الصلاة...</span>
            </div>
          ) : error ? (
            <div className="text-center py-4 mb-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-500/30 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                {errorMessage || "تعذّر تحميل أوقات الصلاة — تحقق من اتصالك بالإنترنت."}
              </p>
              <button
                onClick={() => fetchPrayerTimes(settings)}
                className="text-xs bg-amber-700 dark:bg-orange-600 hover:bg-amber-600 dark:hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : nextPrayer && (
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 dark:from-orange-500 dark:via-amber-400 dark:to-yellow-300 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative bg-gradient-to-r from-amber-50 dark:from-orange-500/15 to-amber-50 dark:to-amber-500/15 border border-amber-300 dark:border-orange-500/50 rounded-2xl p-5 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 dark:from-yellow-400/5 via-transparent to-yellow-50 dark:to-orange-600/5" />
                <div className="relative">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-amber-700/70 dark:text-amber-200/50 mb-1 text-center sm:text-right">الوقت المتبقي على أذان</p>
                      <p className="text-lg sm:text-xl font-bold text-amber-800 dark:text-transparent dark:bg-gradient-to-r dark:from-orange-300 dark:via-amber-200 dark:to-yellow-100 dark:bg-clip-text text-center sm:text-right">
                        {nextPrayer.arabicName}
                      </p>
                    </div>
                    <div className="border-l border-amber-300 dark:border-orange-500/30 h-16 hidden sm:block" />
                    <div className="text-center">
                      <div className="font-mono text-4xl sm:text-3xl font-bold text-amber-800 dark:text-transparent dark:bg-gradient-to-r dark:from-orange-300 dark:to-amber-200 dark:bg-clip-text mb-1">
                        {countdownStr}
                      </div>
                      <Timer className="h-5 w-5 text-amber-700 dark:text-orange-400 animate-pulse mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {(loading || error
              ? ["الفجر","الظهر","العصر","المغرب","العشاء"].map((n) => ({ arabicName: n, time12: "—", isNext: false, name: n, minutes: 0 }))
              : prayers
            ).map((prayer) => (
              <div
                key={prayer.name}
                className={`relative group transition-all ${prayer.isNext ? "" : ""}`}
                data-testid={`card-prayer-${prayer.name.toLowerCase()}`}
              >
                {prayer.isNext && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 dark:from-orange-500 via-yellow-300 dark:via-amber-400 to-amber-400 dark:to-yellow-300 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                )}
                <div className={`relative text-center p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all backdrop-blur-sm ${
                  prayer.isNext 
                    ? "bg-gradient-to-br from-amber-200 dark:from-orange-500/30 to-amber-100 dark:to-amber-500/20 border-amber-400 dark:border-orange-400/60 shadow-lg dark:shadow-orange-500/20" 
                    : "bg-amber-50 dark:bg-slate-800/40 border-amber-200 dark:border-orange-500/20 hover:border-amber-400 dark:hover:border-orange-400/40 hover:bg-amber-100 dark:hover:bg-slate-800/60"
                }`}>
                  <div className={`text-xs sm:text-sm font-bold mb-2 ${
                    prayer.isNext 
                      ? "text-amber-800 dark:text-transparent dark:bg-gradient-to-r dark:from-orange-300 dark:to-amber-200 dark:bg-clip-text" 
                      : "text-amber-700 dark:text-amber-200/70"
                  }`}>
                    {prayer.arabicName}
                  </div>
                  <div className={`text-base sm:text-lg font-bold font-mono tabular-nums ${
                    prayer.isNext 
                      ? "text-amber-800 dark:text-yellow-200" 
                      : "text-amber-900 dark:text-amber-100/80"
                  }`}>
                    {prayer.time12}
                  </div>
                  {prayer.isNext && (
                    <div className="text-xs text-amber-700 dark:text-yellow-300 mt-1 font-semibold">التالية</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

