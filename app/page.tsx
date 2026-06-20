import Link from 'next/link';

import { FeatureCard } from '@/components/FeatureCard';
import { Gauge } from '@/components/Gauge';
import { BENCHMARKS } from '@/lib/emissions';
import { FEATURE_GROUPS, HERO_SAMPLE, HOW_IT_WORKS, WALKTHROUGH } from '@/lib/landing';

const INFO_CARDS = [
  ['📱', 'Installable app', 'Add CarbonCompass to your home screen — it works offline as a PWA.'],
  ['🔒', 'Private by design', 'No account, no database. Your data never leaves your browser.'],
  ['♿', 'Accessible', 'Keyboard-friendly, screen-reader ready, with reduced-motion support.'],
] as const;

const BENCHMARK_ROWS = [
  ['Sustainable target', BENCHMARKS.parisTarget],
  ['India average', BENCHMARKS.indiaAvg],
  ['Global average', BENCHMARKS.globalAvg],
] as const;

export default function Home() {
  return (
    <div className="space-y-20 sm:space-y-24">
      {/* Hero */}
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="animate-fade-up">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-sm font-medium text-brand-700 shadow-soft">
            <span className="h-2 w-2 rounded-full bg-brand-500" aria-hidden="true" />
            Your personal carbon coach
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
            Understand, track &amp; reduce your{' '}
            <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
              carbon footprint
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            Small choices add up. CarbonCompass turns your everyday habits into a clear number, then
            gives you AI-personalized tools to bring it down.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/calculator"
              className="rounded-xl bg-brand-700 px-6 py-3 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-lift"
            >
              Calculate my footprint
            </Link>
            <a
              href="#features"
              className="rounded-xl border border-brand-200 bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              See all features
            </a>
          </div>
          <p className="mt-5 text-sm text-slate-500">
            Free · no sign-up · your data stays in your browser.
          </p>
        </div>

        <div className="animate-fade-up lg:justify-self-end">
          <div className="w-full max-w-sm rounded-3xl border border-brand-100 bg-white/90 p-6 shadow-lift backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-slate-900">Monthly footprint</p>
              <span className="rounded-full bg-accent-400/20 px-2 py-0.5 text-xs font-medium text-amber-700">
                Sample
              </span>
            </div>
            <div className="mt-4 flex items-center gap-5">
              <Gauge pct={HERO_SAMPLE.pct} value={HERO_SAMPLE.total} unit="kg/mo" size={150} />
              <ul className="flex-1 space-y-2">
                {HERO_SAMPLE.bars.map(([label, value, color]) => (
                  <li key={label}>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{label}</span>
                      <span>{value} kg</span>
                    </div>
                    <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 rounded-xl bg-brand-50 p-3 text-sm text-brand-700">
              🌱 Biggest win: <strong>carpool 2 days/week</strong> — save ~31 kg/mo.
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-it-works">
        <h2
          id="how-it-works"
          className="text-center font-display text-3xl font-bold text-slate-900"
        >
          How it works
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS.map((s, i) => (
            <li
              key={s.title}
              className="group rounded-2xl border border-brand-100 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-2xl">
                  {s.icon}
                </span>
                <span className="font-display text-sm font-bold text-brand-700">0{i + 1}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-slate-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Feature deep-dive */}
      <section id="features" aria-labelledby="features-heading" className="scroll-mt-24 space-y-14">
        <div className="text-center">
          <h2 id="features-heading" className="font-display text-3xl font-bold text-slate-900">
            Everything you can do
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-slate-600">
            A complete toolkit — measure accurately, understand deeply, and reduce with AI guidance.
            Here&apos;s what&apos;s inside and how to use it.
          </p>
        </div>

        {FEATURE_GROUPS.map((group, gi) => (
          <div key={group.phase}>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 font-display text-sm font-bold text-white">
                {gi + 1}
              </span>
              <h3 className="font-display text-2xl font-bold text-slate-900">{group.phase}</h3>
              <span className="text-slate-500">— {group.tagline}</span>
            </div>

            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.features.map((f) => (
                <FeatureCard key={f.title} feature={f} />
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Guided walkthrough */}
      <section className="rounded-3xl border border-brand-100 bg-white p-8 shadow-soft sm:p-10">
        <h2 className="text-center font-display text-3xl font-bold text-slate-900">
          Try it in 60 seconds
        </h2>
        <p className="mt-2 text-center text-slate-600">Follow these five steps to see it all.</p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-5">
          {WALKTHROUGH.map(([title, body], i) => (
            <li key={title} className="relative rounded-2xl bg-brand-50 p-4">
              <span className="font-display text-2xl font-extrabold text-brand-400">{i + 1}</span>
              <h3 className="mt-1 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 text-center">
          <Link
            href="/calculator"
            className="rounded-xl bg-brand-700 px-6 py-3 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-lift"
          >
            Start now — it&apos;s free
          </Link>
        </div>
      </section>

      {/* Install / privacy / accessibility */}
      <section className="grid gap-4 sm:grid-cols-3">
        {INFO_CARDS.map(([icon, title, body]) => (
          <div key={title} className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
            <span aria-hidden="true" className="text-2xl">
              {icon}
            </span>
            <h3 className="mt-2 font-display font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{body}</p>
          </div>
        ))}
      </section>

      {/* Benchmarks */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-600 p-8 text-center text-brand-50 shadow-lift sm:p-10">
        <h2 className="font-display text-2xl font-bold">Where does your number land?</h2>
        <p className="mt-2 text-brand-100">
          Monthly CO₂e per person — the benchmarks you&apos;ll be measured against.
        </p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          {BENCHMARK_ROWS.map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white/10 p-5 backdrop-blur">
              <dt className="text-sm text-brand-100">{label}</dt>
              <dd className="mt-1 font-display text-3xl font-extrabold">{value} kg</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
