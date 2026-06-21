import { AITimeoutError, AIRateLimitError, AIInvalidResponseError, AIEmptyResponseError } from './geminiError.js';

const DEFAULT_MAX_ATTEMPTS = 3;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generic retry wrapper, parameterized by error type rather than retrying
 * everything identically:
 *  - Timeout: short, linear backoff -- often just transient latency.
 *  - Rate limit: longer, exponential backoff -- these resolve on a slower
 *    clock than a one-off slow response.
 *  - Invalid/empty response: no backoff at all, but only retried if the
 *    caller supplies `onCorrectiveRetry`, which is expected to mutate
 *    whatever the next attempt will send (e.g. augment the prompt) --
 *    retrying the exact same call would just fail the exact same way.
 *  - Anything else: not retried. An error type with no known strategy is
 *    more likely a real bug than something a retry will fix.
 */
export async function withRetry(fn, { maxAttempts = DEFAULT_MAX_ATTEMPTS, onCorrectiveRetry } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;

      if (attempt === maxAttempts) break;

      if (err instanceof AITimeoutError) {
        await delay(1000 * attempt);
        continue;
      }

      if (err instanceof AIRateLimitError) {
        await delay(2000 * 2 ** attempt);
        continue;
      }

      if (err instanceof AIInvalidResponseError || err instanceof AIEmptyResponseError) {
        if (onCorrectiveRetry) {
          onCorrectiveRetry(err, attempt);
          continue;
        }
        break;
      }

      break;
    }
  }

  throw lastError;
}