import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-brand-100 bg-white p-8 text-center shadow-sm">
      <p className="text-5xl" aria-hidden="true">
        🧭
      </p>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
      >
        Back to home
      </Link>
    </div>
  );
}
