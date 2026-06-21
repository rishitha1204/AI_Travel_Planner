import { GoogleGenAI } from '@google/genai';
import { env } from '../../../config/env.js';
import { AITimeoutError, AIRateLimitError, AIEmptyResponseError, AIProviderError } from './geminiError.js';

const REQUEST_TIMEOUT_MS = 200000;

const client = new GoogleGenAI({ apiKey: env.gemini.apiKey });

function isRateLimitError(err) {
  return err?.status === 429 || err?.code === 429 || /rate.?limit/i.test(err?.message ?? '');
}

function timeoutAfter(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new AITimeoutError(`Gemini request timed out after ${ms}ms`)), ms);
  });
}

/**
 * Calls the Gemini API and returns its raw text output. This is the ONLY
 * module in the entire codebase that imports the Gemini SDK -- every other
 * file in this project talks to gemini.service.js, never to the SDK or
 * this client directly. Swapping providers later is contained entirely to
 * this file plus the error-mapping logic below.
 */
export async function generateContent({ prompt, model = env.gemini.model, timeoutMs = REQUEST_TIMEOUT_MS }) {
  let response;

  try {
    response = await Promise.race([
      client.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      }),
      timeoutAfter(timeoutMs),
    ]);
  } catch (err) {
    if (err instanceof AITimeoutError) throw err;
    if (isRateLimitError(err)) throw new AIRateLimitError('Gemini rate limit exceeded', err);
    throw new AIProviderError('Gemini request failed', err);
  }

  const text = response.text ?? '';
  if (!text.trim()) {
    throw new AIEmptyResponseError('Gemini returned an empty response');
  }

  return text;
}