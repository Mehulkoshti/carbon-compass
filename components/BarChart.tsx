'use client';

import { Breakdown, CATEGORY_LABELS, Category } from '@/lib/emissions';

const COLORS: Record<Category, string> = {
  transport: 'bg-brand-600',
  home: 'bg-brand-500',
  food: 'bg-brand-400',
  lifestyle: 'bg-emerald-300',
};

export function BarChart({ breakdown, total }: { breakdown: Breakdown; total: number }) {
  const entries = (Object.keys(breakdown) as Category[])
    .map((key) => ({ key, value: breakdown[key] }))
    .sort((a, b) => b.value - a.value);
  const max = Math.max(...entries.map((e) => e.value), 1);

  return (
    <div>
      {/* Accessible data table, visually hidden but read by screen readers. */}
      <table className="sr-only">
        <caption>Carbon footprint by category, kg CO2e per month</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">kg CO2e / month</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.key}>
              <th scope="row">{CATEGORY_LABELS[e.key]}</th>
              <td>{e.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul aria-hidden="true" className="space-y-3">
        {entries.map((e) => {
          const pct = total > 0 ? Math.round((e.value / total) * 100) : 0;
          return (
            <li key={e.key}>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">{CATEGORY_LABELS[e.key]}</span>
                <span className="text-slate-500">
                  {e.value} kg · {pct}%
                </span>
              </div>
              <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${COLORS[e.key]}`}
                  style={{ width: `${Math.max(2, (e.value / max) * 100)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
