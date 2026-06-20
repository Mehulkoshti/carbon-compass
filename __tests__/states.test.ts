import { describe, expect, it } from 'vitest';

import { electricityMonthlyPerPerson, UserProfile } from '@/lib/emissions';
import { DEFAULT_GRID_FACTOR, gridFactorFor, regionName } from '@/lib/states';

describe('gridFactorFor', () => {
  it('returns the national default for unknown / missing codes', () => {
    expect(gridFactorFor(undefined)).toBe(DEFAULT_GRID_FACTOR);
    expect(gridFactorFor('ZZ')).toBe(DEFAULT_GRID_FACTOR);
  });

  it('returns a lower factor for a hydro-heavy state than a coal-heavy one', () => {
    expect(gridFactorFor('HP')).toBeLessThan(gridFactorFor('CT'));
  });
});

describe('regionName', () => {
  it('falls back to the national label for unknown codes', () => {
    expect(regionName('ZZ')).toContain('India');
  });
});

describe('state-aware electricity emissions', () => {
  const base: UserProfile = {
    transport: {
      carFuel: 'none',
      carKmPerWeek: 0,
      transitKmPerWeek: 0,
      shortFlightsPerYear: 0,
      longFlightsPerYear: 0,
    },
    home: {
      electricityKwhPerMonth: 300,
      householdSize: 1,
      lpgCylindersPerMonth: 0,
      renewableShare: 0,
    },
    food: { diet: 'vegan' },
    lifestyle: { shopping: 'minimal' },
  };

  it('a coal-heavy state produces higher electricity emissions than a clean one', () => {
    const coal = electricityMonthlyPerPerson({
      ...base,
      home: { ...base.home, stateCode: 'CT' },
    });
    const clean = electricityMonthlyPerPerson({
      ...base,
      home: { ...base.home, stateCode: 'HP' },
    });
    expect(coal).toBeGreaterThan(clean);
  });
});
