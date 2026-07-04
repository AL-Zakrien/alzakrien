import { motion, AnimatePresence } from "framer-motion";
import { useMemo, type CSSProperties } from "react";
import type { PrayerPeriod } from "@/lib/prayerPeriod";
import { useReducedMotion, useStarCount } from "@/hooks/useReducedMotion";

interface AnimatedBackgroundProps {
  prayerTime: PrayerPeriod;
}

const GRADIENTS: Record<PrayerPeriod, string> = {
  fajr:
    "linear-gradient(165deg, #020617 0%, #0c0a1e 22%, #1e1b4b 48%, #312e81 72%, #0f172a 100%)",
  sunrise:
    "linear-gradient(180deg, #0f172a 0%, #1e293b 18%, #4338ca 42%, #f97316 68%, #fb923c 82%, #1e3a8a 100%)",
  zuhr:
    "linear-gradient(165deg, #0284c7 0%, #0ea5e9 28%, #38bdf8 52%, #7dd3fc 68%, #0c4a6e 100%)",
  asr:
    "linear-gradient(165deg, #1e3a8a 0%, #3b82f6 30%, #fbbf24 58%, #f59e0b 72%, #1e40af 100%)",
  maghrib:
    "linear-gradient(180deg, #020617 0%, #7c2d12 22%, #ea580c 42%, #a855f7 62%, #4c1d95 82%, #0c0a1e 100%)",
  isha:
    "linear-gradient(165deg, #000000 0%, #020617 25%, #0c0a1e 55%, #1e1b4b 78%, #020617 100%)",
};

const SCENE_TRANSITION = { duration: 1.25, ease: "easeInOut" as const };

interface StarSpec {
  id: number;
  x: number;
  y: number;
  size: number;
  dur: number;
  delay: number;
}

function buildStars(count: number, seed = 1): StarSpec[] {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  return Array.from({ length: count }, (_, id) => ({
    id,
    x: rand() * 100,
    y: rand() * 72,
    size: rand() < 0.18 ? 2 : 1,
    dur: 1.6 + rand() * 2.4,
    delay: rand() * 3,
  }));
}

function StarField({
  count,
  animate,
  className = "",
}: {
  count: number;
  animate: boolean;
  className?: string;
}) {
  const stars = useMemo(() => buildStars(count), [count]);

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden="true">
      {stars.map((star) => (
        <span
          key={star.id}
          className={`absolute rounded-full bg-white ${animate ? "sky-star-twinkle" : ""}`}
          style={
            {
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              "--star-dur": `${star.dur}s`,
              "--star-delay": `${star.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function SunDisc({
  className = "",
  size = 88,
  glow = "rgba(251,191,36,0.55)",
}: {
  className?: string;
  size?: number;
  glow?: string;
}) {
  return (
    <div
      className={`relative rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 35% 32%, #fff7d6 0%, #fde047 38%, #f59e0b 100%)",
        boxShadow: `0 0 40px ${glow}, 0 0 90px ${glow}`,
      }}
    />
  );
}

function SunRays({ animate, size = 120 }: { animate: boolean; size?: number }) {
  return (
    <div
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${animate ? "sky-sun-rays-wrap" : ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 text-amber-200/35"
        width={size}
        height={size}
        viewBox="0 0 120 120"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1="60"
            y1="60"
            x2="60"
            y2="8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${i * 30} 60 60)`}
          />
        ))}
      </svg>
    </div>
  );
}

function CrescentMoon({
  maskGradient,
  animate,
  className = "",
}: {
  maskGradient: string;
  animate: boolean;
  className?: string;
}) {
  return (
    <motion.div
      animate={animate ? { y: [0, -8, 0], rotate: [-2, 2, -2] } : undefined}
      transition={animate ? { duration: 8, repeat: Infinity, ease: "easeInOut" } : undefined}
      className={`absolute ${className}`}
    >
      <div className="relative h-20 w-20">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, #f8fafc, #cbd5e1)",
            boxShadow: "0 0 40px rgba(203,213,225,0.35), 0 0 80px rgba(148,163,184,0.18)",
          }}
        />
        <div
          className="absolute left-3 top-0 h-20 w-20 rounded-full"
          style={{ background: maskGradient }}
        />
      </div>
    </motion.div>
  );
}

function FullMoon({ animate, className = "" }: { animate: boolean; className?: string }) {
  return (
    <motion.div
      animate={animate ? { y: [0, -6, 0] } : undefined}
      transition={animate ? { duration: 10, repeat: Infinity, ease: "easeInOut" } : undefined}
      className={`absolute ${className}`}
    >
      <div
        className="h-24 w-24 rounded-full"
        style={{
          background: "radial-gradient(circle at 38% 34%, #ffffff, #e2e8f0 55%, #94a3b8 100%)",
          boxShadow: "0 0 50px rgba(226,232,240,0.45), 0 0 100px rgba(148,163,184,0.2)",
        }}
      />
    </motion.div>
  );
}

