/**
 * Shape of a Kubernetes API error response.
 * K8s REST errors typically carry `code` and/or a nested `response.status`.
 */
export type K8sApiError = Error & {
  code?: number;
  response?: { status?: number };
};

/**
 * Narrow an unknown caught value to a K8sApiError when it has the expected shape.
 */
export const isK8sApiError = (error: unknown): error is K8sApiError =>
  typeof error === 'object' && error !== null && 'message' in error;

/**
 * Check whether an unknown error represents an HTTP 409 Conflict.
 */
export const isConflictError = (error: unknown): boolean => {
  if (!isK8sApiError(error)) return false;
  return error.response?.status === 409 || error.code === 409;
};
