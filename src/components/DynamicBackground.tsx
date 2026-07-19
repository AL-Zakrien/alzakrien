import React, { useEffect, useRef } from 'react';
import { usePrayerPeriod } from '@/context/PrayerPeriodContext';
import type { PrayerPeriod } from '@/lib/prayerPeriod';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface DynamicBackgroundProps {
  children: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────
// Aurora palettes — spec §1 color mappings
// Each palette: bg (base), c1/c2/c3 (blob colors), overlay opacity
// ─────────────────────────────────────────────────────────────────
interface AuroraPalette {
  bg: string;
  c1: string;
  c2: string;
  c3: string;
  overlayOpacity: number; // 0–1, extra dark overlay for bright daytime states
}

const AURORA_PALETTES: Record<PrayerPeriod, AuroraPalette> = {
  // Fajr — Pre-dawn calm: near-black base, cool blue-gray-to-rose blobs.
  // Matches the dark-base structural pattern of all other periods;
  // dawn feeling comes from c1/c2/c3 blob movement, not the bg.
  fajr: {
    bg: '#070B19',       // Very dark midnight/navy, almost black
    c1: '#1E3A8A',       // Deep moody indigo/blue
    c2: '#4C1D95',       // Deep muted twilight purple
    c3: '#334155',       // Slate gray-blue to neutralize any neon effect
    overlayOpacity: 0.5, // Increased slightly to blend the blobs softly and reduce vibrancy
  },
  // Sunrise — Early warmth: light orange to gold
  sunrise: {
    bg: '#120a02',
    c1: '#92400e',  // amber/burnt orange
    c2: '#b45309',  // orange-amber
    c3: '#d97706',  // warm gold
    overlayOpacity: 0.42,
  },
  // Zuhr — Medium warmth: amber/burnt gold
  zuhr: {
    bg: '#0f0a02',
    c1: '#6b4226',  // deep warm brown
    c2: '#8b5e34',  // bronze
    c3: '#b8860b',  // dark goldenrod
    overlayOpacity: 0.42,
  },
  // Asr — Clarity: turquoise/light cyan
  asr: {
    bg: '#020e12',
    c1: '#0c4a6e',  // deep ocean
    c2: '#0369a1',  // sky blue
    c3: '#0891b2',  // cyan
    overlayOpacity: 0.45,
  },
  // Maghrib — Strongest: burnt coral/pink into violet
  maghrib: {
    bg: '#0e0610',
    c1: '#831843',  // deep rose
    c2: '#9d174d',  // coral-rose
    c3: '#7e22ce',  // violet
    overlayOpacity: 0.35,
  },
  // Isha — Night calm: deep navy with violet/blue shimmer
  isha: {
    bg: '#020617',
    c1: '#1e1b4b',  // deep navy-indigo
    c2: '#312e81',  // dark purple
    c3: '#1e3a8a',  // dark blue
    overlayOpacity: 0.28,
  },
};

// ─────────────────────────────────────────────────────────────────
// CSS custom property injection
// ─────────────────────────────────────────────────────────────────
function updateCSSVars(period: PrayerPeriod) {
  const palette = AURORA_PALETTES[period];
  const root = document.documentElement;
  root.style.setProperty('--aurora-bg', palette.bg);
  root.style.setProperty('--aurora-color-1', palette.c1);
  root.style.setProperty('--aurora-color-2', palette.c2);
  root.style.setProperty('--aurora-color-3', palette.c3);
}

// ─────────────────────────────────────────────────────────────────
// Aurora blob component — uses CSS animations for perf
// ─────────────────────────────────────────────────────────────────
interface BlobProps {
  color: string;
  className: string;
  animClass: string;
  duration: number;
  animate: boolean;
  style?: React.CSSProperties;
}

function AuroraBlob({ color, className, animClass, duration, animate, style }: BlobProps) {
  return (
    <div
      aria-hidden="true"
      className={`absolute rounded-full blur-[120px] opacity-55 mix-blend-screen pointer-events-none ${className}`}
      style={{
        backgroundColor: color,
        animation: animate ? `${animClass} ${duration}s ease-in-out infinite` : 'none',
        willChange: animate ? 'transform' : 'auto',
        transition: 'background-color 3s ease-in-out',
        ...style,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────
// Main DynamicBackground component
// ─────────────────────────────────────────────────────────────────
export function DynamicBackground({ children }: DynamicBackgroundProps) {
  const { effectivePeriod } = usePrayerPeriod();
  const reducedMotion = useReducedMotion();
  const animate = !reducedMotion;

  const palette = AURORA_PALETTES[effectivePeriod] || AURORA_PALETTES.isha;

  // Ref tracks previous palette for crossfade overlay
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateCSSVars(effectivePeriod);
  }, [effectivePeriod]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">

      {/* ── Fixed base background — crossfades on period change ── */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className="fixed inset-0 -z-20 pointer-events-none"
        style={{
          // `background` (not backgroundColor) so the Fajr linear-gradient
          // string renders correctly. Hex values for the other periods are
          // still valid CSS background values.
          background: palette.bg,
          transition: 'background-color 3s ease-in-out, background 3s ease-in-out',
        }}
      >
        {/* ── Aurora blob 1 — large, top-left ── */}
        <AuroraBlob
          color={palette.c1}
          className="-top-[25%] -right-[15%] w-[75vw] h-[75vh]"
          animClass="aurora-blob-1"
          duration={22}
          animate={animate}
        />

        {/* ── Aurora blob 2 — medium, center-right ── */}
        <AuroraBlob
          color={palette.c2}
          className="top-[15%] -left-[15%] w-[65vw] h-[80vh]"
          animClass="aurora-blob-2"
          duration={28}
          animate={animate}
        />

        {/* ── Aurora blob 3 — smaller, bottom center ── */}
        <AuroraBlob
          color={palette.c3}
          className="-bottom-[20%] left-[15%] w-[85vw] h-[60vh]"
          animClass="aurora-blob-3"
          duration={34}
          animate={animate}
        />

        {/* ── Grain texture overlay for depth ── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.028] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* ── Semi-transparent dark overlay — ensures WCAG AA text contrast ── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundColor: `rgba(0,0,0,${palette.overlayOpacity})`,
          transition: 'background-color 3s ease-in-out',
        }}
      />

      {/* ── Page content ── */}
      {children}
    </div>
  );
}
