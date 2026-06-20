/**
 * Indian state-level electricity grid emission factors (kg CO2e per kWh).
 *
 * The factor a person's electricity carries depends heavily on how their state
 * generates power — a coal-heavy grid emits far more per unit than a
 * hydro/renewable-heavy one. Using a state-specific factor (instead of one
 * national average) makes the footprint and the advice genuinely context-aware.
 *
 * Values are approximate, derived from public generation-mix data, and meant
 * for awareness. 'IN' is the national average fallback.
 */

export interface GridRegion {
  code: string;
  name: string;
  /** kg CO2e per kWh. */
  factor: number;
}

export const GRID_REGIONS: GridRegion[] = [
  { code: 'IN', name: 'India (national average)', factor: 0.71 },
  { code: 'AP', name: 'Andhra Pradesh', factor: 0.7 },
  { code: 'AS', name: 'Assam & North-East', factor: 0.45 },
  { code: 'BR', name: 'Bihar', factor: 0.85 },
  { code: 'CT', name: 'Chhattisgarh', factor: 0.95 },
  { code: 'DL', name: 'Delhi', factor: 0.72 },
  { code: 'GA', name: 'Goa', factor: 0.7 },
  { code: 'GJ', name: 'Gujarat', factor: 0.68 },
  { code: 'HR', name: 'Haryana', factor: 0.8 },
  { code: 'HP', name: 'Himachal Pradesh', factor: 0.1 },
  { code: 'JK', name: 'Jammu & Kashmir', factor: 0.2 },
  { code: 'JH', name: 'Jharkhand', factor: 0.95 },
  { code: 'KA', name: 'Karnataka', factor: 0.55 },
  { code: 'KL', name: 'Kerala', factor: 0.35 },
  { code: 'MP', name: 'Madhya Pradesh', factor: 0.85 },
  { code: 'MH', name: 'Maharashtra', factor: 0.82 },
  { code: 'OR', name: 'Odisha', factor: 0.88 },
  { code: 'PB', name: 'Punjab', factor: 0.75 },
  { code: 'RJ', name: 'Rajasthan', factor: 0.7 },
  { code: 'TN', name: 'Tamil Nadu', factor: 0.65 },
  { code: 'TG', name: 'Telangana', factor: 0.72 },
  { code: 'UK', name: 'Uttarakhand', factor: 0.3 },
  { code: 'UP', name: 'Uttar Pradesh', factor: 0.88 },
  { code: 'WB', name: 'West Bengal', factor: 0.9 },
];

const REGION_MAP = new Map(GRID_REGIONS.map((r) => [r.code, r]));

export const DEFAULT_GRID_FACTOR = 0.71;

/** Grid emission factor for a region code, falling back to the national average. */
export function gridFactorFor(code: string | undefined): number {
  if (!code) return DEFAULT_GRID_FACTOR;
  return REGION_MAP.get(code)?.factor ?? DEFAULT_GRID_FACTOR;
}

export function regionName(code: string | undefined): string {
  if (!code) return 'India (national average)';
  return REGION_MAP.get(code)?.name ?? 'India (national average)';
}

export const REGION_CODES = GRID_REGIONS.map((r) => r.code);
