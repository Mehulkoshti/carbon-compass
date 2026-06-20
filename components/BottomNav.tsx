'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/calculator', label: 'Calculator', icon: '🧮' },
  { href: '/simulate', label: 'Simulate', icon: '🎚️' },
  { href: '/plan', label: 'Plan', icon: '🗓️' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
];

/** App-style bottom tab bar, shown only on mobile (header nav handles desktop). */
export function BottomNav() {
  const path = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-100 bg-white/95 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md">
        {TABS.map((t) => {
          const active = t.href === '/' ? path === '/' : path.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium leading-tight transition ${
                  active ? 'text-brand-700' : 'text-slate-400 hover:text-brand-600'
                }`}
              >
                <span aria-hidden="true" className={`text-lg ${active ? '' : 'grayscale'}`}>
                  {t.icon}
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
