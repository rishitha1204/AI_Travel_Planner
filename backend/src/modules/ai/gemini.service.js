import { generateItinerary } from './gemini/usageCases/generateItinerary.usecase.js';
import { explainHealthScore } from './gemini/usageCases/explainHealthScore.usecase.js';

export { AIError } from './gemini/geminiError.js';

/**
 * The ONLY module other parts of the app import for AI functionality.
 * trip/ai/healthScore business logic calls geminiService.*, never anything
 * inside gemini/ directly -- this one-door rule is what makes a future
 * provider swap (or adding a fallback provider) a change contained
 * entirely to this directory.
 */
export const geminiService = {
  generateItinerary,
  explainHealthScore,
};