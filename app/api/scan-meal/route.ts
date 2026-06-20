/**
 * POST /api/scan-meal
 *
 * Accepts a photo of a meal (or grocery receipt) and uses Gemini Vision to
 * estimate its food carbon footprint, itemized.
 *
 * Security: image type & size validated; key stays server-side; rate limited.
 * Returns { items: [{name, kg}], totalKg, note } — empty items if unreadable.
 */

import { NextRequest, NextResponse } from 'next/server';

import { generate, geminiAvailable } from '@/lib/gemini';
import { clientIp, rateLimit } from '@/lib/ratelimit';
import { scanMealRequestSchema } from '@/lib/schema';

export const runtime = 'nodejs';

const PROMPT = `You are a food-carbon estimator. Look at this meal or grocery photo and identify the main food items and their approximate carbon footprint in kg CO2e (typical per-serving / per-item values).
Respond with STRICT JSON only:
{"items": [{"name": string, "kg": number}], "totalKg": number, "note": string}
Keep to at most 6 items. If you cannot identify food, return an empty items array and totalKg 0.`;

interface MealItem {
  name: string;
  kg: number;
}

export async function POST(req: NextRequest) {
  if (rateLimit(`meal:${clientIp(req.headers)}`, 8, 60_000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  if (!geminiAvailable()) {
    return NextResponse.json({ error: 'Meal scanning needs an AI key.' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = scanMealRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid image (allowed: PNG/JPEG/WebP, up to ~6MB).' },
      { status: 422 },
    );
  }

  const data = parsed.data.imageBase64.replace(/^data:[^;]+;base64,/, '');

  const text = await generate(
    [{ text: PROMPT }, { inlineData: { data, mimeType: parsed.data.mimeType } }],
    { json: true, temperature: 0.2 },
  );

  if (!text) {
    return NextResponse.json({ error: 'Could not analyze the photo right now.' }, { status: 502 });
  }

  try {
    const out = JSON.parse(text) as { items?: MealItem[]; totalKg?: number; note?: string };
    const items: MealItem[] = Array.isArray(out.items)
      ? out.items
          .slice(0, 6)
          .map((i) => ({
            name: String(i.name ?? '').slice(0, 60),
            kg:
              typeof i.kg === 'number' && i.kg >= 0 && i.kg < 1000
                ? Math.round(i.kg * 100) / 100
                : 0,
          }))
          .filter((i) => i.name)
      : [];
    const totalKg =
      typeof out.totalKg === 'number' && out.totalKg >= 0
        ? Math.round(out.totalKg * 100) / 100
        : Math.round(items.reduce((s, i) => s + i.kg, 0) * 100) / 100;
    return NextResponse.json({ items, totalKg, note: String(out.note ?? '').slice(0, 200) });
  } catch {
    return NextResponse.json({ error: 'Unexpected response.' }, { status: 502 });
  }
}
