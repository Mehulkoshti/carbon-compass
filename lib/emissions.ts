/**
 * Carbon footprint calculation engine.
 *
 * All emission factors are expressed in kg CO2e and sourced from publicly
 * available references (IPCC, India CEA grid factor, DEFRA conversion factors,
 * Our World in Data dietary footprints). Figures are deliberately rounded and
 * meant for awareness/estimation — not regulatory accounting.
 *
 * Every function here is pure (no I/O, no globals) so it can be unit-tested and
 * reused on both the server and the client.
 */

import { gridFactorFor } from './states';

export type CarFuel = 'none' | 'petrol' | 'diesel' | 'ev';
export type DietType =
  | 'vegan'
  | 'vegetarian'
  | 'eggetarian'
  | 'moderate_meat'
  | 'heavy_meat';
export type ShoppingLevel = 'minimal' | 'average' | 'frequent';

export type Category = 'transport' | 'home' | 'food' | 'lifestyle';

export interface UserProfile {
  transport: {
    carFuel: CarFuel;
    carKmPerWeek: number;
    transitKmPerWeek: number;
    shortFlightsPerYear: number;
    longFlightsPerYear: number;
  };
  home: {
    electricityKwhPerMonth: number;
    householdSize: number;
    lpgCylindersPerMonth: number;
    /** Share of electricity from rooftop solar / green tariff, 0..1. */
    renewableShare: number;
    /** Grid region code (see lib/states.ts). Defaults to national average. */
    stateCode?: string;
  };
  food: { diet: DietType };
  lifestyle: { shopping: ShoppingLevel };
}

/** Emission factors (kg CO2e). See module doc for sources. */
export const FACTORS = {
  /** Per km driven, by fuel type. EV uses India grid intensity × typical efficiency. */
  carPerKm: { none: 0, petrol: 0.192, diesel: 0.171, ev: 0.05 } as Record<CarFuel, number>,
  /** Per passenger-km on bus/metro. */
  transitPerKm: 0.05,
  /** Per flight (round figures incl. radiative forcing). */
  shortFlight: 250,
  longFlight: 1100,
  /** India average grid intensity, per kWh. */
  electricityPerKwh: 0.71,
  /** Per 14.2 kg domestic LPG cylinder. */
  lpgCylinder: 42,
  /** Monthly dietary footprint, per person. */
  diet: {
    vegan: 125,
    vegetarian: 140,
    eggetarian: 155,
    moderate_meat: 210,
    heavy_meat: 275,
  } as Record<DietType, number>,
  /** Monthly footprint of goods/services by shopping habit, per person. */
  shopping: { minimal: 40, average: 90, frequent: 180 } as Record<ShoppingLevel, number>,
} as const;

const WEEKS_PER_MONTH = 4.345;
const MONTHS_PER_YEAR = 12;

const round = (n: number): number => Math.round(n * 10) / 10;
const nonNeg = (n: number): number => (Number.isFinite(n) && n > 0 ? n : 0);

/* ------------------------------------------------------------------ */
/* Per-category helpers (exported so actions & tests can reuse them).  */
/* ------------------------------------------------------------------ */

export function carMonthly(p: UserProfile): number {
  const factor = FACTORS.carPerKm[p.transport.carFuel] ?? 0;
  return nonNeg(p.transport.carKmPerWeek) * WEEKS_PER_MONTH * factor;
}

export function transitMonthly(p: UserProfile): number {
  return nonNeg(p.transport.transitKmPerWeek) * WEEKS_PER_MONTH * FACTORS.transitPerKm;
}

export function flightsMonthly(p: UserProfile): number {
  const yearly =
    nonNeg(p.transport.shortFlightsPerYear) * FACTORS.shortFlight +
    nonNeg(p.transport.longFlightsPerYear) * FACTORS.longFlight;
  return yearly / MONTHS_PER_YEAR;
}

