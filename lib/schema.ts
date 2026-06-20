/**
 * Zod schemas — the single source of truth for validating untrusted input,
 * both in the browser form and on the server API route. Bounding every numeric
 * field prevents nonsensical or abusive payloads (Security + robustness).
 */

import { z } from 'zod';

import { REGION_CODES } from './states';

const km = z.number().min(0).max(100000);
const count = z.number().min(0).max(1000);

export const userProfileSchema = z.object({
  transport: z.object({
    carFuel: z.enum(['none', 'petrol', 'diesel', 'ev']),
    carKmPerWeek: km,
    transitKmPerWeek: km,
    shortFlightsPerYear: count,
    longFlightsPerYear: count,
  }),
  home: z.object({
    electricityKwhPerMonth: z.number().min(0).max(100000),
    householdSize: z.number().int().min(1).max(50),
    lpgCylindersPerMonth: z.number().min(0).max(100),
    renewableShare: z.number().min(0).max(1),
    stateCode: z.enum(REGION_CODES as [string, ...string[]]).optional(),
  }),
  food: z.object({
    diet: z.enum(['vegan', 'vegetarian', 'eggetarian', 'moderate_meat', 'heavy_meat']),
  }),
  lifestyle: z.object({
    shopping: z.enum(['minimal', 'average', 'frequent']),
  }),
});

export const insightsRequestSchema = z.object({
  profile: userProfileSchema,
});

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string().min(1).max(2000),
});

export const chatRequestSchema = z.object({
  profile: userProfileSchema,
  messages: z.array(chatMessageSchema).min(1).max(20),
});

const imageSchema = z.object({
  // data URL or raw base64 of the uploaded image; bounded to ~6MB base64.
  imageBase64: z.string().min(1).max(8_000_000),
  mimeType: z.enum(['image/png', 'image/jpeg', 'image/webp']),
});

export const scanBillRequestSchema = imageSchema;
export const scanMealRequestSchema = imageSchema;

export const planRequestSchema = z.object({
  profile: userProfileSchema,
});

export type ValidatedProfile = z.infer<typeof userProfileSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
