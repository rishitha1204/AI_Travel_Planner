import { z } from 'zod';

export const tripAndScoreIdParamSchema = z.object({
  params: z.object({
    tripId: z.string().min(1, 'Trip ID is required'),
    scoreId: z.string().min(1, 'Score ID is required'),
  }),
});