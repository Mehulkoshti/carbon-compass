'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { BillScan } from '@/components/BillScan';
import { Gauge } from '@/components/Gauge';
import { NumberField, RadioGroup, SelectField } from '@/components/forms';
import { DEFAULT_PROFILE } from '@/lib/defaults';
import { calculateFootprint, CATEGORY_LABELS, UserProfile } from '@/lib/emissions';
import { userProfileSchema } from '@/lib/schema';
import { GRID_REGIONS } from '@/lib/states';
import { storage } from '@/lib/storage';

const STEPS = ['Transport', 'Home energy', 'Food', 'Lifestyle'] as const;

export default function CalculatorPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const isLast = step === STEPS.length - 1;

  function finish() {
    const parsed = userProfileSchema.safeParse(profile);
    if (!parsed.success) {
      setError('Please check your entries — some values look out of range.');
      return;
    }
    storage.saveProfile(profile);
    storage.saveResult(calculateFootprint(profile));
    router.push('/dashboard');
  }

  const live = calculateFootprint(profile);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl font-bold text-slate-900">Footprint calculator</h1>
      <p className="mt-1 text-slate-600">
        Four quick steps. Defaults reflect a typical urban household — adjust to
        match your life.
      </p>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
      {/* Progress */}
      <ol className="flex gap-2" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1">
            <div
              className={`h-2 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-brand-100'}`}
              aria-current={i === step ? 'step' : undefined}
            />
            <span className="mt-1 block text-xs text-slate-500">{label}</span>
          </li>
        ))}
      </ol>

      <section
        aria-labelledby="step-heading"
        className="mt-6 space-y-5 rounded-2xl border border-brand-100 bg-white p-6 shadow-soft"
      >
        <h2 id="step-heading" className="font-display text-xl font-semibold text-slate-900">
          {STEPS[step]}
        </h2>

        {step === 0 && (
          <>
            <RadioGroup
              legend="Your main vehicle"
              value={profile.transport.carFuel}
              onChange={(carFuel) => set('transport', { ...profile.transport, carFuel })}
              options={[
                { value: 'none', label: 'No car' },
                { value: 'petrol', label: 'Petrol' },
                { value: 'diesel', label: 'Diesel' },
                { value: 'ev', label: 'Electric' },
              ]}
            />
            <NumberField
              label="Distance driven"
              unit="km / week"
              value={profile.transport.carKmPerWeek}
              onChange={(v) => set('transport', { ...profile.transport, carKmPerWeek: v })}
            />
            <NumberField
              label="Bus / metro travel"
              unit="km / week"
              value={profile.transport.transitKmPerWeek}
              onChange={(v) => set('transport', { ...profile.transport, transitKmPerWeek: v })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Short flights"
                unit="per year"
                hint="Domestic / under ~3 hrs"
                value={profile.transport.shortFlightsPerYear}
                onChange={(v) =>
                  set('transport', { ...profile.transport, shortFlightsPerYear: v })
                }
              />
              <NumberField
                label="Long flights"
                unit="per year"
                hint="International / long-haul"
                value={profile.transport.longFlightsPerYear}
                onChange={(v) =>
                  set('transport', { ...profile.transport, longFlightsPerYear: v })
                }
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <SelectField
              label="Your state / region"
              hint="We use your state's actual grid emission factor for a more accurate estimate."
              value={profile.home.stateCode ?? 'IN'}
              onChange={(stateCode) => set('home', { ...profile.home, stateCode })}
              options={GRID_REGIONS.map((r) => ({ value: r.code, label: r.name }))}
            />
            <BillScan
              onExtract={(kwh) => set('home', { ...profile.home, electricityKwhPerMonth: kwh })}
            />
            <NumberField
              label="Household electricity"
              unit="kWh / month"
              hint="Check your electricity bill — typical urban home is 200–400."
              value={profile.home.electricityKwhPerMonth}
              onChange={(v) => set('home', { ...profile.home, electricityKwhPerMonth: v })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                label="People in household"
                value={profile.home.householdSize}
                min={1}
                onChange={(v) => set('home', { ...profile.home, householdSize: v })}
              />
              <NumberField
                label="LPG cylinders"
                unit="per month"
                step={0.5}
                value={profile.home.lpgCylindersPerMonth}
                onChange={(v) => set('home', { ...profile.home, lpgCylindersPerMonth: v })}
              />
            </div>
            <NumberField
              label="Electricity from solar / green tariff"
              unit="% "
              hint="0 if none. We convert this to a share automatically."
              min={0}
              max={100}
              value={Math.round(profile.home.renewableShare * 100)}
              onChange={(v) =>
                set('home', {
                  ...profile.home,
                  renewableShare: Math.min(1, Math.max(0, v / 100)),
                })
              }
            />
          </>
        )}

        {step === 2 && (
          <RadioGroup
            legend="Which best describes your diet?"
            value={profile.food.diet}
            onChange={(diet) => set('food', { diet })}
            options={[
              { value: 'vegan', label: 'Vegan' },
              { value: 'vegetarian', label: 'Vegetarian' },
              { value: 'eggetarian', label: 'Eggetarian' },
              { value: 'moderate_meat', label: 'Meat a few times a week' },
              { value: 'heavy_meat', label: 'Meat most days' },
            ]}
          />
        )}

        {step === 3 && (
          <RadioGroup
            legend="How often do you buy new clothes, gadgets & goods?"
            value={profile.lifestyle.shopping}
            onChange={(shopping) => set('lifestyle', { shopping })}
            options={[
              { value: 'minimal', label: 'Rarely — buy only what I need' },
              { value: 'average', label: 'Now and then' },
              { value: 'frequent', label: 'Often / love new things' },
            ]}
          />
        )}

        {error ? (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-lg px-4 py-2 font-medium text-slate-600 disabled:opacity-40"
          >
            ← Back
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={finish}
              className="rounded-lg bg-brand-600 px-6 py-2 font-semibold text-white hover:bg-brand-700"
            >
              See my results
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="rounded-lg bg-brand-600 px-6 py-2 font-semibold text-white hover:bg-brand-700"
            >
              Next →
            </button>
          )}
        </div>
      </section>
        </div>

        {/* Live estimate side panel */}
        <aside className="lg:sticky lg:top-24" aria-live="polite">
          <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
            <p className="text-sm font-medium text-slate-500">Live estimate</p>
            <div className="mt-3 flex flex-col items-center">
              <Gauge
                pct={live.comparison.vsParisPct}
                value={live.totalMonthly}
                unit="kg/mo"
                decimals={1}
                size={160}
              />
              <p className="mt-3 text-center text-sm text-slate-500">
                {live.comparison.vsIndiaPct}% of the India average
              </p>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              {(['transport', 'home', 'food', 'lifestyle'] as const).map((k) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-slate-500">{CATEGORY_LABELS[k]}</dt>
                  <dd className="font-medium text-slate-700">{live.breakdown[k]} kg</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 rounded-xl bg-brand-50 p-3 text-xs text-brand-700">
              💡 Updates as you answer. Biggest source:{' '}
              <strong>{CATEGORY_LABELS[live.topCategory]}</strong>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
