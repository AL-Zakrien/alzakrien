import { usePrayerPeriod } from "@/context/PrayerPeriodContext";
import type { PrayerPeriod } from "@/lib/prayerPeriod";

const PERIODS: { key: PrayerPeriod; label: string }[] = [
  { key: "fajr", label: "Fajr" },
  { key: "sunrise", label: "Sunrise" },
  { key: "zuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
];

export function DevPeriodPreview() {
  // Only render in development
  if (!import.meta.env.DEV) return null;

  const { effectivePeriod, devOverride, setDevOverride, period } =
    usePrayerPeriod();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        left: 12,
        zIndex: 9999,
        background: "rgba(2, 6, 23, 0.7)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 14,
        padding: "8px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11,
        userSelect: "none",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 2,
          paddingInline: 2,
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          DEV
        </span>

        {devOverride && (
          <button
            type="button"
            onClick={() => setDevOverride(null)}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              color: "rgba(255,255,255,0.45)",
              fontSize: 9,
              padding: "1px 6px",
              cursor: "pointer",
              lineHeight: "16px",
            }}
          >
            Live ({period})
          </button>
        )}
      </div>

      {/* Period buttons */}
      {PERIODS.map(({ key, label }) => {
        const isActive = effectivePeriod === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setDevOverride(key === period ? null : key)}
            style={{
              background: isActive
                ? "rgba(251, 191, 36, 0.15)"
                : "rgba(255, 255, 255, 0.03)",
              border: isActive
                ? "1px solid rgba(251, 191, 36, 0.3)"
                : "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: 8,
              padding: "4px 12px",
              color: isActive
                ? "rgba(251, 191, 36, 0.9)"
                : "rgba(255, 255, 255, 0.5)",
              fontWeight: isActive ? 700 : 500,
              fontSize: 11,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
              lineHeight: "18px",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
