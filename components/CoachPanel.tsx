'use client';

import { CoachResponse } from '@/lib/insights';

const IMPACT_STYLES: Record<string, string> = {
  high: 'bg-brand-700 text-white',
  medium: 'bg-brand-100 text-brand-700',
  low: 'bg-slate-100 text-slate-600',
};

export function CoachPanel({
  coach,
  loading,
}: {
  coach: CoachResponse | null;
  loading: boolean;
}) {
  return (
    <section
      aria-labelledby="coach-heading"
      aria-busy={loading}
      className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <h2 id="coach-heading" className="text-xl font-bold text-slate-900">
          🌱 Your personalized coach
        </h2>
        {coach ? (
          <span className="rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
            {coach.source === 'ai' ? 'AI-generated' : 'Smart tips'}
          </span>
        ) : null}
      </div>

      {loading ? (
        <p className="mt-4 animate-pulse text-slate-500">
          Analyzing your footprint and finding your highest-impact actions…
        </p>
      ) : coach ? (
        <>
          <p className="mt-3 text-slate-700">{coach.summary}</p>
          <ul className="mt-5 space-y-4">
            {coach.insights.map((ins, i) => (
              <li key={i} className="rounded-lg border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-900">{ins.title}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      IMPACT_STYLES[ins.impact] ?? IMPACT_STYLES.low
                    }`}
                  >
                    {ins.impact} impact
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{ins.detail}</p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-4 text-slate-500">No insights yet.</p>
      )}
    </section>
  );
}
