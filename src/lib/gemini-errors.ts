import { APICallError, RetryError } from 'ai';

export function friendlyErrorMessage(error: unknown): string {
  const apiError = RetryError.isInstance(error)
    ? error.errors.find((e) => APICallError.isInstance(e))
    : APICallError.isInstance(error)
      ? error
      : undefined;

  if (apiError && APICallError.isInstance(apiError)) {
    if (apiError.statusCode === 429 || apiError.statusCode === 503) {
      return 'The Gemini API is rate-limited or overloaded right now. Please wait a moment and try again.';
    }
    if (apiError.statusCode === 404) {
      return 'The configured Gemini model is unavailable. Check the model ID is still current.';
    }
  }

  return 'Something went wrong while checking fit. Please try again.';
}
