import { useState, useEffect, useRef } from 'react';
import { X, Volume2 } from 'lucide-react';

interface AdhanPhrase {
  text: string;
  start: number;
  end: number;
}

interface Muezzin {
  id: string;
  name: string;
  audioUrl: string;
  phrases: AdhanPhrase[];
}

// تعريف بيانات المؤذنين
const MUEZZINS: Muezzin[] = [
  {
    id: "default",
    name: "المؤذن الافتراضي",
    audioUrl: "https://www.islamcan.com/audio/adhan/azan1.mp3",
    phrases: [
      { text: "الله أكبر الله أكبر", start: 0, end: 9 },
      { text: "الله أكبر الله أكبر", start: 9, end: 19 },
      { text: "أشهد أن لا إله إلا الله", start: 19, end: 29.5 },
      { text: "أشهد أن لا إله إلا الله", start: 29.5, end: 42 },
      { text: "أشهد أن محمداً رسول الله", start: 42, end: 56.5 },
      { text: "أشهد أن محمداً رسول الله", start: 56.5, end: 66 }, // تم تقليل 2 ثانية من هنا
      { text: "حيّ على الصلاة", start: 66, end: 79.5 }, // تم تقليل 2 ثانية من هنا
      { text: "حيّ على الصلاة", start: 79.5, end: 92 }, // تم تقليل 3 ثانية من هنا
      { text: "حيّ على الفلاح", start: 92, end: 105.5 }, // تم تقليل 3 ثانية من هنا
      { text: "حيّ على الفلاح", start: 104.5, end: 118 }, // تم تقليل 4 ثانية من هنا
      { text: "الله أكبر الله أكبر", start: 119, end: 127.5 }, // تم تقليل 3 ثانية من هنا
      { text: "لا إله إلا الله", start: 127.5, end: 145 } // تم تقليل 3 ثانية من هنا
    ]
  },
  {
    id: "mishary",
    name: "مشاري بن راشد العفاسي",
    audioUrl: "https://media.assabile.com/assabile/adhan_3435370/651e00a18442.mp3",
    phrases: [
      { text: "الله أكبر الله أكبر", start: 0, end: 16.5 },
      { text: "الله أكبر الله أكبر", start: 16.5, end: 27 },
      { text: "أشهد أن لا إله إلا الله", start: 27, end: 37.5 },
      { text: "أشهد أن لا إله إلا الله", start: 37.5, end: 48 },
      { text: "أشهد أن محمداً رسول الله", start: 48, end: 58.5 },
      { text: "أشهد أن محمداً رسول الله", start: 58.5, end: 67 }, // تم تقليل 2 ثانية من هنا
      { text: "حيّ على الصلاة", start: 67, end: 77.5 }, // تم تقليل 2 ثانية من هنا
      { text: "حيّ على الصلاة", start: 77.5, end: 89 }, // تم تقليل 3 ثانية من هنا
      { text: "حيّ على الفلاح", start: 89, end: 98.5 }, // تم تقليل 3 ثانية من هنا
      { text: "حيّ على الفلاح", start: 97.5, end: 110 }, // تم تقليل 4 ثانية من هنا
      { text: "الله أكبر الله أكبر", start: 111, end: 114.5 }, // تم تقليل 3 ثانية من هنا
      { text: "لا إله إلا الله", start: 114.5, end: 117 } // تم تقليل 3 ثانية من هنا
    ]
  }
];

const ADHAN_GROUPS = [
  [0, 1],
  [2, 3],
  [4, 5],
  [6, 7],
  [8, 9],
  [10, 11]
];

