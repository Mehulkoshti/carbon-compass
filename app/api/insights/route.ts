/**
 * POST /api/insights
 *
 * Generates a personalized coaching response for a user's carbon profile.
 *
 * Security / robustness notes:
 *  - The Gemini API key is read from a server-only env var and never reaches
 *    the browser.
 *  - The request body is validated with Zod before use.
 *  - In-memory rate limiting throttles abusive clients.
 *  - Any AI failure (missing key, quota, malformed output) degrades gracefully
 *    to the deterministic rule-based coach, so the endpoint always responds.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { calculateFootprint, CATEGORY_LABELS } from '@/lib/emissions';
import { buildRuleBasedCoach, CoachResponse, Insight } from '@/lib/insights';
import { rankActions } from '@/lib/actions';
import { insightsRequestSchema } from '@/lib/schema';

export const runtime = 'nodejs';

// --- naive in-memory rate limit (per instance) -----------------------------
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 15;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

// Tried in order; a transient failure on one falls through to the next, and
// only if all fail do we degrade to the deterministic rule-based coach.
const MODELS = (process.env.GEMINI_MODEL || 'gemini-2.5-flash,gemini-2.0-flash,gemini-flash-latest')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

async function generateWithGemini(
  profile: ReturnType<typeof insightsRequestSchema.parse>['profile'],
): Promise<CoachResponse | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const result = calculateFootprint(profile);
  const ranked = rankActions(profile, result).slice(0, 5);

  // We feed the model the already-computed numbers and the candidate actions,
  // and ask only for natural-language framing + prioritization. The model never
  // does the maths, so insights stay grounded and reproducible.
  const prompt = `You are a friendly, concise carbon-footprint coach. Using ONLY the data below, write encouraging, specific guidance for this person. Do not invent numbers; use the figures provided.

Monthly footprint: ${result.totalMonthly} kg CO2e (${result.totalAnnual} kg/year).
Breakdown (kg/month): transport ${result.breakdown.transport}, home ${result.breakdown.home}, food ${result.breakdown.food}, lifestyle ${result.breakdown.lifestyle}.
Biggest source: ${CATEGORY_LABELS[result.topCategory]}.
Compared to India average (${result.comparison.indiaAvg} kg/mo): ${result.comparison.vsIndiaPct}%. Sustainable target: ${result.comparison.parisTarget} kg/mo.
Candidate actions with estimated monthly savings: ${ranked
    .map((a) => `${a.title} (~${a.saving} kg)`)
    .join('; ')}.

Respond with STRICT JSON only, no markdown, in this exact shape:
{"summary": string, "insights": [{"title": string, "detail": string, "impact": "high"|"medium"|"low"}]}
Provide exactly 3 insights ordered most to least impactful.`;

  const genAI = new GoogleGenerativeAI(key);

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json', temperature: 0.6 },
      });
      const resp = await model.generateContent(prompt);
      const text = resp.response.text();
      const parsed = JSON.parse(text) as { summary?: string; insights?: Insight[] };

      if (!parsed.summary || !Array.isArray(parsed.insights) || parsed.insights.length === 0) {
        continue;
      }
      const insights: Insight[] = parsed.insights.slice(0, 3).map((i) => ({
        title: String(i.title ?? '').slice(0, 120),
        detail: String(i.detail ?? '').slice(0, 400),
        impact: (['high', 'medium', 'low'] as const).includes(i.impact) ? i.impact : 'medium',
      }));
      return { summary: String(parsed.summary).slice(0, 600), insights, source: 'ai' };
    } catch {
      // Transient model error (e.g. 503 high demand) → try the next model.
      continue;
    }
  }
  // All models failed → caller falls back to the rule-based coach.
  return null;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429 },
    );
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

  const ai = await generateWithGemini(profile);
  const coach = ai ?? buildRuleBasedCoach(profile, result);

  return NextResponse.json({ result, coach });
}
