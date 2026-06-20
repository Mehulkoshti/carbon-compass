/**
 * Rule-based "coach" used as a deterministic fallback when the Gemini API is
 * unavailable (missing key, rate limit, network error). This guarantees the
 * product always returns useful, personalized guidance and the live demo never
 * breaks during evaluation.
 *
 * The shape returned here is identical to the AI response, so the UI does not
 * care which source produced it.
 */

import { rankActions } from './actions';
import { CATEGORY_LABELS, FootprintResult, UserProfile } from './emissions';

export interface Insight {
  title: string;
  detail: string;
  impact: 'high' | 'medium' | 'low';
}

export interface CoachResponse {
  summary: string;
  insights: Insight[];
  source: 'ai' | 'rules';
}

/** Build a personalized, deterministic coaching response from the numbers. */
export function buildRuleBasedCoach(profile: UserProfile, result: FootprintResult): CoachResponse {
  const { totalMonthly, topCategory, comparison } = result;
  const topLabel = CATEGORY_LABELS[topCategory].toLowerCase();
  const topShare = Math.round((result.breakdown[topCategory] / totalMonthly) * 100);

  const standing =
    comparison.vsParisPct <= 100
      ? `You're already at or below the sustainable target — great work.`
      : comparison.vsIndiaPct <= 100
        ? `You're below the India average but above the climate-safe target.`
        : `You're above the India average, so there's meaningful room to improve.`;

  const summary = `Your estimated footprint is about ${totalMonthly} kg CO2e per month (${result.totalAnnual} kg/year). ${standing} Your biggest source is ${topLabel}, at roughly ${topShare}% of the total.`;

  const ranked = rankActions(profile, result).slice(0, 3);
  const impacts: Insight['impact'][] = ['high', 'medium', 'low'];

  const insights: Insight[] = ranked.map((a, i) => ({
    title: a.title,
    detail: `${a.description} Estimated saving for you: about ${a.saving} kg CO2e per month.`,
    impact: impacts[i] ?? 'low',
  }));

  if (insights.length === 0) {
    insights.push({
      title: 'Maintain your low-carbon habits',
      detail:
        'Your footprint is already lean. Keep tracking monthly and help others start their journey.',
      impact: 'medium',
    });
  }

  return { summary, insights, source: 'rules' };
}
