/**
 * POST /api/insights
 *
 * Generates a personalized coaching response for a user's carbon profile.
 *
 * Security / robustness:
 *  - The Gemini API key stays server-side (see lib/gemini.ts).
 *  - The request body is validated with Zod.
 *  - Requests are rate limited per IP.
 *  - Any AI failure degrades gracefully to the deterministic rule-based coach,
 *    so the endpoint always responds.
 */

import { NextRequest, NextResponse } from 'next/server';

import { calculateFootprint, CATEGORY_LABELS } from '@/lib/emissions';
import { buildRuleBasedCoach, CoachResponse, Insight } from '@/lib/insights';
import { rankActions } from '@/lib/actions';
import { regionName } from '@/lib/states';
import { generate } from '@/lib/gemini';
import { clientIp, rateLimit } from '@/lib/ratelimit';
import { insightsRequestSchema } from '@/lib/schema';

export const runtime = 'nodejs';

type Profile = ReturnType<typeof insightsRequestSchema.parse>['profile'];

async function generateWithGemini(profile: Profile): Promise<CoachResponse | null> {
  const result = calculateFootprint(profile);
  const ranked = rankActions(profile, result).slice(0, 5);

  // The model never does maths — it only frames and prioritizes the numbers we
  // already computed, so insights stay grounded and reproducible.
  const prompt = `You are a friendly, concise carbon-footprint coach. Using ONLY the data below, write encouraging, specific guidance. Do not invent numbers.

Region: ${regionName(profile.home.stateCode)}.
Monthly footprint: ${result.totalMonthly} kg CO2e (${result.totalAnnual} kg/year).
Breakdown (kg/month): transport ${result.breakdown.transport}, home ${result.breakdown.home}, food ${result.breakdown.food}, lifestyle ${result.breakdown.lifestyle}.
Biggest source: ${CATEGORY_LABELS[result.topCategory]}.
Vs India average (${result.comparison.indiaAvg} kg/mo): ${result.comparison.vsIndiaPct}%. Sustainable target: ${result.comparison.parisTarget} kg/mo.
Candidate actions with estimated monthly savings: ${ranked
    .map((a) => `${a.title} (~${a.saving} kg)`)
    .join('; ')}.

Respond with STRICT JSON only, no markdown:
{"summary": string, "insights": [{"title": string, "detail": string, "impact": "high"|"medium"|"low"}]}
Provide exactly 3 insights ordered most to least impactful.`;

  const text = await generate(prompt, { json: true });
  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as { summary?: string; insights?: Insight[] };
    if (!parsed.summary || !Array.isArray(parsed.insights) || parsed.insights.length === 0) {
      return null;
    }
    const insights: Insight[] = parsed.insights.slice(0, 3).map((i) => ({
      title: String(i.title ?? '').slice(0, 120),
      detail: String(i.detail ?? '').slice(0, 400),
      impact: (['high', 'medium', 'low'] as const).includes(i.impact) ? i.impact : 'medium',
    }));
    return { summary: String(parsed.summary).slice(0, 600), insights, source: 'ai' };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (rateLimit(`insights:${clientIp(req.headers)}`, 15, 60_000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = insightsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid profile.', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { profile } = parsed.data;
  const result = calculateFootprint(profile);
  const coach = (await generateWithGemini(profile)) ?? buildRuleBasedCoach(profile, result);

  return NextResponse.json({ result, coach });
}
