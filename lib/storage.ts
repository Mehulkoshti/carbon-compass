/**
 * Typed localStorage helpers. All access is SSR-safe (guards `window`) and
 * wrapped in try/catch so private-mode / disabled-storage never crashes the app.
 *
 * We persist on the client only — no personal data ever leaves the browser,
 * which keeps the app private by design and removes the need for a database.
 */

import { FootprintResult, UserProfile } from './emissions';
import { HistoryEntry } from './history';

const KEYS = {
  profile: 'cc.profile',
  result: 'cc.result',
  actions: 'cc.actions',
  history: 'cc.history',
  goal: 'cc.goal',
  planDone: 'cc.planDone',
} as const;

function read<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or disabled — fail silently */
  }
}

export const storage = {
  saveProfile: (p: UserProfile) => write(KEYS.profile, p),
  loadProfile: () => read<UserProfile>(KEYS.profile),

  saveResult: (r: FootprintResult) => write(KEYS.result, r),
  loadResult: () => read<FootprintResult>(KEYS.result),

  saveActions: (ids: string[]) => write(KEYS.actions, ids),
  loadActions: () => read<string[]>(KEYS.actions) ?? [],

  saveHistory: (h: HistoryEntry[]) => write(KEYS.history, h),
  loadHistory: () => read<HistoryEntry[]>(KEYS.history) ?? [],

  saveGoal: (g: number) => write(KEYS.goal, g),
  loadGoal: () => read<number>(KEYS.goal),

  savePlanDone: (ids: string[]) => write(KEYS.planDone, ids),
  loadPlanDone: () => read<string[]>(KEYS.planDone) ?? [],

  clear: () => {
    if (typeof window === 'undefined') return;
    Object.values(KEYS).forEach((k) => {
      try {
        window.localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    });
  },
};
