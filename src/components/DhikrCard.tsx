import { useState, useCallback, useRef, memo, useMemo } from "react";
import { Check, ChevronDown, ChevronUp, RefreshCw, Share2, BookOpen, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Dhikr } from "@/data/athkar";
import { useFavorites } from "@/context/FavoritesContext";
import { useTashkeel, removeTashkeel } from "@/context/TashkeelContext";
import { motion } from "framer-motion";
import { tap_icon, spring_snappy } from "@/lib/motion";

interface DhikrCardProps {
  dhikr: Dhikr;
  index: number;
  initialOpen?: boolean;
  fontSize?: number;
}

interface Particle {
  id: number;
  tx: string;
  ty: string;
  color: string;
}

// دالة مساعدة لتحويل اسم السورة إلى رقمها
const getSurahNumber = (surahName: string): number => {
  const surahs: Record<string, number> = {
    "الفاتحة": 1, "البقرة": 2, "آل عمران": 3, "النساء": 4, "المائدة": 5,
    "الأنعام": 6, "الأعراف": 7, "الأنفال": 8, "التوبة": 9, "يونس": 10,
    "هود": 11, "يوسف": 12, "الرعد": 13, "إبراهيم": 14, "الحجر": 15,
    "النحل": 16, "الإسراء": 17, "الكهف": 18, "مريم": 19, "طه": 20,
    "الأنبياء": 21, "الحج": 22, "المؤمنون": 23, "النور": 24, "الفرقان": 25,
    "الشعراء": 26, "النمل": 27, "القصص": 28, "العنكبوت": 29, "الروم": 30,
    "لقمان": 31, "السجدة": 32, "الأحزاب": 33, "سبأ": 34, "فاطر": 35,
    "يس": 36, "الصافات": 37, "ص": 38, "الزمر": 39, "غافر": 40,
    "فصلت": 41, "الشورى": 42, "الزخرف": 43, "الدخان": 44, "الجاثية": 45,
    "الأحقاف": 46, "محمد": 47, "الفتح": 48, "الحجرات": 49, "ق": 50,
    "الذاريات": 51, "الطور": 52, "النجم": 53, "القمر": 54, "الرحمن": 55,
    "الواقعة": 56, "الحديد": 57, "المجادلة": 58, "الحشر": 59, "الممتحنة": 60,
    "الصف": 61, "الجمعة": 62, "المنافقون": 63, "التغابن": 64, "الطلاق": 65,
    "التحريم": 66, "الملك": 67, "القلم": 68, "الحاقة": 69, "المعارج": 70,
    "نوح": 71, "الجن": 72, "المزمل": 73, "المدثر": 74, "القيامة": 75,
    "الإنسان": 76, "المرسلات": 77, "النبأ": 78, "النازعات": 79, "عبس": 80,
    "التكوير": 81, "الإنفطار": 82, "المطففين": 83, "الانشقاق": 84, "البروج": 85,
    "الطارق": 86, "الأعلى": 87, "الغاشية": 88, "الفجر": 89, "البلد": 90,
    "الشمس": 91, "الليل": 92, "الضحى": 93, "الشرح": 94, "التين": 95,
    "العلق": 96, "القدر": 97, "البينة": 98, "الزلزلة": 99, "العاديات": 100,
    "القارعة": 101, "التكاثر": 102, "العصر": 103, "الهمزة": 104, "الفيل": 105,
    "قريش": 106, "الماعون": 107, "الكوثر": 108, "الكافرون": 109, "النصر": 110,
    "المسد": 111, "الإخلاص": 112, "الفلق": 113, "الناس": 114
  };
  return surahs[surahName] || 1;
};

// دالة لإنشاء رابط القرآن الكريم وفتح الآية أو نطاق السور مباشرة
const QURAN_BASE_URL = "https://quran.com/ar";
const QURAN_READING_MODE = "verse-by-verse";

type QuranReference = {
  surah: string;
  startAyah: number;
  endAyah?: number;
};

