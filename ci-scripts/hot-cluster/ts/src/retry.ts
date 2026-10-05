type ApiErrorShape = {
  body?: { reason?: string } | string;
  reason?: string;
  response?: { body?: { reason?: string } };
  statusCode?: number;
};

const kubernetesApiErrorReason = (err: unknown): string | undefined => {
  const apiErr = err as ApiErrorShape;
  if (apiErr.reason) {
    return apiErr.reason;
  }
  const body = apiErr.body ?? apiErr.response?.body;
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body) as { reason?: string };
      return parsed.reason;
    } catch {
      return undefined;
    }
  }
  return body?.reason;
};

/** Check if an error is retryable (transient network / 5xx). */
export const isRetryableError = (err: unknown): boolean => {
  if (!(err instanceof Error)) return false;
  const status = (err as ApiErrorShape).statusCode;
  if (status !== undefined) {
    if (status >= 500 || status === 429) {
      return true;
    }
    // 409 is used for both transient Conflict (stale resourceVersion) and
    // permanent AlreadyExists -- only the former should be retried.
    if (status === 409) {
      return kubernetesApiErrorReason(err) === 'Conflict';
    }
    return false;
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
