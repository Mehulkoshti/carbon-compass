'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Achievements } from '@/components/Achievements';
import { ActionTracker } from '@/components/ActionTracker';
import { CountUp } from '@/components/CountUp';
import { DonutChart } from '@/components/DonutChart';
import { CoachPanel } from '@/components/CoachPanel';
import { Gauge } from '@/components/Gauge';
import { MealScan } from '@/components/MealScan';
import { ProgressTracker } from '@/components/ProgressTracker';
import { ShareResult } from '@/components/ShareResult';
import { computeBadges } from '@/lib/achievements';
import { rankActions, totalSaving } from '@/lib/actions';
import { calculateFootprint, FootprintResult, UserProfile } from '@/lib/emissions';
import { addEntry, HistoryEntry, monthKey } from '@/lib/history';
import { buildRuleBasedCoach, CoachResponse } from '@/lib/insights';
import { storage } from '@/lib/storage';

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [result, setResult] = useState<FootprintResult | null>(null);
  const [coach, setCoach] = useState<CoachResponse | null>(null);
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [committed, setCommitted] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [goal, setGoal] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  // Load persisted state on mount.
  useEffect(() => {
    const p = storage.loadProfile();
    if (p) {
      setProfile(p);
      setResult(calculateFootprint(p));
      setCommitted(storage.loadActions());
      setHistory(storage.loadHistory());
      setGoal(storage.loadGoal());
    }
    setReady(true);
  }, []);

  // Fetch AI insights whenever we have a profile.
  useEffect(() => {
    if (!profile || !result) return;
    let cancelled = false;
    setLoadingCoach(true);
    fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (!cancelled && data?.coach) setCoach(data.coach);
      })
      .catch(() => {
        // Network/API failure → use the same rule engine the server would.
        if (!cancelled) setCoach(buildRuleBasedCoach(profile, result));
      })
      .finally(() => {
        if (!cancelled) setLoadingCoach(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profile, result]);

  const ranked = useMemo(
    () => (profile && result ? rankActions(profile, result) : []),
    [profile, result],
  );
  const saved = useMemo(
    () => (profile && result ? totalSaving(committed, profile, result) : 0),
    [committed, profile, result],
  );

  const toggle = useCallback(
    (id: string) => {
      setCommitted((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        storage.saveActions(next);
        return next;
      });
    },
    [],
  );

  const currentMonth = monthKey(new Date());
  const savedThisMonth = history.some((h) => h.month === currentMonth);

  const saveMonth = useCallback(() => {
    if (!result) return;
    setHistory((prev) => {
      const next = addEntry(prev, { month: monthKey(new Date()), total: result.totalMonthly });
      storage.saveHistory(next);
      return next;
    });
  }, [result]);

  const setGoalValue = useCallback((g: number) => {
    setGoal(g);
    storage.saveGoal(g);
  }, []);

  if (!ready) {
    return <p className="text-slate-500">Loading…</p>;
  }

  if (!profile || !result) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-brand-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">No footprint yet</h1>
        <p className="mt-2 text-slate-600">
          Take the quick calculator to see your dashboard, insights and actions.
        </p>
        <Link
          href="/calculator"
          className="mt-6 inline-block rounded-lg bg-brand-700 px-6 py-3 font-semibold text-white hover:bg-brand-800"
        >
          Start the calculator
        </Link>
      </div>
    );
  }

  const { comparison } = result;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your dashboard</h1>
          <p className="mt-1 text-slate-600">Monthly carbon footprint estimate.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShareResult result={result} />
          <Link
            href="/calculator"
            className="rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            Recalculate
          </Link>
        </div>
      </div>

      {/* Headline numbers */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col items-center rounded-2xl border border-brand-100 bg-white p-6 text-center shadow-soft">
          <Gauge
            pct={comparison.vsParisPct}
            value={result.totalMonthly}
            unit="kg/mo"
            decimals={1}
            size={150}
          />
          <p className="mt-3 text-sm text-slate-500">Your monthly footprint</p>
        </div>
        <div className="flex flex-col justify-center rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <p className="text-sm text-slate-500">vs India average</p>
          <p className="font-display text-4xl font-extrabold text-slate-900">
            <CountUp value={comparison.vsIndiaPct} suffix="%" />
          </p>
          <p className="text-sm text-slate-500">{comparison.indiaAvg} kg/mo average</p>
        </div>
        <div className="flex flex-col justify-center rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <p className="text-sm text-slate-500">vs sustainable target</p>
          <p className="font-display text-4xl font-extrabold text-slate-900">
            <CountUp value={comparison.vsParisPct} suffix="%" />
          </p>
          <p className="text-sm text-slate-500">{comparison.parisTarget} kg/mo target</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section
          aria-labelledby="breakdown-heading"
          className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft"
        >
          <h2 id="breakdown-heading" className="text-xl font-bold text-slate-900">
            Where it comes from
          </h2>
          <p className="mt-1 text-slate-600">
            Your annual footprint is about <strong>{result.totalAnnual} kg CO₂e</strong>.
          </p>
          <div className="mt-5">
            <DonutChart breakdown={result.breakdown} total={result.totalMonthly} />
          </div>
        </section>

        <CoachPanel coach={coach} loading={loadingCoach} />
      </div>

      <ActionTracker
        actions={ranked}
        committed={committed}
        onToggle={toggle}
        totalSaved={saved}
        baseline={result.totalMonthly}
      />

      <ProgressTracker
        currentTotal={result.totalMonthly}
        history={history}
        goal={goal}
        savedThisMonth={savedThisMonth}
        onSaveMonth={saveMonth}
        onSetGoal={setGoalValue}
      />

      <Achievements
        badges={computeBadges({ profile, result, history, committedActions: committed, goal })}
      />

      <MealScan />
    </div>
  );
}
