import { describe, expect, it } from 'vitest';

import {
  addEntry,
  changeFromPrevious,
  computeStreak,
  goalProgress,
  monthKey,
  previousMonth,
} from '@/lib/history';

describe('monthKey & previousMonth', () => {
  it('formats a date as YYYY-MM', () => {
    expect(monthKey(new Date(2026, 5, 20))).toBe('2026-06');
  });

  it('rolls back across a year boundary', () => {
    expect(previousMonth('2026-01')).toBe('2025-12');
    expect(previousMonth('2026-06')).toBe('2026-05');
  });
});

describe('addEntry', () => {
  it('upserts by month rather than duplicating', () => {
    let h = addEntry([], { month: '2026-05', total: 500 });
    h = addEntry(h, { month: '2026-05', total: 400 });
    expect(h).toHaveLength(1);
    expect(h[0].total).toBe(400);
  });

  it('keeps entries sorted ascending by month', () => {
    let h = addEntry([], { month: '2026-06', total: 500 });
    h = addEntry(h, { month: '2026-04', total: 600 });
    h = addEntry(h, { month: '2026-05', total: 550 });
    expect(h.map((e) => e.month)).toEqual(['2026-04', '2026-05', '2026-06']);
  });
});

describe('computeStreak', () => {
  it('counts consecutive months ending at the latest', () => {
    const h = [
      { month: '2026-04', total: 1 },
      { month: '2026-05', total: 1 },
      { month: '2026-06', total: 1 },
    ];
    expect(computeStreak(h)).toBe(3);
  });

  it('breaks the streak when a month is missing', () => {
    const h = [
      { month: '2026-03', total: 1 },
      { month: '2026-05', total: 1 },
      { month: '2026-06', total: 1 },
    ];
    expect(computeStreak(h)).toBe(2);
  });

  it('is zero for empty history', () => {
    expect(computeStreak([])).toBe(0);
  });
});

describe('changeFromPrevious', () => {
  it('is null with fewer than two entries', () => {
    expect(changeFromPrevious([{ month: '2026-06', total: 100 }])).toBeNull();
  });

  it('reports a negative change when the footprint improves', () => {
    const h = [
      { month: '2026-05', total: 500 },
      { month: '2026-06', total: 450 },
    ];
    expect(changeFromPrevious(h)).toBe(-50);
  });
});

describe('goalProgress', () => {
  it('marks the goal met when current is at or below it', () => {
    const p = goalProgress(150, 167, 400);
    expect(p.met).toBe(true);
    expect(p.pct).toBe(100);
  });

  it('reports partial progress between baseline and goal', () => {
    // baseline 400, goal 200, current 300 → halfway → 50%
    const p = goalProgress(300, 200, 400);
    expect(p.met).toBe(false);
    expect(p.pct).toBe(50);
  });

  it('clamps progress to 0..100', () => {
    const p = goalProgress(500, 200, 400); // worse than baseline
    expect(p.pct).toBe(0);
  });
});
