/**
 * Circular progress gauge. `pct` is the value as a percentage of the target
 * (100 = on target); it visually fills proportionally and is colour-coded.
 */
export function Gauge({
  pct,
  centerValue,
  centerUnit,
  size = 180,
}: {
  pct: number;
  centerValue: string;
  centerUnit?: string;
  size?: number;
}) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = Math.min(100, Math.max(0, pct > 100 ? 100 : pct));
  const offset = c - (filled / 100) * c;

  const color = pct <= 100 ? '#10b981' : pct <= 200 ? '#eab308' : '#ef4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${centerValue} ${centerUnit ?? ''}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#d1fae5" strokeWidth={stroke} />
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
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-3xl font-extrabold text-slate-900">{centerValue}</span>
        {centerUnit ? <span className="text-xs text-slate-500">{centerUnit}</span> : null}
      </div>
    </div>
  );
}
