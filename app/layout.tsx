import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'CarbonCompass — Understand, track & reduce your carbon footprint',
  description:
    'A personal carbon footprint awareness platform. Estimate your monthly emissions, get AI-personalized insights, and track simple actions to reduce them.',
  keywords: ['carbon footprint', 'sustainability', 'climate', 'emissions calculator'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>

        <header className="border-b border-brand-100 bg-white">
          <nav
            aria-label="Primary"
            className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3"
          >
            <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
              <span aria-hidden="true" className="text-xl">
                🧭
              </span>
              CarbonCompass
            </Link>
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link href="/calculator" className="hover:text-brand-700">
                Calculator
              </Link>
              <Link href="/dashboard" className="hover:text-brand-700">
                Dashboard
              </Link>
            </div>
          </nav>
        </header>

        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-brand-100 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-slate-500">
            <p>
              CarbonCompass · Estimates are for awareness only. Built for the
              Carbon Footprint Awareness challenge.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
