// قائمة الموذنين المشهورين مع روابط أصواتهم
export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  audioUrl: string;
  backupUrl?: string;
  description?: string;
}

export const RECITERS: Reciter[] = [
  {
    id: "nassir-al-qatami",
    name: "Nassir Al-Qatami",
    arabicName: "ناصر القطامي",
    audioUrl: "/audio/nasir_alqatami.mp3",
    backupUrl: "https://download.quranhive.com/quran/audio/nasir_al_qatami/001/full.mp3",
    description: "الموذن الشهير ناصر القطامي",
  },
  {
    id: "abdulrahman-sudais",
    name: "Abdulrahman Al-Sudais",
    arabicName: "عبدالرحمن السديس",
    audioUrl: "https://quran-audio.s3.amazonaws.com/sudais.mp3",
    backupUrl: "https://www.zekr.org/assets/quran/Sudais.mp3",
    description: "موذن المسجد الحرام",
  },
  {
    id: "saad-al-ghamidi",
    name: "Saad Al-Ghamidi",
    arabicName: "سعد الغامدي",
    audioUrl: "https://www.zekr.org/assets/quran/Full%20Quran/Saad_Al-Ghamidi.mp3",
    backupUrl: "https://download.quranhive.com/quran/audio/saad_al_ghamidi/001.mp3",
    description: "صوت جميل وعميق",
  },
  {
    id: "ahmed-al-ajmy",
    name: "Ahmed Al-Ajmy",
    arabicName: "أحمد العجمي",
    audioUrl: "https://www.zekr.org/assets/quran/Full%20Quran/Ahmed_Al-Ajmy.mp3",
    backupUrl: "https://download.quranhive.com/quran/audio/ahmed_al_ajmi/001.mp3",
    description: "صوت رقيق وخاشع",
  },
  {
    id: "abdullah-awad",
    name: "Abdullah Awad",
    arabicName: "عبد الله عواد الجهني",
    audioUrl: "https://quran.com/audio/001/001.mp3",
    backupUrl: "https://www.zekr.org/assets/quran/Abdullah_Awad.mp3",
    description: "موذن متقن وعذب الصوت",
  },
  {
    id: "hani-ar-rifai",
    name: "Hani Ar-Rifai",
    arabicName: "هاني الرفاعي",
    audioUrl: "https://www.zekr.org/assets/quran/Full%20Quran/Hani_Ar-Rifai.mp3",
    backupUrl: "https://download.quranhive.com/quran/audio/hani_ar_rifai/001.mp3",
    description: "الموذن الشهير هاني الرفاعي",
  },
];

// الحصول على المؤذن الافتراضي (ناصر القطامي دائماً للأذان التلقائي)
export const getDefaultReciter = (): Reciter => {
  // دائماً ناصر القطامي للأذان التلقائي
  return RECITERS.find(r => r.id === 'nassir-al-qatami') || RECITERS[0];
  
  // احتفظ بالـ saved للاستخدامات الأخرى
  // const saved = localStorage.getItem("selectedReciter");
  // if (saved) {
  //   const reciter = RECITERS.find((r) => r.id === saved);
  //   if (reciter) return reciter;
  // }
  // return RECITERS[0];
};


// حفظ المؤذن المختار
export const setSelectedReciter = (id: string) => {
  const reciter = RECITERS.find((r) => r.id === id);
  if (reciter) {
    localStorage.setItem("selectedReciter", id);
    return reciter;
  }
  return null;
};
