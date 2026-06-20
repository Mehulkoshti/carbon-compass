import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the Gemini wrapper so no real network calls happen in tests.
vi.mock('@/lib/gemini', () => ({
  generate: vi.fn(),
  chat: vi.fn(),
  geminiAvailable: vi.fn(),
}));

import { POST as insightsPOST } from '@/app/api/insights/route';
import { POST as chatPOST } from '@/app/api/chat/route';
import { POST as scanPOST } from '@/app/api/scan-bill/route';
import { chat, generate, geminiAvailable } from '@/lib/gemini';

const validProfile = {
  transport: {
    carFuel: 'petrol',
    carKmPerWeek: 100,
    transitKmPerWeek: 10,
    shortFlightsPerYear: 0,
    longFlightsPerYear: 0,
  },
  home: {
    electricityKwhPerMonth: 250,
    householdSize: 3,
    lpgCylindersPerMonth: 1,
    renewableShare: 0,
    stateCode: 'MH',
  },
  food: { diet: 'moderate_meat' },
  lifestyle: { shopping: 'average' },
};

function jsonReq(body: unknown) {
  return new Request('http://localhost/api', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `1.2.3.${Math.floor(Math.random() * 250)}` },
    body: JSON.stringify(body),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
}

function rawReq(raw: string) {
  return new Request('http://localhost/api', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: raw,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/insights', () => {
  it('returns the rule-based coach when the AI is unavailable', async () => {
    vi.mocked(generate).mockResolvedValue(null);
    const res = await insightsPOST(jsonReq({ profile: validProfile }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.coach.source).toBe('rules');
    expect(data.result.totalMonthly).toBeGreaterThan(0);
  });

  it('uses the AI coach when Gemini returns valid JSON', async () => {
    vi.mocked(generate).mockResolvedValue(
      JSON.stringify({
        summary: 'ok',
        insights: [{ title: 'A', detail: 'b', impact: 'high' }],
      }),
    );
    const res = await insightsPOST(jsonReq({ profile: validProfile }));
    const data = await res.json();
    expect(data.coach.source).toBe('ai');
  });

  it('rejects an invalid profile with 422', async () => {
    const res = await insightsPOST(jsonReq({ profile: { bad: true } }));
    expect(res.status).toBe(422);
  });

  it('rejects a malformed body with 400', async () => {
    const res = await insightsPOST(rawReq('not json'));
    expect(res.status).toBe(400);
  });
});

describe('POST /api/chat', () => {
  it('returns a grounded reply on success', async () => {
    vi.mocked(chat).mockResolvedValue('Focus on transport first.');
    const res = await chatPOST(
      jsonReq({ profile: validProfile, messages: [{ role: 'user', content: 'hi' }] }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reply).toContain('transport');
  });

  it('falls back to a deterministic reply when AI is unavailable', async () => {
    vi.mocked(chat).mockResolvedValue(null);
    const res = await chatPOST(
      jsonReq({ profile: validProfile, messages: [{ role: 'user', content: 'hi' }] }),
    );
    const data = await res.json();
    expect(typeof data.reply).toBe('string');
    expect(data.reply.length).toBeGreaterThan(0);
  });

  it('rejects when the last message is not from the user', async () => {
    const res = await chatPOST(
      jsonReq({ profile: validProfile, messages: [{ role: 'model', content: 'hi' }] }),
    );
    expect(res.status).toBe(422);
  });
});

describe('POST /api/scan-bill', () => {
  const img = { imageBase64: 'data:image/png;base64,AAAA', mimeType: 'image/png' };

  it('returns 503 when AI is not configured', async () => {
    vi.mocked(geminiAvailable).mockReturnValue(false);
    const res = await scanPOST(jsonReq(img));
    expect(res.status).toBe(503);
  });

  it('extracts kWh from a successful vision response', async () => {
    vi.mocked(geminiAvailable).mockReturnValue(true);
    vi.mocked(generate).mockResolvedValue(
      JSON.stringify({ kwh: 320, confidence: 'high', note: 'found' }),
    );
    const res = await scanPOST(jsonReq(img));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.kwh).toBe(320);
    expect(data.confidence).toBe('high');
  });

  it('rejects an unsupported image type with 422', async () => {
    vi.mocked(geminiAvailable).mockReturnValue(true);
    const res = await scanPOST(jsonReq({ imageBase64: 'x', mimeType: 'image/gif' }));
    expect(res.status).toBe(422);
  });
});
