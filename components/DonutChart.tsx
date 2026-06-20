'use client';

import { Breakdown, Category, CATEGORY_LABELS } from '@/lib/emissions';

const COLORS: Record<Category, string> = {
  transport: '#047857',
  home: '#059669',
  food: '#34d399',
  lifestyle: '#a7f3d0',
};

/**
 * Accessible donut chart of the footprint breakdown, built with plain SVG (no
 * chart library — keeps the bundle small). A visually-hidden data table makes
 * the same information available to screen readers.
 */
export function DonutChart({ breakdown, total }: { breakdown: Breakdown; total: number }) {
  const entries = (Object.keys(breakdown) as Category[])
    .map((key) => ({ key, value: breakdown[key] }))
    .sort((a, b) => b.value - a.value);

  const size = 180;
  const stroke = 26;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const safeTotal = total > 0 ? total : 1;

  let cumulative = 0;
  const segments = entries.map((e) => {
    const fraction = e.value / safeTotal;
    const seg = {
      ...e,
      dash: fraction * c,
      offset: -cumulative * c,
      pct: Math.round(fraction * 100),
    };
    cumulative += fraction;
    return seg;
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      {/* Donut */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" role="img" aria-label="Footprint breakdown donut chart">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
          {segments.map((s) => (
            <circle
              key={s.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={COLORS[s.key]}
              strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${c - s.dash}`}
              strokeDashoffset={s.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-2xl font-extrabold text-slate-900">{total}</span>
          <span className="text-xs text-slate-500">kg/mo</span>
        </div>
      </div>

      {/* Legend */}
      <ul className="w-full flex-1 space-y-2">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-3 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[s.key] }}
              aria-hidden="true"
            />
            <span className="flex-1 text-slate-700">{CATEGORY_LABELS[s.key]}</span>
            <span className="font-medium text-slate-900">{s.value} kg</span>
            <span className="w-10 text-right text-slate-400">{s.pct}%</span>
          </li>
        ))}
      </ul>

      {/* Screen-reader table */}
      <table className="sr-only">
        <caption>Carbon footprint by category, kg CO2e per month</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">kg CO2e / month</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((s) => (
            <tr key={s.key}>
              <th scope="row">{CATEGORY_LABELS[s.key]}</th>
              <td>{s.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
