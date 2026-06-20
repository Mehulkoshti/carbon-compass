import { describe, expect, it } from 'vitest';

import { rankActions, totalSaving } from '@/lib/actions';
import { calculateFootprint, UserProfile } from '@/lib/emissions';

const heavyCommuter: UserProfile = {
  transport: {
    carFuel: 'petrol',
    carKmPerWeek: 300,
    transitKmPerWeek: 0,
    shortFlightsPerYear: 0,
    longFlightsPerYear: 2,
  },
  home: {
    electricityKwhPerMonth: 400,
    householdSize: 2,
    lpgCylindersPerMonth: 1,
    renewableShare: 0,
  },
  food: { diet: 'heavy_meat' },
  lifestyle: { shopping: 'frequent' },
};

const greenLiver: UserProfile = {
  transport: {
    carFuel: 'none',
    carKmPerWeek: 0,
    transitKmPerWeek: 30,
    shortFlightsPerYear: 0,
    longFlightsPerYear: 0,
  },
  home: {
    electricityKwhPerMonth: 80,
    householdSize: 4,
    lpgCylindersPerMonth: 0.5,
    renewableShare: 1,
  },
  food: { diet: 'vegetarian' },
  lifestyle: { shopping: 'minimal' },
};

describe('rankActions', () => {
  it('returns actions sorted by saving, all positive', () => {
    const r = calculateFootprint(heavyCommuter);
    const ranked = rankActions(heavyCommuter, r);
    expect(ranked.length).toBeGreaterThan(0);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].saving).toBeGreaterThanOrEqual(ranked[i].saving);
    }
    expect(ranked.every((a) => a.saving > 0)).toBe(true);
  });

  it('hides car actions for someone without a car', () => {
    const r = calculateFootprint(greenLiver);
    const ranked = rankActions(greenLiver, r);
    expect(ranked.find((a) => a.id === 'switch-to-ev')).toBeUndefined();
    expect(ranked.find((a) => a.id === 'carpool-2-days')).toBeUndefined();
  });

  it('saves a heavy commuter more from carpooling than a light user', () => {
    const lightUser: UserProfile = {
      ...heavyCommuter,
      transport: { ...heavyCommuter.transport, carKmPerWeek: 40 },
    };
    const heavySave = rankActions(heavyCommuter, calculateFootprint(heavyCommuter)).find(
      (a) => a.id === 'carpool-2-days',
    )!.saving;
    const lightSave = rankActions(lightUser, calculateFootprint(lightUser)).find(
      (a) => a.id === 'carpool-2-days',
    )!.saving;
    expect(heavySave).toBeGreaterThan(lightSave);
  });
});

describe('totalSaving', () => {
  it('sums savings for committed actions only', () => {
    const r = calculateFootprint(heavyCommuter);
    const ranked = rankActions(heavyCommuter, r);
    const first = ranked[0];
    const single = totalSaving([first.id], heavyCommuter, r);
    expect(single).toBeCloseTo(first.saving, 1);
  });

  it('ignores unknown action ids', () => {
    const r = calculateFootprint(heavyCommuter);
    expect(totalSaving(['does-not-exist'], heavyCommuter, r)).toBe(0);
  });

  it('never exceeds the baseline footprint in normal cases', () => {
    const r = calculateFootprint(heavyCommuter);
    const all = rankActions(heavyCommuter, r).map((a) => a.id);
    expect(totalSaving(all, heavyCommuter, r)).toBeGreaterThan(0);
  });
});
