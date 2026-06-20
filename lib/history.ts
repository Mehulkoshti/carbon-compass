/**
 * Footprint history, streaks and goal logic.
 *
 * All functions are pure and date-injectable (the caller passes the current
 * month) so they are fully unit-testable. A "month" is the string "YYYY-MM".
 */

export interface HistoryEntry {
  month: string;
  total: number;
}

const MAX_ENTRIES = 24;

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** The month immediately before the given "YYYY-MM" key. */
export function previousMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const date = new Date(y, m - 1, 1);
  date.setMonth(date.getMonth() - 1);
  return monthKey(date);
}

/** Upsert an entry by month, keeping the list sorted ascending and capped. */
export function addEntry(history: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  const others = history.filter((h) => h.month !== entry.month);
  return [...others, entry].sort((a, b) => a.month.localeCompare(b.month)).slice(-MAX_ENTRIES);
}

export function latestEntry(history: HistoryEntry[]): HistoryEntry | null {
  if (history.length === 0) return null;
  return history.reduce((latest, h) => (h.month > latest.month ? h : latest));
}

/** Consecutive months with a check-in, counting back from the most recent. */
export function computeStreak(history: HistoryEntry[]): number {
  const latest = latestEntry(history);
  if (!latest) return 0;
  const months = new Set(history.map((h) => h.month));
  let streak = 0;
  let cursor = latest.month;
  while (months.has(cursor)) {
    streak += 1;
    cursor = previousMonth(cursor);
  }
  return streak;
}

/** Change in total vs the previous recorded month (negative = improvement). */
export function changeFromPrevious(history: HistoryEntry[]): number | null {
  if (history.length < 2) return null;
  const sorted = [...history].sort((a, b) => a.month.localeCompare(b.month));
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];
  return Math.round((last.total - prev.total) * 10) / 10;
}

export interface GoalProgress {
  goal: number;
  current: number;
  met: boolean;
  /** How far between a sensible baseline and the goal the user has come, 0..100. */
  pct: number;
}

export function goalProgress(current: number, goal: number, baseline: number): GoalProgress {
  const met = current <= goal;
  let pct = 0;
  if (baseline > goal) {
    pct = Math.round(((baseline - current) / (baseline - goal)) * 100);
  } else if (met) {
    pct = 100;
  }
  return { goal, current, met, pct: Math.max(0, Math.min(100, pct)) };
}
