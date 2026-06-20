/**
 * Thin server-side wrapper around the Gemini SDK.
 *
 * Centralizes: API-key handling (server-only), the model fallback list (a
 * transient 503 on one model falls through to the next), and the request
 * shapes used across our routes. Every export returns `null` on failure so
 * callers can degrade gracefully instead of throwing.
 */

import { GoogleGenerativeAI, type Content, type Part } from '@google/generative-ai';

const MODELS = (process.env.GEMINI_MODEL || 'gemini-2.5-flash,gemini-2.0-flash,gemini-flash-latest')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

function client(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY;
  return key ? new GoogleGenerativeAI(key) : null;
}

export function geminiAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

interface GenerateOpts {
  systemInstruction?: string;
  json?: boolean;
  temperature?: number;
}

/** Run a prompt (string or multimodal parts) across the model fallback list. */
export async function generate(
  prompt: string | Part[],
  opts: GenerateOpts = {},
): Promise<string | null> {
  const genAI = client();
  if (!genAI) return null;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: opts.systemInstruction,
        generationConfig: {
          temperature: opts.temperature ?? 0.6,
          ...(opts.json ? { responseMimeType: 'application/json' } : {}),
        },
      });
      // The SDK accepts a plain string or a flat array of Parts for a single turn.
      const resp = await model.generateContent(prompt);
      const text = resp.response.text();
      if (text && text.trim()) return text;
    } catch {
      // Transient failure (e.g. 503/429) → try the next model.
    }
  }
  return null;
}

/** Multi-turn chat across the model fallback list. */
export async function chat(
  history: Content[],
  message: string,
  systemInstruction: string,
): Promise<string | null> {
  const genAI = client();
  if (!genAI) return null;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
      const session = model.startChat({
        history,
        generationConfig: { temperature: 0.6, maxOutputTokens: 600 },
      });
      const resp = await session.sendMessage(message);
      const text = resp.response.text();
      if (text && text.trim()) return text;
    } catch {
      // Try the next model.
    }
  }
  return null;
}