export function transportMonthly(p: UserProfile): number {
  return carMonthly(p) + transitMonthly(p) + flightsMonthly(p);
}

/**
 * Personal share of household electricity emissions (after renewables), using
 * the state-specific grid factor when available.
 */
export function electricityMonthlyPerPerson(p: UserProfile): number {
  const household = Math.max(1, Math.floor(nonNeg(p.home.householdSize)) || 1);
  const renewable = Math.min(1, Math.max(0, p.home.renewableShare));
  const gridFactor = gridFactorFor(p.home.stateCode);
  const gross = nonNeg(p.home.electricityKwhPerMonth) * gridFactor * (1 - renewable);
  return gross / household;
}

export function homeMonthly(p: UserProfile): number {
  const household = Math.max(1, Math.floor(nonNeg(p.home.householdSize)) || 1);
  const cooking = (nonNeg(p.home.lpgCylindersPerMonth) * FACTORS.lpgCylinder) / household;
  return electricityMonthlyPerPerson(p) + cooking;
}

export function foodMonthly(p: UserProfile): number {
  return FACTORS.diet[p.food.diet] ?? FACTORS.diet.moderate_meat;
}

export function lifestyleMonthly(p: UserProfile): number {
  return FACTORS.shopping[p.lifestyle.shopping] ?? FACTORS.shopping.average;
}

/* ------------------------------------------------------------------ */
/* Reference averages (monthly kg CO2e per person).                   */
/* ------------------------------------------------------------------ */

export const BENCHMARKS = {
  /** India per-capita ≈ 1.9 t/yr. */
  indiaAvg: round((1900 / MONTHS_PER_YEAR) * 1),
  /** Global per-capita ≈ 4.7 t/yr. */
  globalAvg: round((4700 / MONTHS_PER_YEAR) * 1),
  /** Paris-aligned sustainable target ≈ 2.0 t/yr. */
  parisTarget: round((2000 / MONTHS_PER_YEAR) * 1),
} as const;

export interface Breakdown {
  transport: number;
  home: number;
  food: number;
  lifestyle: number;
}

export interface FootprintResult {
  breakdown: Breakdown;
  totalMonthly: number;
  totalAnnual: number;
  topCategory: Category;
  comparison: {
    indiaAvg: number;
    globalAvg: number;
    parisTarget: number;
    /** % of the Paris-aligned target (100 = exactly on target). */
    vsParisPct: number;
    /** % of the India average (100 = exactly average). */
    vsIndiaPct: number;
  };
}

/** Compute the full footprint breakdown for a user profile. */
export function calculateFootprint(p: UserProfile): FootprintResult {
  const breakdown: Breakdown = {
    transport: round(transportMonthly(p)),
    home: round(homeMonthly(p)),
    food: round(foodMonthly(p)),
    lifestyle: round(lifestyleMonthly(p)),
  };

  const totalMonthly = round(
    breakdown.transport + breakdown.home + breakdown.food + breakdown.lifestyle,
  );

  const topCategory = (Object.keys(breakdown) as Category[]).reduce((top, key) =>
    breakdown[key] > breakdown[top] ? key : top,
  );

  return {
    breakdown,
    totalMonthly,
    totalAnnual: round(totalMonthly * MONTHS_PER_YEAR),
    topCategory,
    comparison: {
      indiaAvg: BENCHMARKS.indiaAvg,
      globalAvg: BENCHMARKS.globalAvg,
      parisTarget: BENCHMARKS.parisTarget,
      vsParisPct: round((totalMonthly / BENCHMARKS.parisTarget) * 100),
      vsIndiaPct: round((totalMonthly / BENCHMARKS.indiaAvg) * 100),
    },
  };
}

export const CATEGORY_LABELS: Record<Category, string> = {
  transport: 'Transport',
  home: 'Home energy',
  food: 'Food & diet',
  lifestyle: 'Shopping & lifestyle',
};