export function ActiveAdhan() {
  const [isActive, setIsActive] = useState(false);
  const [prayerName, setPrayerName] = useState("");
  const [activePhraseIndex, setActivePhraseIndex] = useState(-1);
  const [currentMuezzin, setCurrentMuezzin] = useState<Muezzin>(MUEZZINS[0]); // افتراضيًا المؤذن الافتراضي
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handlePlayAdhan = (e: any) => {
      setPrayerName(e.detail.prayerName);
      // يمكننا هنا تحديد المؤذن بناءً على إعدادات المستخدم أو اختيار افتراضي
      // حاليًا، نستخدم المؤذن الافتراضي (أذان 1)
      setCurrentMuezzin(MUEZZINS[0]); 
      setIsActive(true);
      setActivePhraseIndex(0);
      
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.warn("Autoplay prevented by browser:", err);
          });
        }
      }, 500);
    };

    window.addEventListener('play-adhan', handlePlayAdhan);
    return () => window.removeEventListener('play-adhan', handlePlayAdhan);
  }, []);

  const handleTimeUpdate = () => {
    if (!audioRef.current || !currentMuezzin) return;
    const time = audioRef.current.currentTime;
    const index = currentMuezzin.phrases.findIndex(p => time >= p.start && time < p.end);
    if (index !== -1 && index !== activePhraseIndex) {
      setActivePhraseIndex(index);
    }
  };

  const closeAdhan = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsActive(false);
    setActivePhraseIndex(-1);
  };

  if (!isActive) return null;

  const activeGroupIndex = Math.max(0, ADHAN_GROUPS.findIndex(g => g.includes(activePhraseIndex)));

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center p-6 animate-fade-in">
      <button 
        onClick={closeAdhan}
        className="absolute top-8 right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors z-50"
      >
        <X className="h-6 w-6" />
      </button>

      {/* رفع المحتوى للأعلى عن طريق تعديل الهوامش (mt-8 بدلاً من mt-12، و mb-8 بدلاً من mb-12) */}
      <div className="text-center mb-8 animate-slide-down z-10 mt-8">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-amber-500/20 mb-4">
          <Volume2 className="h-8 w-8 text-amber-400 animate-pulse" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-amber-500 mb-2 font-serif">
          أذان صلاة {prayerName}
        </h2>
        <p className="text-slate-400 text-sm">استمع وردد خلف المؤذن</p>
      </div>

      {/* رفع النصوص للأعلى باستخدام pt-12 (padding-top) و items-start */}
      <div className="relative flex items-start pt-12 justify-center flex-1 w-full max-w-6xl dir-rtl">
        {ADHAN_GROUPS.map((group, groupIndex) => {
          const isCurrentGroup = groupIndex === activeGroupIndex;
          const isPastGroup = groupIndex === activeGroupIndex - 1; // فقط المجموعة السابقة
          
          return (
            <div
              key={groupIndex}
              className={`
                absolute w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 transition-all duration-300 ease-in-out transform
                ${isCurrentGroup 
                  ? "opacity-100 translate-y-0 scale-100" 
                  : isPastGroup 
                    ? "opacity-0 -translate-y-2 scale-99" 
                    : "opacity-0 translate-y-2 scale-99"}
              `}
              style={{ pointerEvents: isCurrentGroup ? 'auto' : 'none' }}
            >
              {group.map(phraseIndex => {
                const phrase = currentMuezzin.phrases[phraseIndex];
                const isCurrent = phraseIndex === activePhraseIndex;
                const isPast = phraseIndex < activePhraseIndex;
                
                return (
                  <span 
                    key={phraseIndex}
                    className={`
                      block font-serif font-bold text-center transition-all duration-200
                      ${isCurrent 
                        ? "text-amber-400 text-4xl md:text-5xl lg:text-6xl scale-110 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]" 
                        : isPast
                          ? "text-amber-500/80 text-3xl md:text-4xl lg:text-5xl scale-100 drop-shadow-md"
                          : "text-slate-500/40 text-3xl md:text-4xl lg:text-5xl scale-95"}
                    `}
                  >
                    {phrase.text}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      <audio
        ref={audioRef}
        src={currentMuezzin.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={closeAdhan}
        className="hidden"
      />
    </div>
  );
}