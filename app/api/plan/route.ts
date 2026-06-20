/**
 * POST /api/plan
 *
 * Generates a personalized 30-day (4-week) carbon-reduction plan. Gemini frames
 * the plan from the user's computed footprint and ranked actions; it never
 * invents savings. Falls back to a deterministic rule-based plan on any failure.
 */

import { NextRequest, NextResponse } from 'next/server';

import { rankActions } from '@/lib/actions';
import { calculateFootprint, CATEGORY_LABELS } from '@/lib/emissions';
import { generate } from '@/lib/gemini';
import { buildRuleBasedPlan, Plan, PlanTask, PlanWeek } from '@/lib/plan';
import { clientIp, rateLimit } from '@/lib/ratelimit';
import { planRequestSchema } from '@/lib/schema';

export const runtime = 'nodejs';

type Profile = ReturnType<typeof planRequestSchema.parse>['profile'];

const CATEGORIES = ['transport', 'home', 'food', 'lifestyle', 'habit'];

async function generateWithGemini(profile: Profile): Promise<Plan | null> {
  const result = calculateFootprint(profile);
  const ranked = rankActions(profile, result).slice(0, 6);

  const prompt = `You are a carbon-reduction coach. Build a motivating 4-week (30-day) plan for this person using ONLY the data below. Do not invent savings numbers; reuse the action savings given.

Monthly footprint: ${result.totalMonthly} kg CO2e. Biggest source: ${CATEGORY_LABELS[result.topCategory]}.
Breakdown: transport ${result.breakdown.transport}, home ${result.breakdown.home}, food ${result.breakdown.food}, lifestyle ${result.breakdown.lifestyle}.
High-impact actions (with monthly savings): ${ranked
    .map((a) => `${a.title} (${a.category}, ~${a.saving} kg)`)
    .join('; ')}.

Respond with STRICT JSON only:
{"weeks":[{"week":1,"theme":string,"tasks":[{"title":string,"detail":string,"category":"transport"|"home"|"food"|"lifestyle"|"habit","estSaving":number}]}]}
Exactly 4 weeks. 2-3 tasks per week. Start with the easiest, highest-impact changes. Keep details under 30 words.`;

  const text = await generate(prompt, { json: true });
  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as { weeks?: PlanWeek[] };
    if (!Array.isArray(parsed.weeks) || parsed.weeks.length === 0) return null;

    const weeks: PlanWeek[] = parsed.weeks.slice(0, 4).map((w, wi) => ({
      week: wi + 1,
      theme: String(w.theme ?? `Week ${wi + 1}`).slice(0, 60),
      tasks: (Array.isArray(w.tasks) ? w.tasks : []).slice(0, 3).map((t, ti): PlanTask => ({
        id: `w${wi + 1}-${ti}`,
        title: String(t.title ?? '').slice(0, 100),
        detail: String(t.detail ?? '').slice(0, 240),
        category: (CATEGORIES.includes(t.category) ? t.category : 'habit') as PlanTask['category'],
        estSaving:
          typeof t.estSaving === 'number' && t.estSaving >= 0 && t.estSaving < 10000
            ? Math.round(t.estSaving * 10) / 10
            : 0,
      })).filter((t) => t.title),
    }));

    if (weeks.every((w) => w.tasks.length === 0)) return null;
    return { weeks, source: 'ai' };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (rateLimit(`plan:${clientIp(req.headers)}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = planRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid profile.' }, { status: 422 });
  }

  const { profile } = parsed.data;
  const result = calculateFootprint(profile);
  const plan = (await generateWithGemini(profile)) ?? buildRuleBasedPlan(profile, result);

  return NextResponse.json({ plan });
}
