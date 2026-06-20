/**
 * Catalog of concrete reduction actions.
 *
 * Each action estimates the monthly CO2e it would save *for this specific user*
 * by re-using the emission engine — that is the "logical decision making based
 * on user context" requirement: the same action saves a heavy commuter far more
 * than someone who already takes the metro.
 */

import {
  carMonthly,
  electricityMonthlyPerPerson,
  FACTORS,
  flightsMonthly,
  FootprintResult,
  UserProfile,
} from './emissions';

export type Effort = 'easy' | 'medium' | 'ambitious';

export interface ReductionAction {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'home' | 'food' | 'lifestyle';
  effort: Effort;
  /** Estimated monthly kg CO2e saved for the given profile. */
  estimateSaving: (p: UserProfile, r: FootprintResult) => number;
  /** Whether this action is relevant to the user (hides irrelevant tips). */
  isRelevant: (p: UserProfile, r: FootprintResult) => boolean;
}

const round = (n: number): number => Math.round(n * 10) / 10;

export const ACTIONS: ReductionAction[] = [
  {
    id: 'carpool-2-days',
    title: 'Carpool or take transit 2 days a week',
    description:
      'Leave the car at home for two commute days and share a ride or take the bus/metro instead.',
    category: 'transport',
    effort: 'easy',
    // Saves ~2/7 of weekly car emissions.
    estimateSaving: (p) => round(carMonthly(p) * (2 / 7)),
    isRelevant: (p) => p.transport.carFuel !== 'none' && p.transport.carKmPerWeek > 0,
  },
  {
    id: 'switch-to-ev',
    title: 'Switch to an electric vehicle',
    description: 'Replacing a petrol/diesel vehicle with an EV cuts most of its per-km emissions.',
    category: 'transport',
    effort: 'ambitious',
    estimateSaving: (p) => {
      if (p.transport.carFuel === 'none' || p.transport.carFuel === 'ev') return 0;
      const current = carMonthly(p);
      const asEv = current * (FACTORS.carPerKm.ev / FACTORS.carPerKm[p.transport.carFuel]);
      return round(current - asEv);
    },
    isRelevant: (p) =>
      (p.transport.carFuel === 'petrol' || p.transport.carFuel === 'diesel') &&
      p.transport.carKmPerWeek > 0,
  },
  {
    id: 'one-less-long-flight',
    title: 'Take one less long-haul flight per year',
    description: 'A single long-haul return flight can outweigh months of other choices.',
    category: 'transport',
    effort: 'medium',
    estimateSaving: () => round(FACTORS.longFlight / 12),
    isRelevant: (p) => p.transport.longFlightsPerYear >= 1,
  },
  {
    id: 'rooftop-solar',
    title: 'Switch to rooftop solar or a green tariff',
    description: 'Offset most of your grid electricity with renewable generation.',
    category: 'home',
    effort: 'ambitious',
    // Offsets ~70% of remaining grid electricity emissions.
    estimateSaving: (p) => round(electricityMonthlyPerPerson(p) * 0.7),
    isRelevant: (p) => p.home.renewableShare < 0.9 && p.home.electricityKwhPerMonth > 0,
  },
  {
    id: 'efficient-cooling',
    title: 'Set AC to 24°C and switch to LED/efficient appliances',
    description: 'Efficient cooling and lighting trims roughly 15% off electricity use.',
    category: 'home',
    effort: 'easy',
    estimateSaving: (p) => round(electricityMonthlyPerPerson(p) * 0.15),
    isRelevant: (p) => p.home.electricityKwhPerMonth > 0,
  },
  {
    id: 'meatless-days',
    title: 'Go meat-free 3 days a week',
    description: 'Shifting a few meals a week toward plants noticeably lowers your food footprint.',
    category: 'food',
    effort: 'easy',
    // Moves ~3/7 of the way from the current diet toward a vegetarian footprint.
    estimateSaving: (p, r) => {
      const veg = FACTORS.diet.vegetarian;
      return round(Math.max(0, r.breakdown.food - veg) * (3 / 7));
    },
    isRelevant: (p) =>
      p.food.diet === 'eggetarian' ||
      p.food.diet === 'moderate_meat' ||
      p.food.diet === 'heavy_meat',
  },
  {
    id: 'plant-based',
    title: 'Move to a mostly plant-based diet',
    description: 'A predominantly plant-based diet is one of the highest-impact food choices.',
    category: 'food',
    effort: 'ambitious',
    estimateSaving: (p, r) => round(Math.max(0, r.breakdown.food - FACTORS.diet.vegan) * 0.7),
    isRelevant: (p) => p.food.diet !== 'vegan' && p.food.diet !== 'vegetarian',
  },
  {
    id: 'buy-less-secondhand',
    title: 'Buy less, choose second-hand & repair',
    description: 'Extending the life of clothes and gadgets avoids new manufacturing emissions.',
    category: 'lifestyle',
    effort: 'medium',
    // Cuts ~40% of discretionary goods emissions.
    estimateSaving: (p, r) => round(r.breakdown.lifestyle * 0.4),
    isRelevant: (p) => p.lifestyle.shopping !== 'minimal',
  },
];

export interface RankedAction extends ReductionAction {
  saving: number;
}

/** Relevant actions for a user, ranked by estimated monthly saving (desc). */
export function rankActions(p: UserProfile, r: FootprintResult): RankedAction[] {
  return ACTIONS.filter((a) => a.isRelevant(p, r))
    .map((a) => ({ ...a, saving: a.estimateSaving(p, r) }))
    .filter((a) => a.saving > 0)
    .sort((a, b) => b.saving - a.saving);
}

/** Total monthly saving from a set of committed action ids. */
export function totalSaving(ids: string[], p: UserProfile, r: FootprintResult): number {
  const set = new Set(ids);
  return round(
    ACTIONS.filter((a) => set.has(a.id)).reduce((sum, a) => sum + a.estimateSaving(p, r), 0),
  );
}
