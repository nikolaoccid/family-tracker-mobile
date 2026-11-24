import { useEffect, useState } from 'react';
import * as Battery from 'expo-battery';
import { locationApi } from '@/features/location';
import { logger } from '@/shared/logger';

const REPORT_MS = 60_000;

/** Reads the battery level and reports it to the API every minute while mounted. */
export function useBatteryReporter(): number | null {
  const [level, setLevel] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const report = async () => {
      try {
        const raw = await Battery.getBatteryLevelAsync();
        if (raw < 0) return; // -1 means the platform cannot tell
        const percent = Math.round(raw * 100);
        if (alive) setLevel(percent);
        await locationApi.updateBattery(percent);
      } catch (error) {
        logger.debug('battery report failed', error);
      }
    };
    void report();
    const interval = setInterval(() => void report(), REPORT_MS);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  return level;
}
