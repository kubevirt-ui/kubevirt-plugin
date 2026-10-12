/** Check if an error is retryable (transient network / 5xx). */
export const isRetryableError = (err: unknown): boolean => {
  if (!(err instanceof Error)) return false;
  const status = (err as { statusCode?: number }).statusCode;
  if (status !== undefined) {
    return status >= 500 || status === 429;
  }
  const code = (err as { code?: string }).code;
  return code === 'ECONNRESET' || code === 'ETIMEDOUT' || code === 'ENOTFOUND';
};

/** Retry an async function with exponential backoff. */
export const withRetry = async <T>(
  retryFn: () => Promise<T>,
  label?: string,
  maxAttempts?: number,
): Promise<T> => {
  const resolvedAttempts = maxAttempts ?? 3;
  const baseDelay = 1000;
  const resolvedLabel = label ?? 'operation';

  let lastError: unknown;
  for (let attempt = 1; attempt <= resolvedAttempts; attempt++) {
    try {
      return await retryFn();
    } catch (err) {
      lastError = err;
      if (attempt === resolvedAttempts || !isRetryableError(err)) {
        break;
      }
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(
        `${resolvedLabel}: attempt ${attempt}/${resolvedAttempts} failed, retrying in ${delay}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};
