'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { CountUp } from '@/components/CountUp';
import { Gauge } from '@/components/Gauge';
import { RangeField, SelectField } from '@/components/forms';
import {
  calculateFootprint,
  CATEGORY_LABELS,
  Category,
  UserProfile,
} from '@/lib/emissions';
import { storage } from '@/lib/storage';

const DIET_OPTIONS = [
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'eggetarian', label: 'Eggetarian' },
  { value: 'moderate_meat', label: 'Meat a few times a week' },
  { value: 'heavy_meat', label: 'Meat most days' },
] as const;

const FUEL_OPTIONS = [
  { value: 'none', label: 'No car' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'ev', label: 'Electric' },
] as const;

const SHOPPING_OPTIONS = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'average', label: 'Average' },
  { value: 'frequent', label: 'Frequent' },
] as const;

export default function SimulatePage() {
  const [base, setBase] = useState<UserProfile | null>(null);
  const [scenario, setScenario] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = storage.loadProfile();
    if (p) {
      setBase(p);
      setScenario(structuredClone(p));
    }
    setReady(true);
  }, []);

  if (!ready) return <p className="text-slate-500">Loading…</p>;

  if (!base || !scenario) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-brand-100 bg-white p-8 text-center shadow-soft">
        <h1 className="text-2xl font-bold text-slate-900">Nothing to simulate yet</h1>
        <p className="mt-2 text-slate-600">
          Calculate your footprint first, then play with what-if scenarios here.
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

  const baseResult = calculateFootprint(base);
  const simResult = calculateFootprint(scenario);
  const delta = Math.round((simResult.totalMonthly - baseResult.totalMonthly) * 10) / 10;
  const pctChange =
    baseResult.totalMonthly > 0
      ? Math.round((delta / baseResult.totalMonthly) * 100)
      : 0;

  const setT = (patch: Partial<UserProfile['transport']>) =>
    setScenario((s) => (s ? { ...s, transport: { ...s.transport, ...patch } } : s));
  const setH = (patch: Partial<UserProfile['home']>) =>
    setScenario((s) => (s ? { ...s, home: { ...s.home, ...patch } } : s));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">What-if simulator</h1>
          <p className="mt-1 text-slate-600">
            Try changes and see your projected footprint update instantly.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setScenario(structuredClone(base))}
          className="rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          Reset to current
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Controls */}
        <div className="space-y-5 rounded-2xl border border-brand-100 bg-white p-6 shadow-soft lg:col-span-2">
          <SelectField
            label="Vehicle"
            value={scenario.transport.carFuel}
            onChange={(carFuel) => setT({ carFuel })}
            options={FUEL_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <RangeField
            label="Driving"
            unit="km/wk"
            min={0}
            max={700}
            step={10}
            value={scenario.transport.carKmPerWeek}
            onChange={(v) => setT({ carKmPerWeek: v })}
          />
          <RangeField
            label="Bus / metro"
            unit="km/wk"
            min={0}
            max={300}
            step={10}
            value={scenario.transport.transitKmPerWeek}
            onChange={(v) => setT({ transitKmPerWeek: v })}
          />
          <RangeField
            label="Long flights"
            unit="/yr"
            min={0}
            max={10}
            value={scenario.transport.longFlightsPerYear}
            onChange={(v) => setT({ longFlightsPerYear: v })}
          />
          <SelectField
            label="Diet"
            value={scenario.food.diet}
            onChange={(diet) => setScenario((s) => (s ? { ...s, food: { diet } } : s))}
            options={DIET_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <RangeField
            label="Renewable electricity"
            unit="%"
            min={0}
            max={100}
            step={5}
            value={Math.round(scenario.home.renewableShare * 100)}
            onChange={(v) => setH({ renewableShare: v / 100 })}
          />
          <SelectField
            label="Shopping habit"
            value={scenario.lifestyle.shopping}
            onChange={(shopping) =>
              setScenario((s) => (s ? { ...s, lifestyle: { shopping } } : s))
            }
            options={SHOPPING_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
        </div>

        {/* Result */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-brand-100 bg-white p-6 text-center shadow-soft">
            <p className="text-sm font-medium text-slate-500">Projected footprint</p>
            <div className="mt-3 flex justify-center">
              <Gauge
                pct={simResult.comparison.vsParisPct}
                value={simResult.totalMonthly}
                unit="kg/mo"
                decimals={1}
                size={170}
              />
            </div>
            <div
              className={`mt-4 rounded-xl p-3 text-sm font-semibold ${
                delta < 0
                  ? 'bg-brand-50 text-brand-700'
                  : delta > 0
                    ? 'bg-red-50 text-red-600'
                    : 'bg-slate-50 text-slate-500'
              }`}
              aria-live="polite"
            >
              {delta === 0 ? (
                'Same as your current footprint'
              ) : (
                <>
                  {delta < 0 ? '▼ ' : '▲ '}
                  <CountUp value={Math.abs(delta)} decimals={1} /> kg/mo (
                  {Math.abs(pctChange)}% {delta < 0 ? 'less' : 'more'})
                </>
              )}
            </div>
            <dl className="mt-4 space-y-1 text-left text-sm">
              {(['transport', 'home', 'food', 'lifestyle'] as Category[]).map((k) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-slate-500">{CATEGORY_LABELS[k]}</dt>
                  <dd className="font-medium text-slate-700">
                    {baseResult.breakdown[k]} → {simResult.breakdown[k]} kg
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-slate-400">
              Current: {baseResult.totalMonthly} kg/mo
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
