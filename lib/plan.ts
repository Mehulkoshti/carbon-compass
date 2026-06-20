/**
 * 30-day reduction plan types and a deterministic fallback builder (used when
 * Gemini is unavailable). The plan spreads the user's highest-impact actions
 * across four themed weeks plus a few easy supporting habits.
 */

import { rankActions } from './actions';
import { Category, FootprintResult, UserProfile } from './emissions';

export interface PlanTask {
  id: string;
  title: string;
  detail: string;
  category: Category | 'habit';
  estSaving: number;
}

export interface PlanWeek {
  week: number;
  theme: string;
  tasks: PlanTask[];
}

export interface Plan {
  weeks: PlanWeek[];
  source: 'ai' | 'rules';
}

const HABITS = [
  'Switch off and unplug devices you’re not using this week.',
  'Carry a reusable bottle and bag every day this week.',
  'Plan meals to cut food waste this week.',
  'Take the stairs / walk for short trips this week.',
];

export function buildRuleBasedPlan(profile: UserProfile, result: FootprintResult): Plan {
  const ranked = rankActions(profile, result);
  const themes = ['Quick wins', 'Transport & travel', 'Home & energy', 'Food & habits'];

  const weeks: PlanWeek[] = themes.map((theme, w) => {
    const action = ranked[w];
    const tasks: PlanTask[] = [];
    if (action) {
      tasks.push({
        id: `w${w + 1}-action`,
        title: action.title,
        detail: `${action.description} Estimated saving: ~${action.saving} kg CO2e/month.`,
        category: action.category,
        estSaving: action.saving,
      });
    }
    tasks.push({
      id: `w${w + 1}-habit`,
      title: 'Build an easy habit',
      detail: HABITS[w % HABITS.length],
      category: 'habit',
      estSaving: 0,
    });
    return { week: w + 1, theme, tasks };
  });

  return { weeks, source: 'rules' };
}

export function planTotalSaving(plan: Plan): number {
  return (
    Math.round(
      plan.weeks.flatMap((w) => w.tasks).reduce((s, t) => s + (t.estSaving || 0), 0) * 10,
    ) / 10
  );
}
