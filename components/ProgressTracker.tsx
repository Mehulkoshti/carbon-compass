'use client';

import { useState } from 'react';

import {
  changeFromPrevious,
  computeStreak,
  goalProgress,
  HistoryEntry,
} from '@/lib/history';
import { useToast } from '@/components/Toast';

export function ProgressTracker({
  currentTotal,
  history,
  goal,
  savedThisMonth,
  onSaveMonth,
  onSetGoal,
}: {
  currentTotal: number;
  history: HistoryEntry[];
  goal: number | null;
  savedThisMonth: boolean;
  onSaveMonth: () => void;
  onSetGoal: (g: number) => void;
}) {
  const [goalInput, setGoalInput] = useState(goal ? String(goal) : '');
  const toast = useToast();

  const streak = computeStreak(history);
  const change = changeFromPrevious(history);
  const baseline = history[0]?.total ?? currentTotal;
  const progress = goal ? goalProgress(currentTotal, goal, baseline) : null;
  const max = Math.max(...history.map((h) => h.total), currentTotal, 1);

  return (
    <section
      aria-labelledby="progress-heading"
      className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="progress-heading" className="text-xl font-bold text-slate-900">
          📈 Your progress
        </h2>
        <button
          type="button"
          onClick={() => {
            onSaveMonth();
            toast('This month logged', 'success');
          }}
          disabled={savedThisMonth}
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-40"
        >
          {savedThisMonth ? 'Saved this month ✓' : 'Log this month'}
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-brand-50 p-4">
          <p className="text-sm text-slate-500">🔥 Check-in streak</p>
          <p className="text-2xl font-extrabold text-brand-700">
            {streak} {streak === 1 ? 'month' : 'months'}
          </p>
        </div>
        <div className="rounded-lg bg-brand-50 p-4">
          <p className="text-sm text-slate-500">Months tracked</p>
          <p className="text-2xl font-extrabold text-brand-700">{history.length}</p>
        </div>
        <div className="rounded-lg bg-brand-50 p-4">
          <p className="text-sm text-slate-500">vs last month</p>
          <p className="text-2xl font-extrabold text-brand-700">
            {change === null ? '—' : `${change > 0 ? '+' : ''}${change} kg`}
          </p>
        </div>
      </div>

      {/* Goal */}
      <div className="mt-6">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const g = Number(goalInput);
            if (Number.isFinite(g) && g > 0) {
              onSetGoal(g);
              toast('Goal saved', 'success');
            }
          }}
        >
          <div>
            <label htmlFor="goal-input" className="block text-sm font-medium text-slate-700">
              Monthly goal (kg CO₂e)
            </label>
            <input
              id="goal-input"
              type="number"
              min={1}
              inputMode="decimal"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g. 167"
              className="mt-1 w-40 rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-600"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            Set goal
          </button>
        </form>

        {progress ? (
          <div className="mt-3" aria-live="polite">
            <div className="flex justify-between text-sm text-slate-600">
              <span>
                {progress.met
                  ? '🎉 Goal reached!'
                  : `Goal: ${progress.goal} kg · now ${progress.current} kg`}
              </span>
              <span>{progress.pct}%</span>
            </div>
            <div
              className="mt-1 h-3 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={progress.pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full rounded-full ${progress.met ? 'bg-brand-500' : 'bg-brand-700'}`}
                style={{ width: `${progress.pct}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Trend */}
      {history.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-700">Monthly trend</h3>
          <ul className="mt-2 flex items-end gap-2" aria-hidden="true">
            {history.map((h) => (
              <li key={h.month} className="flex flex-1 flex-col items-center">
                <div className="flex h-24 w-full items-end">
                  <div
                    className="w-full rounded-t bg-brand-400"
                    style={{ height: `${Math.max(4, (h.total / max) * 100)}%` }}
                  />
                </div>
                <span className="mt-1 text-[10px] text-slate-500">{h.month.slice(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          Log your footprint each month to build a trend and a streak.
        </p>
      )}
    </section>
  );
}