function Cloud({
  animate,
  className = "",
  opacity = 0.55,
}: {
  animate: boolean;
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      className={`absolute flex items-center ${animate ? "sky-cloud-drift" : ""} ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <span className="h-7 w-14 rounded-full bg-white/75 blur-[0.5px]" />
      <span className="-mx-2 h-10 w-16 rounded-full bg-white/85 blur-[0.5px]" />
      <span className="h-8 w-12 rounded-full bg-white/70 blur-[0.5px]" />
    </div>
  );
}

function HorizonGlow({ colors }: { colors: string }) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 h-[42%]"
      style={{ background: colors }}
      aria-hidden="true"
    />
  );
}

function FajrScene({ animate, starCount }: { animate: boolean; starCount: number }) {
  return (
    <>
      <StarField count={starCount} animate={animate} />
      <CrescentMoon
        maskGradient={GRADIENTS.fajr}
        animate={animate}
        className="top-14 right-[12%] sm:right-16"
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background:
            "linear-gradient(125deg, transparent 20%, rgba(255,255,255,0.14) 45%, rgba(255,255,255,0.06) 55%, transparent 80%)",
        }}
        aria-hidden="true"
      />
    </>
  );
}

function SunriseScene({ animate }: { animate: boolean }) {
  return (
    <>
      <HorizonGlow colors="linear-gradient(0deg, rgba(251,146,60,0.55) 0%, rgba(249,115,22,0.18) 35%, transparent 100%)" />
      <motion.div
        className="absolute left-1/2 bottom-[8%] -translate-x-1/2"
        animate={animate ? { y: [24, 0, -4, 0], opacity: [0.7, 1, 1, 1] } : { y: 0, opacity: 1 }}
        transition={animate ? { duration: 10, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        <SunRays animate={animate} size={140} />
        <SunDisc size={76} glow="rgba(251,146,60,0.65)" />
      </motion.div>
      <StarField count={6} animate={animate} className="opacity-40" />
    </>
  );
}

function ZuhrScene({ animate }: { animate: boolean }) {
  return (
    <>
      <Cloud animate={animate} className="top-[18%] right-[8%] sky-cloud-drift-slow" opacity={0.62} />
      <Cloud animate={animate} className="top-[28%] left-[6%] sky-cloud-drift-reverse" opacity={0.48} />
      <Cloud animate={animate} className="top-[12%] left-[34%] sky-cloud-drift-slow" opacity={0.35} />
      <motion.div
        className="absolute left-1/2 top-[10%] -translate-x-1/2"
        animate={animate ? { y: [0, -5, 0] } : undefined}
        transition={animate ? { duration: 12, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        <SunRays animate={animate} size={150} />
        <SunDisc size={92} glow="rgba(250,204,21,0.5)" />
      </motion.div>
    </>
  );
}

function AsrScene({ animate }: { animate: boolean }) {
  return (
    <>
      <Cloud animate={animate} className="top-[22%] right-[10%] sky-cloud-drift-slow" opacity={0.5} />
      <Cloud animate={animate} className="top-[34%] left-[12%] sky-cloud-drift-reverse" opacity={0.38} />
      <motion.div
        className="absolute left-[58%] top-[18%] -translate-x-1/2"
        animate={animate ? { y: [0, 4, 0] } : undefined}
        transition={animate ? { duration: 14, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        <SunDisc size={72} glow="rgba(245,158,11,0.45)" />
      </motion.div>
    </>
  );
}

function MaghribScene({ animate, starCount }: { animate: boolean; starCount: number }) {
  const earlyStars = Math.max(8, Math.round(starCount * 0.2));
  return (
    <>
      <HorizonGlow colors="linear-gradient(0deg, rgba(234,88,12,0.65) 0%, rgba(168,85,247,0.28) 40%, transparent 100%)" />
      <motion.div
        className="absolute right-[14%] bottom-[14%]"
        animate={animate ? { x: [0, 6, 0], opacity: [1, 0.85, 1] } : undefined}
        transition={animate ? { duration: 9, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        <SunDisc size={64} glow="rgba(249,115,22,0.55)" />
      </motion.div>
      <StarField count={earlyStars} animate={animate} className="opacity-80" />
    </>
  );
}

function IshaScene({ animate, starCount }: { animate: boolean; starCount: number }) {
  const denseStars = Math.min(starCount + 12, 70);
  return (
    <>
      <StarField count={denseStars} animate={animate} />
      <FullMoon animate={animate} className="top-12 right-[10%] sm:right-14" />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          background:
            "linear-gradient(125deg, transparent 18%, rgba(255,255,255,0.16) 44%, rgba(255,255,255,0.05) 56%, transparent 82%)",
        }}
        aria-hidden="true"
      />
    </>
  );
}

function PrayerScene({
  prayerTime,
  animate,
  starCount,
}: {
  prayerTime: PrayerPeriod;
  animate: boolean;
  starCount: number;
}) {
  switch (prayerTime) {
    case "fajr":
      return <FajrScene animate={animate} starCount={starCount} />;
    case "sunrise":
      return <SunriseScene animate={animate} />;
    case "zuhr":
      return <ZuhrScene animate={animate} />;
    case "asr":
      return <AsrScene animate={animate} />;
    case "maghrib":
      return <MaghribScene animate={animate} starCount={starCount} />;
    case "isha":
      return <IshaScene animate={animate} starCount={starCount} />;
    default:
      return null;
  }
}

export function AnimatedBackground({ prayerTime }: AnimatedBackgroundProps) {
  const reducedMotion = useReducedMotion();
  const starCount = useStarCount();
  const animate = !reducedMotion;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <AnimatePresence mode="wait">
        <motion.div
          key={prayerTime}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={SCENE_TRANSITION}
          className="absolute inset-0"
        >
          <div className="absolute inset-0" style={{ background: GRADIENTS[prayerTime] }} />
          <PrayerScene prayerTime={prayerTime} animate={animate} starCount={starCount} />
        </motion.div>
      </AnimatePresence>

      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

export type { PrayerPeriod as AnimatedBackgroundPrayerTime };
