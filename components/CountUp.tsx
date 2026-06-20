'use client';

import { useEffect, useRef, useState } from 'react';

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Smoothly tweens a number toward `target`. Re-targets from the current value
 * (not from 0) so live-updating values animate naturally. Respects
 * prefers-reduced-motion by jumping straight to the target.
 */
export function useCountUp(target: number, duration = 650): number {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  const mounted = useRef(false);

  useEffect(() => {
    // First mount animates from 0; later changes tween from the current value.
    if (!mounted.current) {
      mounted.current = true;
      current.current = 0;
    }
    if (prefersReducedMotion()) {
      current.current = target;
      setValue(target);
      return;
    }

    const from = current.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const v = from + (target - from) * easeOut(p);
      current.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

/** Inline animated number, e.g. <CountUp value={42} suffix="%" />. */
export function CountUp({
  value,
  suffix = '',
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const v = useCountUp(value);
  return (
    <>
      {v.toFixed(decimals)}
      {suffix}
    </>
  );
}
