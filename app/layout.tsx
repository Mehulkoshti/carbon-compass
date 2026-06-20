import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Inter, Sora } from 'next/font/google';
import { BottomNav } from '@/components/BottomNav';
import { FloatingChat } from '@/components/FloatingChat';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { ToastProvider } from '@/components/Toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
  weight: ['600', '700', '800'],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const title = 'CarbonCompass — Understand, track & reduce your carbon footprint';
const description =
  'A personal carbon footprint awareness platform. Estimate your monthly emissions, get AI-personalized insights, scan your electricity bill, and track simple actions to reduce them.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: ['carbon footprint', 'sustainability', 'climate', 'emissions calculator', 'AI'],
  applicationName: 'CarbonCompass',
  openGraph: {
    title,
    description,
    siteName: 'CarbonCompass',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  appleWebApp: {
    capable: true,
    title: 'CarbonCompass',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#059669',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <ToastProvider>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>

        <header className="sticky top-0 z-40 border-b border-brand-100/70 bg-white/80 backdrop-blur-md">
          <nav
            aria-label="Primary"
            className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3"
          >
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2 font-display text-lg font-bold text-brand-700"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-base shadow-soft"
              >
                🧭
              </span>
              <span>CarbonCompass</span>
            </Link>
            <div className="hidden items-center gap-0.5 text-sm font-medium sm:flex">
              {[
                ['/calculator', 'Calculator'],
                ['/simulate', 'Simulate'],
                ['/plan', 'Plan'],
                ['/dashboard', 'Dashboard'],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </header>

        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 pt-10 pb-28 sm:pb-10">
          {children}
        </main>

        <footer className="border-t border-brand-100 bg-white">
          <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 text-sm text-slate-500 sm:pb-6">
            <p>
              CarbonCompass · Estimates are for awareness only. Built for the
              Carbon Footprint Awareness challenge.
            </p>
          </div>
        </footer>

        {/* Floating AI coach, available on every page */}
        <FloatingChat />
        {/* App-style bottom tab bar (mobile only) */}
        <BottomNav />
        <ServiceWorkerRegister />
        </ToastProvider>
      </body>
    </html>
  );
}
