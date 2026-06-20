/**
 * Achievement / badge logic. Pure and deterministic so it can be unit-tested
 * and computed on the client from data the app already tracks.
 */

import { FootprintResult, UserProfile } from './emissions';
import { computeStreak, HistoryEntry } from './history';

export interface AchievementContext {
  profile: UserProfile;
  result: FootprintResult;
  history: HistoryEntry[];
  committedActions: string[];
  goal: number | null;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
}

export function computeBadges(ctx: AchievementContext): Badge[] {
  const { profile, result, history, committedActions, goal } = ctx;
  const streak = computeStreak(history);

  const badges: Badge[] = [
    {
      id: 'first-step',
      icon: '🧭',
      title: 'First step',
      description: 'Calculated your footprint for the first time.',
      earned: true,
    },
    {
      id: 'logged',
      icon: '📝',
      title: 'Getting started',
      description: 'Logged your footprint at least once.',
      earned: history.length >= 1,
    },
    {
      id: 'streak-3',
      icon: '🔥',
      title: 'On a roll',
      description: 'Logged 3 months in a row.',
      earned: streak >= 3,
    },
    {
      id: 'streak-6',
      icon: '⚡',
      title: 'Committed',
      description: 'Logged 6 months in a row.',
      earned: streak >= 6,
    },
    {
      id: 'goal-set',
      icon: '🎯',
      title: 'Goal setter',
      description: 'Set a monthly reduction goal.',
      earned: goal !== null,
    },
    {
      id: 'goal-met',
      icon: '🏆',
      title: 'Goal crusher',
      description: 'Reached your monthly goal.',
      earned: goal !== null && result.totalMonthly <= goal,
    },
    {
      id: 'action-taker',
      icon: '✅',
      title: 'Action taker',
      description: 'Committed to 3 or more reduction actions.',
      earned: committedActions.length >= 3,
    },
    {
      id: 'below-global',
      icon: '🌿',
      title: 'Below average',
      description: 'Footprint below the global average.',
      earned: result.totalMonthly <= result.comparison.globalAvg,
    },
    {
      id: 'climate-hero',
      icon: '🌍',
      title: 'Climate hero',
      description: 'At or below the climate-safe target.',
      earned: result.comparison.vsParisPct <= 100,
    },
    {
      id: 'plant-power',
      icon: '🥗',
      title: 'Plant power',
      description: 'Following a vegetarian or vegan diet.',
      earned: profile.food.diet === 'vegan' || profile.food.diet === 'vegetarian',
    },
    {
      id: 'solar-star',
      icon: '☀️',
      title: 'Solar star',
      description: 'Half or more of your electricity is renewable.',
      earned: profile.home.renewableShare >= 0.5,
    },
    {
      id: 'low-flyer',
      icon: '🌱',
      title: 'Low flyer',
      description: 'No long-haul flights this year.',
      earned: profile.transport.longFlightsPerYear === 0,
    },
  ];

  return badges;
}

export function earnedCount(badges: Badge[]): number {
  return badges.filter((b) => b.earned).length;
}
