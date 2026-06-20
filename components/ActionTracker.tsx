'use client';

import { RankedAction } from '@/lib/actions';

const EFFORT_LABEL: Record<string, string> = {
  easy: 'Easy',
  medium: 'Some effort',
  ambitious: 'Ambitious',
};

/**
 * Lets the user commit to reduction actions and shows the projected footprint
 * and percentage cut updating live as actions are toggled.
 */
export function ActionTracker({
  actions,
  committed,
  onToggle,
  totalSaved,
  baseline,
}: {
  actions: RankedAction[];
  committed: string[];
  onToggle: (id: string) => void;
  totalSaved: number;
  baseline: number;
}) {
  const committedSet = new Set(committed);
  const projected = Math.max(0, Math.round((baseline - totalSaved) * 10) / 10);
  const pctCut = baseline > 0 ? Math.round((totalSaved / baseline) * 100) : 0;

  return (
    <section
      aria-labelledby="actions-heading"
      className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft"
    >
      <h2 id="actions-heading" className="text-xl font-bold text-slate-900">
        ✅ Track your actions
      </h2>
      <p className="mt-1 text-slate-600">
        Commit to changes and watch your projected footprint drop.
      </p>

      <div className="mt-4 rounded-lg bg-brand-50 p-4" role="status" aria-live="polite">
        <p className="text-sm text-brand-700">
          Saving <strong>{totalSaved} kg CO₂e / month</strong> ({pctCut}% cut). Projected footprint:{' '}
          <strong>{projected} kg/month</strong>.
        </p>
      </div>

      <ul className="mt-5 space-y-3">
        {actions.map((a) => {
          const checked = committedSet.has(a.id);
          return (
            <li key={a.id}>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  checked
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-slate-200 hover:border-brand-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(a.id)}
                  className="mt-1 h-5 w-5 accent-brand-600"
                />
                <span className="flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{a.title}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {EFFORT_LABEL[a.effort]}
                    </span>
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                      −{a.saving} kg/mo
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">{a.description}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
