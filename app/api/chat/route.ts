/**
 * POST /api/chat
 *
 * A grounded, multi-turn carbon coach. The model is given the user's computed
 * footprint as system context and constrained to that topic, so answers are
 * specific to *this* person rather than generic climate chat.
 *
 * Degrades gracefully: if Gemini is unavailable, returns a deterministic reply
 * built from the user's top reduction action.
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Content } from '@google/generative-ai';

import { rankActions } from '@/lib/actions';
import { calculateFootprint, CATEGORY_LABELS } from '@/lib/emissions';
import { chat } from '@/lib/gemini';
import { clientIp, rateLimit } from '@/lib/ratelimit';
import { chatRequestSchema } from '@/lib/schema';
import { regionName } from '@/lib/states';

export const runtime = 'nodejs';

type Body = ReturnType<typeof chatRequestSchema.parse>;

function systemInstructionFor(profile: Body['profile']): string {
  const r = calculateFootprint(profile);
  const ranked = rankActions(profile, r).slice(0, 5);
  return `You are CarbonCompass, a warm, practical personal carbon-footprint coach.
Only discuss this user's carbon footprint and how to reduce it. Politely decline unrelated topics.
Be concise (under 120 words), encouraging, and specific. Never invent numbers — use only those below.

User's data (kg CO2e per month):
- Region: ${regionName(profile.home.stateCode)}
- Total: ${r.totalMonthly} (${r.totalAnnual}/year); India average is ${r.comparison.indiaAvg}, sustainable target ${r.comparison.parisTarget}
- Breakdown: transport ${r.breakdown.transport}, home ${r.breakdown.home}, food ${r.breakdown.food}, lifestyle ${r.breakdown.lifestyle}
- Biggest source: ${CATEGORY_LABELS[r.topCategory]}
- Highest-impact actions for them: ${ranked.map((a) => `${a.title} (~${a.saving} kg/mo)`).join('; ')}`;
}

function fallbackReply(profile: Body['profile']): string {
  const r = calculateFootprint(profile);
  const top = rankActions(profile, r)[0];
  const base = `Your footprint is about ${r.totalMonthly} kg CO2e/month, and your biggest source is ${CATEGORY_LABELS[
    r.topCategory
  ].toLowerCase()}.`;
  return top
    ? `${base} The single highest-impact change for you is "${top.title}" — roughly ${top.saving} kg CO2e/month. Want to start there?`
    : `${base} You're already doing well — keep tracking monthly to maintain it.`;
}

export async function POST(req: NextRequest) {
  if (rateLimit(`chat:${clientIp(req.headers)}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 422 });
  }

  const { profile, messages } = parsed.data;
  const last = messages[messages.length - 1];
  if (last.role !== 'user') {
    return NextResponse.json({ error: 'Last message must be from the user.' }, { status: 422 });
  }

  // Prior turns become Gemini history; the latest user message is sent now.
  const history: Content[] = messages.slice(0, -1).map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const reply =
    (await chat(history, last.content, systemInstructionFor(profile))) ?? fallbackReply(profile);

  return NextResponse.json({ reply, grounded: true });
}
