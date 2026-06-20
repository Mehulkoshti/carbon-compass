import { describe, expect, it } from 'vitest';

import { computeBadges, earnedCount } from '@/lib/achievements';
import { buildRuleBasedPlan, planTotalSaving } from '@/lib/plan';
import { calculateFootprint, UserProfile } from '@/lib/emissions';

const greenProfile: UserProfile = {
  transport: {
    carFuel: 'none',
    carKmPerWeek: 0,
    transitKmPerWeek: 20,
    shortFlightsPerYear: 0,
    longFlightsPerYear: 0,
  },
  home: {
    electricityKwhPerMonth: 80,
    householdSize: 4,
    lpgCylindersPerMonth: 0.5,
    renewableShare: 1,
    stateCode: 'KL',
  },
  food: { diet: 'vegan' },
  lifestyle: { shopping: 'minimal' },
};

const heavyProfile: UserProfile = {
  transport: {
    carFuel: 'diesel',
    carKmPerWeek: 300,
    transitKmPerWeek: 0,
    shortFlightsPerYear: 2,
    longFlightsPerYear: 2,
  },
  home: {
    electricityKwhPerMonth: 500,
    householdSize: 2,
    lpgCylindersPerMonth: 2,
    renewableShare: 0,
    stateCode: 'CT',
  },
  food: { diet: 'heavy_meat' },
  lifestyle: { shopping: 'frequent' },
};

describe('computeBadges', () => {
  it('awards eco badges to a low-impact profile', () => {
    const result = calculateFootprint(greenProfile);
    const badges = computeBadges({
      profile: greenProfile,
      result,
      history: [],
      committedActions: [],
      goal: null,
    });
    const earned = new Set(badges.filter((b) => b.earned).map((b) => b.id));
    expect(earned.has('plant-power')).toBe(true);
    expect(earned.has('solar-star')).toBe(true);
    expect(earned.has('low-flyer')).toBe(true);
    expect(earned.has('below-global')).toBe(true);
  });

  it('withholds eco badges from a high-impact profile', () => {
    const result = calculateFootprint(heavyProfile);
    const badges = computeBadges({
      profile: heavyProfile,
      result,
      history: [],
      committedActions: [],
      goal: null,
    });
    const earned = new Set(badges.filter((b) => b.earned).map((b) => b.id));
    expect(earned.has('plant-power')).toBe(false);
    expect(earned.has('low-flyer')).toBe(false);
    expect(earned.has('climate-hero')).toBe(false);
    // "first step" is always earned.
    expect(earned.has('first-step')).toBe(true);
  });

  it('awards goal and streak badges from tracking data', () => {
    const result = calculateFootprint(greenProfile);
    const badges = computeBadges({
      profile: greenProfile,
      result,
      history: [
        { month: '2026-04', total: 150 },
        { month: '2026-05', total: 145 },
        { month: '2026-06', total: 140 },
      ],
      committedActions: ['a', 'b', 'c'],
      goal: 200,
    });
    const earned = new Set(badges.filter((b) => b.earned).map((b) => b.id));
    expect(earned.has('streak-3')).toBe(true);
    expect(earned.has('goal-set')).toBe(true);
    expect(earned.has('goal-met')).toBe(true);
    expect(earned.has('action-taker')).toBe(true);
    expect(earnedCount(badges)).toBeGreaterThanOrEqual(4);
  });
});

describe('buildRuleBasedPlan', () => {
  it('produces a 4-week plan with stable task ids', () => {
    const plan = buildRuleBasedPlan(heavyProfile, calculateFootprint(heavyProfile));
    expect(plan.weeks).toHaveLength(4);
    expect(plan.source).toBe('rules');
    const ids = plan.weeks.flatMap((w) => w.tasks.map((t) => t.id));
    expect(new Set(ids).size).toBe(ids.length); // all unique
    expect(plan.weeks.every((w) => w.tasks.length > 0)).toBe(true);
  });

  it('sums task savings into a positive total for a high-impact user', () => {
    const plan = buildRuleBasedPlan(heavyProfile, calculateFootprint(heavyProfile));
    expect(planTotalSaving(plan)).toBeGreaterThan(0);
  });
});
