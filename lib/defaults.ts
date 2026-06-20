import { UserProfile } from './emissions';

/** A sensible starting profile (roughly an average urban Indian individual). */
export const DEFAULT_PROFILE: UserProfile = {
  transport: {
    carFuel: 'petrol',
    carKmPerWeek: 100,
    transitKmPerWeek: 20,
    shortFlightsPerYear: 1,
    longFlightsPerYear: 0,
  },
  home: {
    electricityKwhPerMonth: 250,
    householdSize: 3,
    lpgCylindersPerMonth: 1,
    renewableShare: 0,
    stateCode: 'IN',
  },
  food: { diet: 'moderate_meat' },
  lifestyle: { shopping: 'average' },
};
