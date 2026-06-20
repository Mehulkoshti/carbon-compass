import { Feature } from '@/lib/landing';

/** A single landing-page feature card: icon, description, how-to hint and location. */
export function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <li className="flex flex-col rounded-2xl border border-brand-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
      <span
        aria-hidden="true"
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-2xl"
      >
        {feature.icon}
      </span>
      <h4 className="mt-3 font-display font-bold text-slate-900">{feature.title}</h4>
      <p className="mt-1 flex-1 text-sm text-slate-600">{feature.desc}</p>
      <p className="mt-3 rounded-lg bg-brand-50 p-2 text-xs text-brand-700">
        <strong>How:</strong> {feature.how}
      </p>
      <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
        📍 {feature.where}
      </span>
    </li>
  );
}
