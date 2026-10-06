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

const isErrorWithStatusCode = (error: unknown, statusCode: number): boolean => {
  if (!isK8sApiError(error)) return false;
  return error.response?.status === statusCode || error.code === statusCode;
};

/**
 * Check whether an unknown error represents an HTTP 409 Conflict.
 */
export const isConflictError = (error: unknown): boolean => isErrorWithStatusCode(error, 409);

/**
 * Check whether an unknown error represents an HTTP 403 Forbidden.
 */
export const isForbiddenError = (error: unknown): boolean => isErrorWithStatusCode(error, 403);

type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * Maps over a hook return tuple and replaces `any` elements with `K8sApiError | undefined`.
 *
 * @example
 * type FleetClusters = ConvertAnyToK8sApiError<ReturnType<typeof useFleetClusterNames>>;
 * // [string[], boolean, K8sApiError | undefined]
 */
export type ConvertAnyToK8sApiError<T> = T extends readonly unknown[]
  ? { [K in keyof T]: IsAny<T[K]> extends true ? K8sApiError | undefined : T[K] }
  : T;
