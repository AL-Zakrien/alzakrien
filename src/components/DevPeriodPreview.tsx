import { useEffect, useRef, useState } from "react";
import { usePrayerPeriod } from "@/context/PrayerPeriodContext";
import type { PrayerPeriod } from "@/lib/prayerPeriod";

// ───────────────────────────────────────────────────────────────
//  DevPeriodPreview
//
//  Dev-only floating control that lets the project owner manually
//  override the "current prayer period" used by the aurora color
//  system (via PrayerPeriodContext.effectivePeriod) and the Next
//  Prayer widget's icon/accent/name (which reads devOverride from
//  the same context). Selecting "Live" clears the override.
//
//  Vite's `import.meta.env.DEV` is constant-folded to `false` in
//  production builds, so the entire component is dead-code-eliminated
//  and never reaches the bundle — the floating UI only exists in
//  `npm run dev` / `vite preview` of a dev build.
// ───────────────────────────────────────────────────────────────

interface PeriodOption {
  value: PrayerPeriod | null;
  label: string;
  /** Hex tint shown as a small dot so each period is visually distinct. */
  swatch: string;
}

const OPTIONS: PeriodOption[] = [
  { value: null, label: "Live — الوقت الفعلي", swatch: "#94a3b8" },
  { value: "fajr", label: "الفجر", swatch: "#6366f1" },
  { value: "sunrise", label: "الشروق", swatch: "#f59e0b" },
  { value: "zuhr", label: "الظهر", swatch: "#38bdf8" },
  { value: "asr", label: "العصر", swatch: "#fbbf24" },
  { value: "maghrib", label: "المغرب", swatch: "#f97316" },
  { value: "isha", label: "العشاء", swatch: "#a855f7" },
];

function isDev(): boolean {
  // import.meta.env.DEV is `true` only in `vite dev`. Production
  // builds replace it with `false` at compile time, so this branch
  // is fully tree-shaken out of the production bundle.
  return import.meta.env.DEV;
}

export function DevPeriodPreview() {
  const { devOverride, setDevOverride } = usePrayerPeriod();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the menu on outside-click / Escape — standard a11y.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!isDev()) return null;

  const active = OPTIONS.find((o) => o.value === devOverride) ?? OPTIONS[0];

  return (
    <div
      ref={containerRef}
      // Fixed bottom-right; z-50 to sit above the aurora bg.
      // English LTR so the panel opens to the left (works on RTL pages too).
      dir="ltr"
      className="fixed bottom-4 right-4 z-50 select-none"
    >
      {open && (
        <div
          role="menu"
          aria-label="Dev period preview"
          className="mb-2 min-w-[200px] rounded-2xl border border-white/15 bg-slate-900/80 p-1.5 text-white shadow-2xl backdrop-blur-xl ring-1 ring-white/10"
        >
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/50">
            Dev · معاينة الفترة
          </div>
          {OPTIONS.map((opt) => {
            const isActive = opt.value === devOverride;
            return (
              <button
                key={opt.label}
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  setDevOverride(opt.value);
                  setOpen(false);
                }}
                className={[
                  "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-right text-sm transition-colors",
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/85 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <span
                  className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full ring-1 ring-white/20"
                  style={{ background: opt.swatch }}
                  aria-hidden="true"
                />
                <span className="flex-1 text-right" dir="rtl">
                  {opt.label}
                </span>
                {isActive && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    on
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Dev: override current prayer period"
        className={[
          "flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-xl transition-colors",
          devOverride
            ? "border-amber-300/50 bg-amber-500/20 text-amber-100 ring-1 ring-amber-300/30"
            : "border-white/15 bg-slate-900/70 text-white/80 ring-1 ring-white/10 hover:bg-slate-900/85",
        ].join(" ")}
      >
        <span
          className="inline-block h-2 w-2 rounded-full ring-1 ring-white/30"
          style={{ background: active.swatch }}
          aria-hidden="true"
        />
        <span>Dev · {active.value ? active.label : "Live"}</span>
      </button>
    </div>
  );
}

export default DevPeriodPreview;
