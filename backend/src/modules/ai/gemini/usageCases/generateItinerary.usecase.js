import { generateContent } from '../gemini.client.js';
import { buildItineraryPrompt, CORRECTIVE_INSTRUCTION } from '../promptBuilder.js';
import { parseJsonResponse } from '../responseParser.js';
import { validateItineraryResponse } from '../responseValidator.js';
import { withRetry } from '../retryPolicy.js';
import { logger } from '../../../../utils/logger.js';

/**
 * Reconciles the model's stated total against a server-computed sum of its
 * own line items, and TRUSTS THE COMPUTED NUMBER, never the model's. A
 * mismatch is recorded, not silently swallowed -- it's a useful signal of
 * response quality even when the itinerary itself is otherwise usable.
 */
function reconcileCost(itinerary) {
  const computedTotal = itinerary.days.reduce(
    (sum, day) => sum + day.activities.reduce((daySum, activity) => daySum + activity.estimatedCost, 0),
    0
  );

  const mismatch = Math.abs(computedTotal - itinerary.totalEstimatedCost) > 0.01;

  return {
    ...itinerary,
    totalEstimatedCost: computedTotal,
    costReconciliation: {
      modelStatedTotal: itinerary.totalEstimatedCost,
      computedTotal,
      mismatch,
    },
  };
}

export async function generateItinerary(input, { requestId } = {}) {
  let prompt = buildItineraryPrompt(input);

  const result = await withRetry(
    async (attempt) => {
      logger.info({ requestId, attempt }, 'calling Gemini for itinerary generation');
      const rawText = await generateContent({ prompt });
      const parsed = parseJsonResponse(rawText);
      const validated = validateItineraryResponse(parsed);
      return validated;
    },
    {
      maxAttempts: 3,
      onCorrectiveRetry: (err, attempt) => {
        logger.warn(
          { requestId, attempt, reason: err.constructor.name },
          'Gemini response invalid -- retrying with corrective prompt'
        );
        prompt = buildItineraryPrompt(input) + CORRECTIVE_INSTRUCTION;
      },
    }
  );

  return reconcileCost(result);
}