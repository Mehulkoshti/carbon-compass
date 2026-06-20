/**
 * POST /api/scan-bill
 *
 * Accepts a photo of an electricity bill and uses Gemini Vision to extract the
 * monthly consumption in kWh, so users don't have to read the number off the
 * bill themselves.
 *
 * Security: image type & size validated via Zod; key stays server-side; rate
 * limited. Returns { kwh: number | null, confidence, note } — null when the
 * value can't be read confidently, so the UI can ask the user to type it.
 */

import { NextRequest, NextResponse } from 'next/server';

import { generate, geminiAvailable } from '@/lib/gemini';
import { clientIp, rateLimit } from '@/lib/ratelimit';
import { scanBillRequestSchema } from '@/lib/schema';

export const runtime = 'nodejs';

const PROMPT = `You are reading an electricity bill image. Find the billed ELECTRICITY CONSUMPTION for the period, in kilowatt-hours (kWh / units).
If the bill shows a two-month period, estimate the per-month value.
Respond with STRICT JSON only: {"kwh": number | null, "confidence": "high"|"medium"|"low", "note": string}.
Set kwh to null if you cannot find it. Do not guess wildly; lower the confidence instead.`;

export async function POST(req: NextRequest) {
  if (rateLimit(`scan:${clientIp(req.headers)}`, 8, 60_000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  if (!geminiAvailable()) {
    return NextResponse.json(
      { error: 'Bill scanning needs an AI key. Please enter your usage manually.' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = scanBillRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid image (allowed: PNG/JPEG/WebP, up to ~6MB).' },
      { status: 422 },
    );
  }

  // Accept both raw base64 and data URLs.
  const data = parsed.data.imageBase64.replace(/^data:[^;]+;base64,/, '');

  const text = await generate(
    [{ text: PROMPT }, { inlineData: { data, mimeType: parsed.data.mimeType } }],
    { json: true, temperature: 0.1 },
  );

  if (!text) {
    return NextResponse.json(
      { error: 'Could not read the bill right now. Please enter usage manually.' },
      { status: 502 },
    );
  }

  try {
    const out = JSON.parse(text) as { kwh?: number | null; confidence?: string; note?: string };
    const kwh =
      typeof out.kwh === 'number' && Number.isFinite(out.kwh) && out.kwh > 0 && out.kwh < 100000
        ? Math.round(out.kwh)
        : null;
    return NextResponse.json({
      kwh,
      confidence: ['high', 'medium', 'low'].includes(out.confidence ?? '')
        ? out.confidence
        : 'low',
      note: String(out.note ?? '').slice(0, 200),
    });
  } catch {
    return NextResponse.json(
      { error: 'Unexpected response. Please enter usage manually.' },
      { status: 502 },
    );
  }
}