const buildQuranUrl = (path: string): string => {
  const encodedPath = encodeURIComponent(path);
  return `${QURAN_BASE_URL}/${encodedPath}?readingMode=${QURAN_READING_MODE}`;
};

const isConsecutiveReferences = (refs: QuranReference[]): boolean =>
  refs.every((ref, index) => {
    if (index === 0) return true;
    return getSurahNumber(ref.surah) === getSurahNumber(refs[index - 1].surah) + 1;
  });

const getQuranReferencePath = (ref: QuranReference): string => {
  const surahNum = getSurahNumber(ref.surah);
  const endAyah = ref.endAyah || ref.startAyah;

  if (endAyah !== ref.startAyah) {
    return `${surahNum}:${ref.startAyah}-${surahNum}:${endAyah}`;
  }

  return `${surahNum}:${ref.startAyah}`;
};

const generateQuranLinks = (references: QuranReference | QuranReference[]): Array<{ label: string; href: string }> => {
  const refs = Array.isArray(references) ? references : [references];
  const firstRef = refs[0];
  const lastRef = refs[refs.length - 1];
  const firstSurahNum = getSurahNumber(firstRef.surah);
  const lastSurahNum = getSurahNumber(lastRef.surah);
  const lastAyah = lastRef.endAyah || lastRef.startAyah;

  if (refs.length > 1 && isConsecutiveReferences(refs)) {
    return [{
      label: "اقرأ من المصحف",
      href: buildQuranUrl(`${firstSurahNum}:${firstRef.startAyah}-${lastSurahNum}:${lastAyah}`),
    }];
  }

  return refs.map((ref) => ({
    label: refs.length > 1 ? `اقرأ سورة ${ref.surah}` : "اقرأ من المصحف",
    href: buildQuranUrl(getQuranReferencePath(ref)),
  }));
};

