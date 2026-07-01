import { useState, useCallback, useRef, useEffect } from "react";
import { RotateCcw, Settings, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TASBIH_OPTIONS = [
  { label: "سبحان اللَّهِ", value: "subhanallah" },
  { label: "الحمد للَّهِ", value: "alhamdulillah" },
  { label: "اللَّهُ أكبر", value: "allahuakbar" },
  { label: "لا إله إلا اللَّهُ", value: "lailahaillallah" },
  { label: "استغفر اللَّهَ", value: "astaghfirullah" },
  { label: "لا حول ولا قوة إلا باللَّهِ", value: "lahaola" },
  { label: "اللَّهُمَّ صلِّ على نبينا محمد", value: "salawat" },
  { label: "ذكرك الخاص", value: "custom" },
];

const MAX_COUNTS = [33, 50, 100, 300];

const DHIKR_REMINDERS = [
  {
    text: "قال ﷺ: كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي المِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللهِ وَبِحَمْدِهِ، سُبْحَانَ اللهِ العَظِيمِ.",
    benefit: "فضل الذكر: ثقيل في الميزان وحبيب إلى الرحمن.",
    source: "الدرر السنية — صحيح البخاري (6406)، صحيح مسلم (2694)",
  },
  {
    text: "قال ﷺ: لَأَنْ أَقُولَ: سُبْحَانَ اللهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللهُ، وَاللهُ أَكْبَرُ؛ أَحَبُّ إِلَيَّ مِمَّا طَلَعَتْ عَلَيْهِ الشَّمْسُ.",
    benefit: "فضل الذكر: أحب من الدنيا وما فيها.",
    source: "الدرر السنية — صحيح مسلم (2695)",
  },
  {
    text: "قال ﷺ: مَنْ قَالَ: سُبْحَانَ اللهِ وَبِحَمْدِهِ، فِي يَوْمٍ مِائَةَ مَرَّةٍ؛ حُطَّتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ.",
    benefit: "فضل الذكر: تكفير الذنوب ورفعة الأجر.",
    source: "الدرر السنية — صحيح البخاري (6405)، صحيح مسلم (2691)",
  },
  {
    text: "قال ﷺ: مَنْ قَالَ: لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، فِي يَوْمٍ مِائَةَ مَرَّةٍ... وَلَمْ يَأْتِ أَحَدٌ بِأَفْضَلَ مِمَّا جَاءَ بِهِ، إِلَّا أَحَدٌ عَمِلَ أَكْثَرَ مِنْ ذَلِكَ.",
    benefit: "فضل الذكر: أفضل الأعمال في اليوم وحفظ من الشيطان.",
    source: "الدرر السنية — صحيح البخاري (6403)، صحيح مسلم (2691)",
  },
  {
    text: "قال ﷺ: سَبَقَ المُفَرِّدُونَ. قَالُوا: وَمَا المُفَرِّدُونَ؟ قَالَ: الذَّاكِرُونَ اللهَ كَثِيرًا وَالذَّاكِرَاتُ.",
    benefit: "فضل الذكر: سبق عند الله ورفعة المنزلة.",
    source: "الدرر السنية — صحيح مسلم (2676)",
  },
];

interface Particle {
  id: number;
  tx: string;
  ty: string;
}

export function Tasbih() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [selectedDhikr, setSelectedDhikr] = useState("subhanallah");
  const [animating, setAnimating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [totalSessions, setTotalSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundToggleAnimating, setSoundToggleAnimating] = useState(false);
  const [customTarget, setCustomTarget] = useState<number | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputValue, setCustomInputValue] = useState("");
  const [customDhikrText, setCustomDhikrText] = useState("");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [activeReminder, setActiveReminder] = useState(0);
  const audioCtx = useRef<AudioContext | null>(null);
  const particleId = useRef(0);

  const isComplete = count >= target;
  const progress = Math.min((count / target) * 100, 100);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const playClick = useCallback(() => {
    try {
      if (!soundEnabled) return;
      if (!audioCtx.current) {
        audioCtx.current = new AudioContext();
      }
      const ctx = audioCtx.current;
      const now = ctx.currentTime;
      const click1 = ctx.createOscillator();
      const click2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();

      click1.type = "triangle";
      click2.type = "triangle";

      click1.connect(gain1);
      click2.connect(gain2);
      gain1.connect(ctx.destination);
      gain2.connect(ctx.destination);

      // Misbaha-like bead sound: two very soft wooden ticks.
      click1.frequency.setValueAtTime(720, now);
      click1.frequency.exponentialRampToValueAtTime(460, now + 0.03);
      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.exponentialRampToValueAtTime(0.03, now + 0.006);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      const secondTick = now + 0.04;
      click2.frequency.setValueAtTime(640, secondTick);
      click2.frequency.exponentialRampToValueAtTime(410, secondTick + 0.03);
      gain2.gain.setValueAtTime(0.0001, secondTick);
      gain2.gain.exponentialRampToValueAtTime(0.02, secondTick + 0.005);
      gain2.gain.exponentialRampToValueAtTime(0.0001, secondTick + 0.04);

      click1.start(now);
      click1.stop(now + 0.05);
      click2.start(secondTick);
      click2.stop(secondTick + 0.045);
    } catch {
      // Audio not available
    }
  }, [soundEnabled]);

  const spawnParticles = useCallback(() => {
    const newP: Particle[] = Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * 360;
      const dist = 60 + Math.random() * 30;
      return {
        id: particleId.current++,
        tx: `${Math.round(Math.cos((angle * Math.PI) / 180) * dist)}px`,
        ty: `${Math.round(Math.sin((angle * Math.PI) / 180) * dist)}px`,
      };
    });
    setParticles(newP);
    setTimeout(() => setParticles([]), 700);
  }, []);

  const increment = useCallback(() => {
    if (isComplete) {
      // Wrap around - new session
      setTotalSessions((s) => s + 1);
      setCount(0);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 400);
      return;
    }

    const next = count + 1;
    setAnimating(true);
    setCount(next);
    playClick();
    setTimeout(() => setAnimating(false), 350);

    if (next >= target) {
      setCompleting(true);
      spawnParticles();
      setTimeout(() => setCompleting(false), 800);
    }
  }, [isComplete, count, target, playClick, spawnParticles]);

  const reset = useCallback(() => {
    setCount(0);
    setTotalSessions(0);
    setCompleting(false);
  }, []);

  const currentDhikr = TASBIH_OPTIONS.find((o) => o.value === selectedDhikr);
  const displayedDhikr =
    selectedDhikr === "custom"
      ? (customDhikrText.trim() || "ذكرك الخاص")
      : (currentDhikr?.label || "");
  const reminder = DHIKR_REMINDERS[activeReminder];

  useEffect(() => {
    let timeoutId: number;
    const rotate = () => {
      const delay = 7000 + Math.floor(Math.random() * 8000); // 7-15 seconds
      timeoutId = window.setTimeout(() => {
        setActiveReminder((prev) => {
          if (DHIKR_REMINDERS.length <= 1) return prev;
          let next = prev;
          while (next === prev) {
            next = Math.floor(Math.random() * DHIKR_REMINDERS.length);
          }
          return next;
        });
        rotate();
      }, delay);
    };
    rotate();

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="islamic-pattern min-h-screen flex flex-col items-center justify-start py-8 px-4">
      <div className="w-full max-w-sm">

        {/* Title */}
        <div className="text-right mb-5 fade-in-up stagger-1">
          <h1
            className="font-serif text-2xl font-bold gradient-text mb-1"
            data-testid="text-tasbih-title"
          >
            المسبحة الإلكترونية
          </h1>
          <p className="text-sm text-muted-foreground">اضغط للتسبيح وذكر الله</p>
        </div>

        {/* هدفي اليوم */}
        <div className="bg-card border border-card-border rounded-2xl p-4 mb-5 fade-in-up stagger-2">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              data-testid="button-tasbih-settings"
            >
              {showSettings ? <X className="h-3 w-3" /> : <Settings className="h-3 w-3" />}
              {showSettings ? "إغلاق" : "تغيير الذكر"}
            </button>
            <h3 className="text-sm font-bold text-foreground">هدفي اليوم</h3>
          </div>

          <div className="flex justify-end mb-3">
            <button
              onClick={() => {
                setSoundEnabled((s) => !s);
                setSoundToggleAnimating(true);
                setTimeout(() => setSoundToggleAnimating(false), 240);
              }}
              className={`text-xs text-muted-foreground hover:text-primary transition-all duration-200 flex items-center gap-1 ${
                soundToggleAnimating ? "scale-105 text-primary" : ""
              }`}
              data-testid="button-tasbih-sound-toggle"
              aria-label={soundEnabled ? "إيقاف صوت الضغط" : "تشغيل صوت الضغط"}
            >
              {soundEnabled ? (
                <Volume2
                  className={`h-3 w-3 transition-transform duration-200 ${
                    soundToggleAnimating ? "rotate-6 scale-110" : ""
                  }`}
                />
              ) : (
                <VolumeX
                  className={`h-3 w-3 transition-transform duration-200 ${
                    soundToggleAnimating ? "-rotate-6 scale-110" : ""
                  }`}
                />
              )}
              {soundEnabled ? "إيقاف صوت الضغط" : "تشغيل صوت الضغط"}
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {MAX_COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => { setCustomTarget(null); setTarget(n); setCount(0); setTotalSessions(0); }}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                  target === n && customTarget === null
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
                data-testid={`button-target-${n}`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => {
                setShowCustomInput((s) => !s);
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                showCustomInput || customTarget !== null
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
              data-testid="button-target-custom"
            >
              {customTarget !== null ? customTarget : "تخصيص"}
            </button>
          </div>

          {showCustomInput && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={10000}
                value={customInputValue}
                onChange={(e) => setCustomInputValue(e.target.value)}
                placeholder="اكتب العدد"
                className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                data-testid="input-custom-target"
              />
              <Button
                size="sm"
                onClick={() => {
                  const parsed = Number(customInputValue);
                  if (!Number.isFinite(parsed) || parsed <= 0) return;
                  const num = Math.min(Math.floor(parsed), 10000);
                  setCustomTarget(num);
                  setTarget(num);
                  setCount(0);
                  setTotalSessions(0);
                  setShowCustomInput(false);
                  setCustomInputValue("");
                }}
                data-testid="button-apply-custom-target"
              >
                تأكيد
              </Button>
            </div>
          )}

          {showSettings && (
            <div className="mt-3 pt-3 border-t border-muted">
              <Select
                value={selectedDhikr}
                onValueChange={(v) => { setSelectedDhikr(v); setCount(0); setTotalSessions(0); }}
              >
                <SelectTrigger className="w-full text-right" data-testid="select-dhikr-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASBIH_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedDhikr === "custom" && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={customDhikrText}
                    onChange={(e) => setCustomDhikrText(e.target.value)}
                    placeholder="اكتب ذكرك الخاص"
                    className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                    data-testid="input-custom-dhikr"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current dhikr label — above counter */}
        <div className="text-center mb-4 fade-in-up stagger-3" data-testid="text-current-dhikr">
          <p className="arabic-text text-2xl font-bold text-foreground" style={{ fontFamily: "'Amiri Quran', 'Amiri', serif" }}>{displayedDhikr}</p>
        </div>

        {/* Main counter area */}
        <div className="relative flex items-center justify-center mb-6 fade-in-up stagger-3">
          {isComplete && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 rounded-full pulse-ring border-4 border-primary/20" />
            </div>
          )}

          <svg className="w-56 h-56 -rotate-90 drop-shadow-sm" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(150 40% 35%)" />
                <stop offset="100%" stopColor="hsl(150 50% 45%)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="0.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" opacity="0.35" />
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={isComplete ? "hsl(var(--primary))" : "url(#progressGrad)"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300"
              filter={isComplete ? "url(#glow)" : undefined}
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {particles.map((p) => (
                <span
                  key={p.id}
                  className="particle"
                  style={{
                    "--tx": p.tx,
                    "--ty": p.ty,
                    width: "8px",
                    height: "8px",
                    top: "50%",
                    left: "50%",
                    marginTop: "-4px",
                    marginLeft: "-4px",
                    background: `hsl(var(--accent))`,
                  } as React.CSSProperties}
                />
              ))}

              <button
                onClick={increment}
                className={`w-40 h-40 rounded-full flex flex-col items-center justify-center select-none transition-transform duration-100 ease-out active:scale-95 will-change-transform relative overflow-hidden ${
                  isComplete
                    ? "shadow-lg"
                    : "shadow-md hover:shadow-lg"
                } ${completing ? "complete-bounce" : ""} ${animating && !completing ? "bead-click" : ""}`}
                style={{
                  background: isComplete
                    ? "linear-gradient(145deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))"
                    : "linear-gradient(145deg, hsl(150 40% 97%), hsl(150 30% 90%))",
                }}
                data-testid="button-tasbih-count"
                aria-label="عدّ"
              >
                <div className="absolute inset-1 rounded-full border border-primary/10" />
                <div className="absolute inset-3 rounded-full border border-primary/5" />

                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-6 rounded-full bg-white/25 blur-[1px]" />

                <span className={`text-5xl font-bold font-mono leading-none tabular-nums relative z-10 ${animating ? "count-pulse" : ""} ${isComplete ? "text-primary-foreground" : "text-primary"}`}>
                  {count}
                </span>
                <span className={`text-xs mt-2 font-medium relative z-10 ${isComplete ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {isComplete ? "✓ اكتملت" : `من ${target}`}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Sessions counter */}
        {totalSessions > 0 && (
          <div className="flex justify-between mb-4 bg-primary/10 rounded-2xl py-3 px-4 fade-in-up">
            <span className="text-sm text-primary font-semibold">
              {totalSessions} دورة مكتملة
            </span>
            <span className="text-sm text-primary font-semibold">
              إجمالي: {totalSessions * target + count} تسبيحة
            </span>
          </div>
        )}

        {/* Reset */}
        <div className="flex justify-center mb-6 fade-in-up stagger-5">
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="flex items-center gap-2"
            data-testid="button-tasbih-reset"
            disabled={count === 0 && totalSessions === 0}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            إعادة من البداية
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center fade-in-up stagger-6">
          <div className="ornamental-border mb-4 opacity-40" />
          <p key={`text-${activeReminder}`} className="arabic-text text-xs text-muted-foreground transition-all duration-300">
            {reminder.text}
          </p>
          <p key={`benefit-${activeReminder}`} className="text-[11px] text-primary/80 mt-1">
            {reminder.benefit}
          </p>
          <p key={`source-${activeReminder}`} className="text-[11px] text-muted-foreground/60 mt-0.5">
            {reminder.source}
          </p>
        </div>
      </div>
    </div>
  );
}
