/**
 * Typed errors for every distinct way a Gemini interaction can fail.
 * retryPolicy.js dispatches on these types to pick a strategy per failure
 * mode (short backoff for timeouts, longer for rate limits, a corrective
 * re-prompt for malformed JSON) rather than treating every failure the
 * same way.
 */
export class AIError extends Error {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
  }
}

export class AITimeoutError extends AIError {}

export class AIRateLimitError extends AIError {}

export class AIEmptyResponseError extends AIError {}

export class AIInvalidResponseError extends AIError {
  constructor(message, details = null, cause) {
    super(message, cause);
    this.details = details;
  }
}

// Catch-all for unexpected SDK/network failures that don't fit one of the
// specific categories above -- still typed, so callers can distinguish
// "Gemini itself failed" from any other kind of error in the request.
export class AIProviderError extends AIError {}