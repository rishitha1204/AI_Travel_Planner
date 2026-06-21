import { AIInvalidResponseError } from './geminiError.js';

/**
 * Strips markdown code fences the model might add despite instructions not
 * to, then parses JSON. Throws immediately on malformed JSON rather than
 * attempting regex-based partial recovery -- patching broken JSON with
 * regex is fragile and hides the real problem. Failing loud here is what
 * lets retryPolicy.js trigger a corrective re-prompt instead.
 */
export function parseJsonResponse(rawText) {
  const stripped = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(stripped);
  } catch (err) {
    throw new AIInvalidResponseError(
      'Gemini response was not valid JSON',
      { rawTextPreview: stripped.slice(0, 500) },
      err
    );
  }
}