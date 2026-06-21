import { z } from 'zod';

export const generateItinerarySchema = z.object({
  preferences: z.string().trim().max(300).optional(),
  pace: z.enum(['relaxed', 'moderate', 'packed']).default('moderate'),
});