export const PROBE_HTTP_STATUS_CODE_MIN = 100;

export const PROBE_HTTP_STATUS_CODE_MAX_EXCLUSIVE = 600;

export const PROBE_HTTP_STATUS_NOT_FOUND = 404;

/**
 * Lowercase substrings matched against `String(error.message ?? error)` when no HTTP status is
 * present — transport-layer or opaque failures where we must not assume a CRD exists.
 */
export const PROBE_TRANSPORT_ERROR_MESSAGE_SUBSTRINGS = [
  'network',
  'failed to fetch',
  'econnreset',
  'timeout',
  'abort',
  'load failed',
] as const;

export const STORAGE_MIGRATION_PROBE_MULTI_NS_LIST_NON_404_WARN =
  'Multi-namespace storage migration API probe failed with a non-404 error; probing single-namespace KubeVirt API.';
