import { generateContent } from '../gemini.client.js';
import { buildHealthScoreExplanationPrompt } from '../promptBuilder.js';
import { parseJsonResponse } from '../responseParser.js';
import { validateExplanationResponse } from '../responseValidator.js';
import { withRetry } from '../retryPolicy.js';
import { logger } from '../../../../utils/logger.js';

/**
 * Receives ONLY the already-computed metrics object -- never the trip or
 * itinerary. This function has no database access and no way to see any
 * information beyond what's passed in, which is what makes "Gemini cannot
 * influence the score" a structural guarantee rather than a request made
 * in the prompt wording.
 *
 * Deliberately simpler retry behavior than itinerary generation (2
 * attempts, no corrective re-prompt): explanation failure degrades
 * gracefully elsewhere (healthScore.service.js persists the score before
 * ever calling this), so it isn't worth spending as much retry budget or
 * Gemini cost on it as on itinerary generation, where failure has no
 * fallback.
 */
export async function explainHealthScore(metrics, { requestId } = {}) {
  const allowedMetricKeys = Object.keys(metrics);
  const prompt = buildHealthScoreExplanationPrompt(metrics);

  return withRetry(
    async (attempt) => {
      logger.info({ requestId, attempt }, 'calling Gemini for health score explanation');
      const rawText = await generateContent({ prompt });
      const parsed = parseJsonResponse(rawText);
      return validateExplanationResponse(parsed, allowedMetricKeys);
    },
    { maxAttempts: 2 }
  );
}