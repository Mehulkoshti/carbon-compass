import { describe, expect, it } from 'vitest';

import {
  BENCHMARKS,
  calculateFootprint,
  carMonthly,
  foodMonthly,
  homeMonthly,
  UserProfile,
} from '@/lib/emissions';

const base: UserProfile = {
  transport: {
    carFuel: 'petrol',
    carKmPerWeek: 100,
    transitKmPerWeek: 0,
    shortFlightsPerYear: 0,
    longFlightsPerYear: 0,
  },
  home: {
    electricityKwhPerMonth: 300,
    householdSize: 3,
    lpgCylindersPerMonth: 1,
    renewableShare: 0,
  },
  food: { diet: 'moderate_meat' },
  lifestyle: { shopping: 'average' },
};

describe('carMonthly', () => {
  it('multiplies weekly km by weeks-per-month and the fuel factor', () => {
    // 100 km/wk * 4.345 * 0.192 ≈ 83.4
    expect(carMonthly(base)).toBeCloseTo(83.4, 1);
  });

  it('is zero when there is no car', () => {
    expect(carMonthly({ ...base, transport: { ...base.transport, carFuel: 'none' } })).toBe(0);
  });

  it('an EV emits far less than petrol for the same distance', () => {
    const ev = carMonthly({ ...base, transport: { ...base.transport, carFuel: 'ev' } });
    expect(ev).toBeLessThan(carMonthly(base));
  });
});

describe('homeMonthly', () => {
  it('divides household electricity and gas by household size', () => {
    const single = homeMonthly({ ...base, home: { ...base.home, householdSize: 1 } });
    const shared = homeMonthly({ ...base, home: { ...base.home, householdSize: 3 } });
    expect(shared).toBeCloseTo(single / 3, 1);
  });

  it('renewable share reduces electricity emissions', () => {
    const dirty = homeMonthly(base);
    const clean = homeMonthly({ ...base, home: { ...base.home, renewableShare: 1 } });
    expect(clean).toBeLessThan(dirty);
  });
});

describe('foodMonthly', () => {
  it('ranks diets from vegan (lowest) to heavy meat (highest)', () => {
    const vegan = foodMonthly({ ...base, food: { diet: 'vegan' } });
    const heavy = foodMonthly({ ...base, food: { diet: 'heavy_meat' } });
    expect(vegan).toBeLessThan(heavy);
  });
});

describe('calculateFootprint', () => {
  it('sums the four categories into the monthly total', () => {
    const r = calculateFootprint(base);
    const sum = r.breakdown.transport + r.breakdown.home + r.breakdown.food + r.breakdown.lifestyle;
    expect(r.totalMonthly).toBeCloseTo(sum, 1);
  });

  it('annual total is twelve months', () => {
    const r = calculateFootprint(base);
    expect(r.totalAnnual).toBeCloseTo(r.totalMonthly * 12, 0);
  });

  it('identifies the largest category as topCategory', () => {
    const r = calculateFootprint(base);
    const maxValue = Math.max(...Object.values(r.breakdown));
    expect(r.breakdown[r.topCategory]).toBe(maxValue);
  });

  it('compares against the India benchmark correctly', () => {
    const r = calculateFootprint(base);
    expect(r.comparison.vsIndiaPct).toBeCloseTo((r.totalMonthly / BENCHMARKS.indiaAvg) * 100, 0);
  });

  it('handles an empty / zero profile without crashing', () => {
    const zero: UserProfile = {
      transport: {
        carFuel: 'none',
        carKmPerWeek: 0,
        transitKmPerWeek: 0,
        shortFlightsPerYear: 0,
        longFlightsPerYear: 0,
      },
      home: {
        electricityKwhPerMonth: 0,
        householdSize: 1,
        lpgCylindersPerMonth: 0,
        renewableShare: 0,
      },
      food: { diet: 'vegan' },
      lifestyle: { shopping: 'minimal' },
    };
    const r = calculateFootprint(zero);
    expect(r.totalMonthly).toBeGreaterThan(0); // food + lifestyle floors
    expect(r.breakdown.transport).toBe(0);
  });
});
