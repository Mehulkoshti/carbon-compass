import Link from 'next/link';
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

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="text-center">
        <p className="mb-3 inline-block rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
          Your personal carbon coach
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Understand, track and reduce your carbon footprint
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Small choices add up. CarbonCompass turns your everyday habits into a
          clear number, then shows you the few changes that matter most.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/calculator"
            className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Calculate my footprint
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-brand-200 bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            View my dashboard
          </Link>
        </div>
      </section>

      <section aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="sr-only">
          How it works
        </h2>
        <ol className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li
              key={s.title}
              className="rounded-xl border border-brand-100 bg-white p-6 shadow-sm"
            >
              <span aria-hidden="true" className="text-3xl">
                {s.icon}
              </span>
              <h3 className="mt-3 text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-slate-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-center text-2xl font-bold text-slate-900">
          More than a calculator — a smart assistant
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['💬', 'AI chat coach', 'Ask questions; get answers grounded in your own data.'],
            ['📸', 'Scan your bill', 'Snap your electricity bill — AI reads the kWh for you.'],
            ['🌍', 'State-aware', "Uses your state's real grid emissions for accuracy."],
            ['📈', 'Streaks & goals', 'Track monthly progress and hit your reduction target.'],
          ].map(([icon, title, body]) => (
            <li key={title} className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
              <span aria-hidden="true" className="text-2xl">
                {icon}
              </span>
              <h3 className="mt-2 font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl bg-brand-900 p-8 text-center text-brand-50">
        <h2 className="text-2xl font-bold">Where does your number land?</h2>
        <p className="mt-2 text-brand-100">
          Monthly CO₂e per person — the benchmarks you&apos;ll be measured against.
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['Sustainable target', BENCHMARKS.parisTarget],
            ['India average', BENCHMARKS.indiaAvg],
            ['Global average', BENCHMARKS.globalAvg],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-brand-700/40 p-4">
              <dt className="text-sm text-brand-100">{label}</dt>
              <dd className="text-2xl font-bold">{value} kg</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
