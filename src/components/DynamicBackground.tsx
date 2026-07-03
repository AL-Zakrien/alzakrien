import React from 'react';
import { usePrayerPeriod } from '@/context/PrayerPeriodContext';

interface DynamicBackgroundProps {
  children: React.ReactNode;
}

export function DynamicBackground({ children }: DynamicBackgroundProps) {
  const { period } = usePrayerPeriod();

  return (
    <div className="dynamic-background" data-period={period}>
      {children}
    </div>
  );
}
