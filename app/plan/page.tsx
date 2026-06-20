'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { useToast } from '@/components/Toast';
import { UserProfile } from '@/lib/emissions';
import { Plan, planTotalSaving } from '@/lib/plan';
import { storage } from '@/lib/storage';

export default function PlanPage() {
  const toast = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const fetchPlan = useCallback((p: UserProfile) => {
    setLoading(true);
    fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: p }),
    })
      .then((r) => r.json())
      .then((data) => data?.plan && setPlan(data.plan))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const p = storage.loadProfile();
    if (p) {
      setProfile(p);
      setDone(storage.loadPlanDone());
      fetchPlan(p);
    }
    setReady(true);
  }, [fetchPlan]);

  const toggle = useCallback((id: string) => {
    setDone((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      storage.savePlanDone(next);
      return next;
    });
  }, []);

  if (!ready) return <p className="text-slate-500">Loading…</p>;

  if (!profile) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-brand-100 bg-white p-8 text-center shadow-soft">
        <h1 className="text-2xl font-bold text-slate-900">No plan yet</h1>
        <p className="mt-2 text-slate-600">
          Calculate your footprint first to get a personalized 30-day plan.
        </p>
        <Link
          href="/calculator"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
        >
          Start the calculator
        </Link>
      </div>
    );
  }

  const allTasks = plan ? plan.weeks.flatMap((w) => w.tasks) : [];
  const completed = allTasks.filter((t) => done.includes(t.id)).length;
  const pct = allTasks.length ? Math.round((completed / allTasks.length) * 100) : 0;
  const potential = plan ? planTotalSaving(plan) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Your 30-day plan</h1>
          <p className="mt-1 text-slate-600">
            A personalized, week-by-week path to a lighter footprint.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            fetchPlan(profile);
            toast('Generating a fresh plan…', 'info');
          }}
          disabled={loading}
          className="rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-40"
        >
          Regenerate
        </button>
      </div>

      {/* Progress summary */}
      {plan ? (
        <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-medium text-slate-700">
              {completed} / {allTasks.length} tasks done
            </span>
            <span className="text-slate-500">
              Up to ~{potential} kg CO₂e/month if you complete it ·{' '}
              {plan.source === 'ai' ? 'AI-generated' : 'Smart plan'}
            </span>
          </div>
          <div
            className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : null}

      {loading && !plan ? (
        <p className="animate-pulse text-slate-500" role="status">
          Building your personalized plan…
        </p>
      ) : null}

      {/* Weeks */}
      {plan?.weeks.map((w) => (
        <section
          key={w.week}
          aria-labelledby={`week-${w.week}`}
          className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft"
        >
          <h2 id={`week-${w.week}`} className="font-display text-lg font-bold text-slate-900">
            <span className="text-brand-600">Week {w.week}</span> · {w.theme}
          </h2>
          <ul className="mt-4 space-y-3">
            {w.tasks.map((t) => {
              const checked = done.includes(t.id);
              return (
                <li key={t.id}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      checked ? 'border-brand-600 bg-brand-50' : 'border-slate-200 hover:border-brand-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(t.id)}
                      className="mt-1 h-5 w-5 accent-brand-600"
                    />
                    <span className="flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={`font-semibold ${checked ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                          {t.title}
                        </span>
                        {t.estSaving > 0 ? (
                          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                            −{t.estSaving} kg/mo
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 block text-sm text-slate-600">{t.detail}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