export const DhikrCard = memo(({ dhikr, index, initialOpen = false, fontSize }: DhikrCardProps) => {
  const [count, setCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(!dhikr.title || initialOpen);
  const [animating, setAnimating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [copied, setCopied] = useState(false);
  const [shareAnimating, setShareAnimating] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationExpanded, setExplanationExpanded] = useState(false);
  const particleId = useRef(0);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showTashkeel, toggleTashkeel } = useTashkeel();
  
  // استخدام useMemo لتجنب إعادة حساب الحالة في كل رندر
  const favorite = isFavorite(dhikr.id);
  const target = dhikr.repeat ?? 1;

  const displayText = useMemo(
    () => showTashkeel ? dhikr.text : removeTashkeel(dhikr.text),
    [showTashkeel, dhikr.text]
  );
  const isComplete = count >= target;
  const progress = Math.min((count / target) * 100, 100);

  const spawnParticles = useCallback(() => {
    const colors = [
      "#FFD700", // Gold
      "#4CAF50", // Green
      "#FF9800", // Orange
      "#2196F3", // Blue
    ];
    const newParticles: Particle[] = Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * 360;
      const dist = 50 + Math.random() * 40;
      const tx = `${Math.round(Math.cos((angle * Math.PI) / 180) * dist)}px`;
      const ty = `${Math.round(Math.sin((angle * Math.PI) / 180) * dist)}px`;
      return {
        id: particleId.current++,
        tx,
        ty,
        color: colors[i % colors.length],
      };
    });
    setParticles(newParticles);
    // تنظيف الجزيئات بسرعة للحفاظ على الذاكرة
    setTimeout(() => setParticles([]), 600);
  }, []);

  const increment = useCallback(() => {
    if (isComplete) return;
    
    // Haptic Feedback لجودة أعلى على الجوال
    if (window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }

    setCount((prev) => {
      const next = prev + 1;
      if (next >= target) {
        setCompleting(true);
        spawnParticles();
        setTimeout(() => setCompleting(false), 600);
      }
      return next;
    });

    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
  }, [isComplete, target, spawnParticles]);

  const reset = useCallback(() => {
    setCount(0);
    setCompleting(false);
  }, []);

  const handleShare = useCallback(async () => {
    const text = dhikr.text.replace(/[﴿﴾]/g, "");
    setShareAnimating(true);
    setTimeout(() => setShareAnimating(false), 600);
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [dhikr.text]);

  const delayClass = useMemo(() => [
    "stagger-1","stagger-2","stagger-3",
    "stagger-4","stagger-5","stagger-6",
  ][Math.min(index, 5)], [index]);

  const actionButtons = (
    <div className="flex items-center gap-1">
      <motion.div whileTap={tap_icon} transition={spring_snappy} style={{ borderRadius: 'var(--radius-sm)' }}>
        <Button
          variant="ghost"
          size="icon"
          className={`h-10 w-10 text-muted-foreground/60 hover:text-primary hover:bg-primary/8 rounded-[10px] transition-colors transform-gpu ${shareAnimating ? "share-fly" : ""}`}
          onClick={handleShare}
          data-testid={`button-share-${dhikr.id}`}
          aria-label="مشاركة"
        >
          {copied
            ? <Check className="h-3.5 w-3.5 text-primary" />
            : <Share2 className={`h-3.5 w-3.5 ${shareAnimating ? "share-icon-anim" : ""}`} />}
        </Button>
      </motion.div>

      {(dhikr.benefit || dhikr.explanation) && (
        <motion.div whileTap={tap_icon} transition={spring_snappy} style={{ borderRadius: 'var(--radius-sm)' }}>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-muted-foreground/60 hover:text-accent hover:bg-accent/8 rounded-[10px] transition-colors transform-gpu"
            onClick={() => setExpanded(!expanded)}
            data-testid={`button-expand-${dhikr.id}`}
            aria-label={dhikr.benefit ? "الفضل" : "الشرح"}
          >
            {expanded
              ? <ChevronUp className="h-3.5 w-3.5" />
              : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </motion.div>
      )}

      <motion.div whileTap={tap_icon} transition={spring_snappy} style={{ borderRadius: 'var(--radius-sm)' }}>
        <Button
          variant="ghost"
          size="icon"
          className={`h-10 w-10 rounded-[10px] transition-colors transform-gpu ${
            favorite
              ? "text-accent hover:text-accent hover:bg-accent/15"
              : "text-muted-foreground/60 hover:text-accent hover:bg-accent/8"
          }`}
          onClick={() => toggleFavorite(dhikr.id)}
          data-testid={`button-favorite-${dhikr.id}`}
          aria-label={favorite ? "إزالة من المحفوظات" : "إضافة إلى المحفوظات"}
        >
          <Star className={`h-3.5 w-3.5 ${favorite ? "fill-accent" : ""}`} />
        </Button>
      </motion.div>
    </div>
  );

  const benefitSection = expanded && (dhikr.benefit || dhikr.explanation) && (
    <div className="mt-3 expand-down transform-gpu">
      <div className="p-3 bg-amber-50/80 dark:bg-amber-500/8 rounded-lg border border-amber-200/50 dark:border-amber-500/15 text-right shadow-inner">
        {dhikr.benefit && (
          <p className="text-[13px] text-amber-900/80 dark:text-amber-200/80 arabic-text leading-relaxed">
            {dhikr.benefit}
          </p>
        )}
        {dhikr.explanation && (
          <>
            {dhikr.benefit && <div className="mt-2.5" />}
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-primary/70 hover:text-primary transition-colors mr-auto"
              data-testid={`button-explanation-${dhikr.id}`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>{showExplanation ? "إخفاء الشرح" : "شرح الذكر"}</span>
            </button>
            {showExplanation && (
              <div className="mt-2 pt-2 border-t border-amber-200/40 dark:border-amber-500/10 expand-down transform-gpu">
                <div className={`relative ${!explanationExpanded ? "explanation-collapsed" : ""}`}>
                  <p className="text-[12.5px] text-amber-800/70 dark:text-amber-200/60 arabic-text leading-[2] text-justify">
                    {dhikr.explanation}
                  </p>
                  {!explanationExpanded && (
                    <div className="explanation-fade" />
                  )}
                </div>
                <button
                  onClick={() => setExplanationExpanded(!explanationExpanded)}
                  className="mt-2 w-full py-1.5 rounded-lg text-[11px] font-semibold text-primary/80 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1"
                >
                  <span>{explanationExpanded ? "عرض أقل ▲" : "اقرأ المزيد ▼"}</span>
                </button>
              </div>
            )}
          </>
        )}
        {dhikr.quranicReference && (
          <div className="mt-2.5 pt-2.5 border-t border-amber-200/40 dark:border-amber-500/10 flex flex-wrap gap-2">
            {generateQuranLinks(dhikr.quranicReference).map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50/60 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-lg hover:bg-blue-100/60 dark:hover:bg-blue-500/15 transition-all text-[11px] font-semibold text-blue-700 dark:text-blue-300"
              >
                <span>{link.label}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const counterSection = dhikr.repeat && dhikr.repeat > 1 ? (
    <div className="mt-5">
      <div className="relative flex flex-col items-center gap-3">
        {particles.map((p) => (
          <span
            key={p.id}
            className="particle transform-gpu"
            style={{
              "--tx": p.tx,
              "--ty": p.ty,
              background: p.color,
              top: "50%",
              left: "50%",
              marginTop: "-3px",
              marginLeft: "-3px",
              willChange: "transform, opacity"
            } as React.CSSProperties}
          />
        ))}
        <button
          onClick={increment}
          disabled={isComplete}
          className={`w-full h-12 rounded-xl flex items-center justify-center gap-3 transition-all select-none transform-gpu will-change-transform ${
            isComplete
              ? "bg-primary/8 border border-primary/15 cursor-default"
              : "bg-amber-50/80 dark:bg-amber-500/8 border border-amber-200/50 dark:border-amber-500/15 hover:bg-amber-100/80 dark:hover:bg-amber-500/12 active:scale-[0.97]"
          } ${animating ? "count-pulse" : ""} ${completing ? "complete-bounce" : ""}`}
          data-testid={`button-count-${dhikr.id}`}
          aria-label="عدّ"
        >
          {isComplete ? (
            <div className="flex items-center gap-2 text-primary font-bold">
              <Check className="h-5 w-5" />
              <span className="text-sm">تم الذكر</span>
            </div>
          ) : (
            <span className="text-lg font-mono font-bold tabular-nums tracking-wider text-foreground/80 drop-shadow-sm">
              {count} <span className="text-xs opacity-40 mx-1">/</span> {target}
            </span>
          )}
        </button>
        {count > 0 && !isComplete && (
          <button
            onClick={reset}
            className="text-[11px] text-muted-foreground/40 hover:text-destructive transition-colors flex items-center gap-1"
            data-testid={`button-reset-${dhikr.id}`}
            aria-label="إعادة"
          >
            <RefreshCw className="h-3 w-3" />
            <span>إعادة البدء</span>
          </button>
        )}
      </div>
    </div>
  ) : (
    <div className="flex justify-end mt-4">
      <button
        onClick={() => setCount((c) => (c > 0 ? 0 : 1))}
        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 border transform-gpu ${
          count > 0
            ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
            : "bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-primary active:scale-95"
        }`}
        data-testid={`button-done-${dhikr.id}`}
        aria-label="تم"
      >
        {count > 0 ? "مكتمل" : "تحديد كمكتمل"}
      </button>
    </div>
  );

  const dhikrTextBlock = (
    <div className="dhikr-text-frame relative my-3 transform-gpu">
      <p
        className="font-athkar arabic-text text-xl text-foreground leading-[2.4] text-center whitespace-pre-line px-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
        style={fontSize ? { fontSize: `${fontSize}px` } : { fontSize: '1.25rem' }}
        data-testid={`text-dhikr-${dhikr.id}`}
      >
        {displayText}
      </p>
    </div>
  );

  const progressBar = (
    <div className="dhikr-progress-track overflow-hidden bg-muted/30">
      <div
        className={`h-full transition-all duration-700 ease-out transform-gpu will-change-transform ${
          isComplete ? "progress-complete" : progress > 0 ? "progress-shimmer" : ""
        }`}
        style={{ width: `${progress}%`, translateZ: 0 }}
      />
    </div>
  );

  return (
    <div
      id={`dhikr-${dhikr.id}`}
      className={`dhikr-card dhikr-card-islamic fade-in-up transform-gpu will-change-transform ${delayClass} ${isComplete ? "dhikr-card-complete opacity-90 shadow-none scale-[0.99]" : "dhikr-card-hover"}`}
      data-testid={`card-dhikr-${dhikr.id}`}
      style={{ backfaceVisibility: 'hidden' }}
    >
      {progressBar}

      {dhikr.title ? (
        <>
          <div
            onClick={() => setOpen(!open)}
            className="w-full px-5 py-4 flex items-center justify-between gap-3 text-right transition-colors cursor-pointer group select-none"
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {isComplete ? (
                <div className={`dhikr-number-badge dhikr-number-done scale-110 shadow-sm ${completing ? "complete-bounce" : ""}`}>
                  <Check className="h-3.5 w-3.5" />
                </div>
              ) : (
                <div className="dhikr-number-badge group-hover:bg-primary group-hover:text-primary-foreground transition-colors">{index + 1}</div>
              )}
              <span className="font-bold text-foreground/90 text-[15px] arabic-text leading-relaxed group-hover:text-primary transition-colors truncate">
                {dhikr.title}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <motion.div whileTap={tap_icon} transition={spring_snappy} style={{ borderRadius: 'var(--radius-sm)' }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 rounded-[10px] transition-colors transform-gpu ${
                    favorite
                      ? "text-accent hover:text-accent hover:bg-accent/15"
                      : "text-muted-foreground/60 hover:text-accent hover:bg-accent/8"
                  }`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleFavorite(dhikr.id);
                  }}
                  data-testid={`button-favorite-header-${dhikr.id}`}
                  aria-label={favorite ? "إزالة من المحفوظات" : "إضافة إلى المحفوظات"}
                >
                  <Star className={`h-3.5 w-3.5 ${favorite ? "fill-accent" : ""}`} />
                </Button>
              </motion.div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground/50 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
            </div>
          </div>

          {open && (
            <div className="card-reveal transform-gpu">
              <div className="px-5 pb-5">
                <div className="ornamental-divider mb-3 opacity-30" />
                <div className="flex items-center justify-end gap-1 mb-1">
                  {actionButtons}
                </div>
                {dhikr.translation && (
                  <p className="text-xs text-accent font-medium text-right mb-2 arabic-text opacity-90">
                    {dhikr.translation}
                  </p>
                )}
                {dhikrTextBlock}
                {benefitSection}
                {counterSection}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="px-5 py-5 transform-gpu">
          <div className="flex items-start justify-between mb-2 gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              {isComplete ? (
                <div className={`dhikr-number-badge dhikr-number-done scale-110 shadow-sm ${completing ? "complete-bounce" : ""}`}>
                  <Check className="h-3.5 w-3.5" />
                </div>
              ) : (
                <div className="dhikr-number-badge">{index + 1}</div>
              )}
              {dhikr.repeat && dhikr.repeat > 1 && (
                <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                  {dhikr.repeat} مرات
                </span>
              )}
            </div>
            {actionButtons}
          </div>
          {dhikr.translation && (
            <p className="text-xs text-accent font-medium text-right mb-1 arabic-text opacity-90">
              {dhikr.translation}
            </p>
          )}
          {dhikrTextBlock}
          {benefitSection}
          {counterSection}
        </div>
      )}
    </div>
  );
});

DhikrCard.displayName = "DhikrCard";
