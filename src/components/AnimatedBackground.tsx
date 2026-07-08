import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

interface AnimatedBackgroundProps {
  prayerTime: 'fajr' | 'sunrise' | 'zuhr' | 'asr' | 'maghrib' | 'isha';
}

const GRADIENTS: Record<string, string> = {
  fajr:    'linear-gradient(135deg, #4A5D6E 0%, #F1A7A6 100%)',
  sunrise: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #1e3a8a 60%, #020617 100%)',
  zuhr:    'linear-gradient(135deg, #0f172a 0%, #1e3a8a 30%, #0c4a6e 60%, #020617 100%)',
  asr:     'linear-gradient(135deg, #0f172a 0%, #3b82f6 30%, #1e3a8a 60%, #020617 100%)',
  maghrib: 'linear-gradient(135deg, #020617 0%, #8b5cf6 30%, #1e1b4b 60%, #0c0a1e 100%)',
  isha:    'linear-gradient(135deg, #020617 0%, #0c0a1e 30%, #000000 100%)',
};

function NightElements() {
  const stars = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 75,
      size: Math.random() < 0.15 ? 2 : 1,
      dur: 1.5 + Math.random() * 2.5,
      delay: Math.random() * 3,
    })), []);

  return (
    <>
      {/* Crescent Moon */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-16 right-16"
      >
        <div className="relative w-20 h-20">
          {/* Moon body */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #f1f5f9, #cbd5e1)',
              boxShadow: '0 0 40px rgba(203,213,225,0.4), 0 0 80px rgba(148,163,184,0.2)',
            }}
          />
          {/* Shadow to make crescent */}
          <div
            className="absolute top-0 left-3 w-20 h-20 rounded-full"
            style={{ background: GRADIENTS['fajr'] }}
          />
        </div>
      </motion.div>

      {/* Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: star.dur, repeat: Infinity, delay: star.delay, ease: 'easeInOut' }}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
        />
      ))}

      {/* Milky Way streak */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: 'linear-gradient(125deg, transparent 20%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.08) 55%, transparent 80%)',
        }}
      />
    </>
  );
}



export function AnimatedBackground({ prayerTime }: AnimatedBackgroundProps) {
  const isNight = prayerTime === 'fajr' || prayerTime === 'isha';

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient — cross-fades on theme change */}
      <AnimatePresence mode="wait">
        <motion.div
          key={prayerTime}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{ background: GRADIENTS[prayerTime] ?? GRADIENTS['fajr'] }}
        />
      </AnimatePresence>

      {/* Theme-specific decorative elements */}
      <AnimatePresence mode="wait">
        {isNight && (
          <motion.div
            key="night"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <NightElements />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
}
