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

interface Feature {
  icon: string;
  title: string;
  desc: string;
  how: string;
  where: string;
}

const GROUPS: { phase: string; tagline: string; features: Feature[] }[] = [
  {
    phase: 'Measure',
    tagline: 'Turn your habits into a clear number.',
    features: [
      {
        icon: '📊',
        title: '4-step calculator',
        desc: 'A quick quiz across transport, home energy, food and lifestyle. Sensible defaults let you start in seconds.',
        how: 'Open the calculator and adjust each step to match your life.',
        where: 'Calculator',
      },
      {
        icon: '🌍',
        title: 'State-aware accuracy',
        desc: "Your electricity emissions use your state's real grid mix — coal-heavy vs hydro/renewable — so the number is realistic.",
        how: 'Pick your state in step 2 (Home energy).',
        where: 'Calculator → Home energy',
      },
      {
        icon: '📸',
        title: 'Scan your bill',
        desc: 'Snap a photo of your electricity bill and Gemini Vision reads the monthly kWh for you — no manual typing.',
        how: 'Tap “Scan your electricity bill” in step 2 and upload a photo.',
        where: 'Calculator → Home energy',
      },
    ],
  },
  {
    phase: 'Understand',
    tagline: 'See where it comes from — and ask why.',
    features: [
      {
        icon: '🧭',
        title: 'Visual dashboard',
        desc: 'An animated gauge, a donut breakdown by category, and comparisons to the India average and the climate-safe target.',
        how: 'Finish the calculator to land on your dashboard.',
        where: 'Dashboard',
      },
      {
        icon: '🌱',
        title: 'AI insights',
        desc: 'A personalized coach reads your numbers and highlights the 3 highest-impact changes — ranked by what they save you.',
        how: 'Scroll to “Your personalized coach” on the dashboard.',
        where: 'Dashboard',
      },
      {
        icon: '💬',
        title: 'Chat with your coach',
        desc: 'Ask anything (“how do I cut transport?”). Answers are grounded in your own footprint, not generic tips.',
        how: 'Tap the green chat bubble at the bottom-right — on any page.',
        where: 'Chat bubble (everywhere)',
      },
      {
        icon: '🍽️',
        title: 'Meal footprint scan',
        desc: 'Photograph a plate or grocery receipt and get an itemized food-carbon estimate.',
        how: 'Use “Estimate a meal” on the dashboard and upload a photo.',
        where: 'Dashboard',
      },
    ],
  },
  {
    phase: 'Reduce',
    tagline: 'Plan it, act on it, stick with it.',
    features: [
      {
        icon: '✅',
        title: 'Action tracker',
        desc: 'Tick changes you commit to and watch your projected footprint drop in real time.',
        how: 'Use “Track your actions” on the dashboard.',
        where: 'Dashboard',
      },
      {
        icon: '🎚️',
        title: 'What-if simulator',
        desc: 'Slide through scenarios — EV, plant-based, rooftop solar, less flying — and see the combined impact instantly.',
        how: 'Open Simulate and move the sliders.',
        where: 'Simulate',
      },
      {
        icon: '🗓️',
        title: 'AI 30-day plan',
        desc: 'A week-by-week, personalized reduction roadmap with checkable tasks and a progress bar.',
        how: 'Open Plan — it generates from your data automatically.',
        where: 'Plan',
      },
      {
        icon: '📈',
        title: 'History, streaks & goals',
        desc: 'Log your footprint each month, keep a streak, set a target and track the trend.',
        how: 'Use “Your progress” on the dashboard; tap “Log this month”.',
        where: 'Dashboard',
      },
      {
        icon: '🏅',
        title: 'Achievements',
        desc: 'Unlock badges for streaks, goals, committed actions and low-carbon choices.',
        how: 'See “Achievements” on the dashboard — they unlock as you go.',
        where: 'Dashboard',
      },
      {
        icon: '📤',
        title: 'Share your card',
        desc: 'Download a branded footprint card (with a donut chart) or share it to inspire friends.',
        how: 'Use “Share my footprint” / “Download card” on the dashboard.',
        where: 'Dashboard',
      },
    ],
  },
];

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

const WALKTHROUGH = [
  ['Calculate', 'Take the 4-step quiz (or scan your bill) to get your number.'],
  ['Explore', 'Open your dashboard — gauge, donut breakdown and AI insights.'],
  ['Ask', 'Tap the chat bubble and ask your coach what to do first.'],
  ['Simulate', 'Try what-if scenarios to find the changes that suit you.'],
  ['Commit', 'Get your 30-day plan, track actions, build a streak.'],
];

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
            Small choices add up. CarbonCompass turns your everyday habits into a
            clear number, then gives you AI-personalized tools to bring it down.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/calculator"
              className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lift"
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
                <span className="font-display text-sm font-bold text-brand-600">0{i + 1}</span>
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
            A complete toolkit — measure accurately, understand deeply, and reduce
            with AI guidance. Here&apos;s what&apos;s inside and how to use it.
          </p>
        </div>

        {GROUPS.map((group, gi) => (
          <div key={group.phase}>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 font-display text-sm font-bold text-white">
                {gi + 1}
              </span>
              <h3 className="font-display text-2xl font-bold text-slate-900">{group.phase}</h3>
              <span className="text-slate-500">— {group.tagline}</span>
            </div>

            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.features.map((f) => (
                <li
                  key={f.title}
                  className="flex flex-col rounded-2xl border border-brand-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-2xl"
                  >
                    {f.icon}
                  </span>
                  <h4 className="mt-3 font-display font-bold text-slate-900">{f.title}</h4>
                  <p className="mt-1 flex-1 text-sm text-slate-600">{f.desc}</p>
                  <p className="mt-3 rounded-lg bg-brand-50 p-2 text-xs text-brand-700">
                    <strong>How:</strong> {f.how}
                  </p>
                  <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    📍 {f.where}
                  </span>
                </li>
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
            className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lift"
          >
            Start now — it&apos;s free
          </Link>
        </div>
      </section>

      {/* Extra: install + privacy */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ['📱', 'Installable app', 'Add CarbonCompass to your home screen — it works offline as a PWA.'],
          ['🔒', 'Private by design', 'No account, no database. Your data never leaves your browser.'],
          ['♿', 'Accessible', 'Keyboard-friendly, screen-reader ready, with reduced-motion support.'],
        ].map(([icon, title, body]) => (
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
