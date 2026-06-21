import { z } from 'zod';
import { AIInvalidResponseError } from './geminiError.js';
import { ACTIVITY_CATEGORIES } from '../../trip/trip.model.js';

// Note: no lat/lng requested or accepted from Gemini here -- the model
// proposes places by name/approximate area only. Resolving those into real
// coordinates (geocoding) is a separate, deterministic concern, not
// something this schema trusts the model to provide directly.
const generatedActivitySchema = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'time must be HH:MM 24-hour format'),
  title: z.string().trim().min(1).max(140),
  description: z.string().trim().max(500).optional().default(''),
  estimatedCost: z.number().min(0),
  category: z.enum(ACTIVITY_CATEGORIES),
  location: z
    .object({
      name: z.string().trim().max(140).optional(),
      approximateArea: z.string().trim().max(140).optional(),
    })
    .optional()
    .default({}),
  durationMinutes: z.number().int().min(1).max(24 * 60),
});

const generatedDaySchema = z.object({
  day: z.number().int().min(1),
  activities: z.array(generatedActivitySchema),
});

export const itineraryResponseSchema = z.object({
  days: z.array(generatedDaySchema).min(1),
  totalEstimatedCost: z.number().min(0),
  notes: z.string().trim().max(1000).optional(),
});

/**
 * Validates the parsed JSON against the exact contract this codebase
 * requires. A response that's syntactically valid JSON but doesn't match
 * this shape (wrong category, missing field, malformed time) is treated
 * identically to malformed JSON -- both throw AIInvalidResponseError and
 * both trigger the same corrective-retry path in retryPolicy.js.
 */
export function validateItineraryResponse(parsed) {
  const result = itineraryResponseSchema.safeParse(parsed);

  if (!result.success) {
    throw new AIInvalidResponseError(
      'Gemini itinerary response did not match the expected schema',
      result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }))
    );
  }

  return result.data;
}

// Deliberately has NO score/rating field anywhere in this schema -- that
// absence is itself the enforcement mechanism. Even if a model tried to
// "helpfully" return a numeric score, it would have nowhere valid to put
// it and the extra field is simply dropped by Zod's default (non-strict)
// parsing rather than trusted.
const explanationResponseSchema = z.object({
  summary: z.string().trim().min(1).max(800),
  recommendations: z.array(z.string().trim().min(1).max(300)).max(5),
  referencedMetrics: z.array(z.string()).max(10),
});

/**
 * Validates the explanation response AND checks that every metric name it
 * references actually existed in the input metrics object. A reference to
 * a metric name that was never provided is a concrete, cheap-to-check
 * signal that the model invented something -- treated as invalid, not
 * silently accepted.
 */
export function validateExplanationResponse(parsed, allowedMetricKeys) {
  const result = explanationResponseSchema.safeParse(parsed);

  if (!result.success) {
    throw new AIInvalidResponseError(
      'Gemini explanation response did not match the expected schema',
      result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }))
    );
  }

  const invalidRefs = result.data.referencedMetrics.filter((m) => !allowedMetricKeys.includes(m));
  if (invalidRefs.length > 0) {
    throw new AIInvalidResponseError('Gemini explanation referenced unknown metrics', { invalidRefs });
  }

  return result.data;
}