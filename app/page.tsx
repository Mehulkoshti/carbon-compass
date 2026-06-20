import Link from 'next/link';
import { Gauge } from '@/components/Gauge';
import { BENCHMARKS } from '@/lib/emissions';

const STEPS = [
  {
    icon: '📊',
    title: 'Understand',
    body: 'Answer a few quick questions about how you travel, power your home, eat and shop.',
  },
  {
    icon: '🧭',
    title: 'Track',
    body: 'See your monthly footprint broken down by category and compared to real benchmarks.',
  },
  {
    icon: '🌱',
    title: 'Reduce',
    body: 'Get AI-personalized actions ranked by how much they actually save — for you.',
  },
];

const FEATURES = [
  ['💬', 'AI chat coach', 'Ask questions; get answers grounded in your own data.'],
  ['📸', 'Scan your bill', 'Snap your electricity bill — AI reads the kWh for you.'],
  ['🌍', 'State-aware', "Uses your state's real grid emissions for accuracy."],
  ['📈', 'Streaks & goals', 'Track monthly progress and hit your reduction target.'],
];

// Sample numbers for the hero preview card.
const SAMPLE = {
  total: 248,
  pct: 149,
  bars: [
    ['Transport', 110, 'bg-brand-600'],
    ['Home', 48, 'bg-brand-500'],
    ['Food', 60, 'bg-brand-400'],
    ['Lifestyle', 30, 'bg-brand-200'],
  ] as const,
};

export default function Home() {
  return (
    <div className="space-y-20">
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
            Small choices add up. CarbonCompass turns your everyday habits into a
            clear number, then shows you the few changes that matter most.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/calculator"
              className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lift"
            >
              Calculate my footprint
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-brand-200 bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              View my dashboard
            </Link>
          </div>
          <p className="mt-5 text-sm text-slate-500">
            Free · no sign-up · your data stays in your browser.
          </p>
        </div>

        {/* Preview card */}
        <div className="animate-fade-up lg:justify-self-end">
          <div className="w-full max-w-sm rounded-3xl border border-brand-100 bg-white/90 p-6 shadow-lift backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-slate-900">Monthly footprint</p>
              <span className="rounded-full bg-accent-400/20 px-2 py-0.5 text-xs font-medium text-amber-700">
                Sample
              </span>
            </div>
            <div className="mt-4 flex items-center gap-5">
              <Gauge pct={SAMPLE.pct} value={SAMPLE.total} unit="kg/mo" size={150} />
              <ul className="flex-1 space-y-2">
                {SAMPLE.bars.map(([label, value, color]) => (
                  <li key={label}>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{label}</span>
                      <span>{value} kg</span>
                    </div>
                    <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
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
        <h2 id="how-it-works" className="text-center font-display text-3xl font-bold text-slate-900">
          How it works
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="group rounded-2xl border border-brand-100 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-2xl">
                  {s.icon}
                </span>
                <span className="font-display text-sm font-bold text-brand-600">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-slate-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section aria-labelledby="features-heading">
        <h2
          id="features-heading"
          className="text-center font-display text-3xl font-bold text-slate-900"
        >
          More than a calculator — a smart assistant
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([icon, title, body]) => (
            <li
              key={title}
              className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-2xl"
              >
                {icon}
              </span>
              <h3 className="mt-3 font-display font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Benchmarks */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-600 p-8 text-center text-brand-50 shadow-lift sm:p-10">
        <h2 className="font-display text-2xl font-bold">Where does your number land?</h2>
        <p className="mt-2 text-brand-100">
          Monthly CO₂e per person — the benchmarks you&apos;ll be measured against.
        </p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ['Sustainable target', BENCHMARKS.parisTarget],
            ['India average', BENCHMARKS.indiaAvg],
            ['Global average', BENCHMARKS.globalAvg],
          ].map(([label, value]) => (
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
