import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrayerPeriod } from '@/context/PrayerPeriodContext';
import type { PrayerPeriod } from '@/lib/prayerPeriod';

interface DynamicBackgroundProps {
  children: React.ReactNode;
}

const AURORA_THEMES: Record<PrayerPeriod, { bg: string; c1: string; c2: string; c3: string }> = {
  fajr: {
    bg: '#090914', // Deep indigo
    c1: '#312e81', // Purple
    c2: '#4338ca', // Indigo
    c3: '#6366f1', // Light blue
  },
  sunrise: {
    bg: '#1a0f05', // Warm dark
    c1: '#b45309', // Amber
    c2: '#d97706', // Orange
    c3: '#f59e0b', // Yellow/Gold
  },
  zuhr: {
    bg: '#04141a', // Dark cyan
    c1: '#0e7490', // Light sea blue
    c2: '#0284c7', // Cyan
    c3: '#38bdf8', // Light Sky
  },
  asr: {
    bg: '#1a1005', // Dark brown
    c1: '#9a3412', // Burnt orange
    c2: '#b45309', // Amber
    c3: '#d97706', // Light amber
  },
  maghrib: {
    bg: '#160a14', // Dark pinkish
    c1: '#9f1239', // Burnt pink/coral
    c2: '#be123c', // Rose
    c3: '#86198f', // Purple pink
  },
  isha: {
    bg: '#020617', // Very dark navy
    c1: '#1e1b4b', // Dark indigo
    c2: '#312e81', // Faint purple
    c3: '#1e3a8a', // Faint blue
  },
};

export function DynamicBackground({ children }: DynamicBackgroundProps) {
  const { period } = usePrayerPeriod();
  
  const theme = AURORA_THEMES[period] || AURORA_THEMES.isha;

  return (
    <div className="relative min-h-screen w-full overflow-hidden isolation-auto">
      {/* Background Colors layer */}
      <motion.div
        animate={{ backgroundColor: theme.bg }}
        transition={{ duration: 3, ease: 'easeInOut' }}
        className="fixed inset-0 -z-20"
      >
        {/* Animated Aurora Gradients */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: ['0%', '5%', '-5%', '0%'],
            y: ['0%', '-5%', '5%', '0%'],
            backgroundColor: theme.c1
          }}
          transition={{
            scale: { duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' },
            x: { duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' },
            y: { duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' },
            backgroundColor: { duration: 3, ease: 'easeInOut' }
          }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vh] rounded-full blur-[100px] sm:blur-[140px] opacity-60 mix-blend-screen"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: ['0%', '-10%', '5%', '0%'],
            y: ['0%', '10%', '-5%', '0%'],
            backgroundColor: theme.c2
          }}
          transition={{
            scale: { duration: 25, repeat: Infinity, repeatType: 'reverse', ease: 'linear' },
            x: { duration: 25, repeat: Infinity, repeatType: 'reverse', ease: 'linear' },
            y: { duration: 25, repeat: Infinity, repeatType: 'reverse', ease: 'linear' },
            backgroundColor: { duration: 3, ease: 'easeInOut' }
          }}
          className="absolute top-[10%] -right-[10%] w-[60vw] h-[80vh] rounded-full blur-[100px] sm:blur-[140px] opacity-50 mix-blend-screen"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: ['0%', '10%', '-10%', '0%'],
            y: ['0%', '-10%', '10%', '0%'],
            backgroundColor: theme.c3
          }}
          transition={{
            scale: { duration: 30, repeat: Infinity, repeatType: 'reverse', ease: 'linear' },
            x: { duration: 30, repeat: Infinity, repeatType: 'reverse', ease: 'linear' },
            y: { duration: 30, repeat: Infinity, repeatType: 'reverse', ease: 'linear' },
            backgroundColor: { duration: 3, ease: 'easeInOut' }
          }}
          className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[60vh] rounded-full blur-[100px] sm:blur-[140px] opacity-50 mix-blend-screen"
        />

        {/* Stars for night times */}
        <AnimatePresence>
          {(period === 'isha' || period === 'fajr') && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3 }}
              className="absolute inset-0"
              style={{
                backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9Im5vbmUiLz48Y2lyY2xlIGNxPSIxMCUiIGN5PSIyMCUiIHI9IjFweCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNyIvPjxjaXJjbGUgY3g9IjI1JSIgY3k9IjQwJSIgcj0iMXB4IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC41Ii8+PGNpcmNsZSBjeD0iNTAlIiBjeT0iMTAlIiByPSIxcnciIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiLz48Y2lyY2xlIGN4PSI3MCUiIGN5PSI2MCUiIHI9IjJweCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNiIvPjxjaXJjbGUgY3g9IjkzJSIgY3k9IjMwJSIgcj0iMXB4IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45Ii8+PGNpcmNsZSBjeD0iODUlIiBjeT0iODAlIiByPSIxcHgiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjQiLz48L3N2Zz4=')"
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Dark overlay for contrast */}
      <div className="fixed inset-0 -z-10 bg-black/20 pointer-events-none" />

      {children}
    </div>
  );
}
