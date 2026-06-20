'use client';

import { useCountUp } from '@/components/CountUp';

/**
 * Circular progress gauge. `pct` is the value as a percentage of the target
 * (100 = on target); the ring fills proportionally, is colour-coded, and both
 * the ring and the centre number animate on mount / when values change.
 */
export function Gauge({
  pct,
  value,
  unit,
  decimals = 0,
  size = 180,
}: {
  pct: number;
  value: number;
  unit?: string;
  decimals?: number;
  size?: number;
}) {
  const animPct = useCountUp(pct);
  const animValue = useCountUp(value);

  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = Math.min(100, Math.max(0, animPct));
  const offset = c - (filled / 100) * c;

  // Colour reflects the final target ratio (stable, not the animating value).
  const color = pct <= 100 ? '#10b981' : pct <= 200 ? '#eab308' : '#ef4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        role="img"
        aria-label={`${value.toFixed(decimals)} ${unit ?? ''}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#d1fae5"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-3xl font-extrabold text-slate-900">
          {animValue.toFixed(decimals)}
        </span>
        {unit ? <span className="text-xs text-slate-500">{unit}</span> : null}
      </div>
    </div>
  );
}
