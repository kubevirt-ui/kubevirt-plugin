import {
  PROBE_HTTP_STATUS_CODE_MAX_EXCLUSIVE,
  PROBE_HTTP_STATUS_CODE_MIN,
  PROBE_HTTP_STATUS_NOT_FOUND,
  PROBE_TRANSPORT_ERROR_MESSAGE_SUBSTRINGS,
} from './probeConstants';

const toFiniteHttpStatus = (value: unknown): null | number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value >= PROBE_HTTP_STATUS_CODE_MIN && value < PROBE_HTTP_STATUS_CODE_MAX_EXCLUSIVE
      ? value
      : null;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) &&
      parsed >= PROBE_HTTP_STATUS_CODE_MIN &&
      parsed < PROBE_HTTP_STATUS_CODE_MAX_EXCLUSIVE
      ? parsed
      : null;
  }
  return null;
};

export const getProbeHttpStatus = (error: unknown): null | number => {
  const e = error as {
    code?: unknown;
    response?: { status?: unknown };
    status?: unknown;
    statusCode?: unknown;
  };
  const fromResponse = toFiniteHttpStatus(e?.response?.status);
  if (fromResponse !== null) return fromResponse;
  const fromStatusCode = toFiniteHttpStatus(e?.statusCode);
  if (fromStatusCode !== null) return fromStatusCode;
  const fromStatus = toFiniteHttpStatus(e?.status);
  if (fromStatus !== null) return fromStatus;
  return toFiniteHttpStatus(e?.code);
};

export const isStorageMigrationResourceNotFound = (error: unknown): boolean =>
  getProbeHttpStatus(error) === PROBE_HTTP_STATUS_NOT_FOUND;

export const isProbeTransportOrLikelyUnknownError = (error: unknown): boolean => {
  if (getProbeHttpStatus(error) !== null) return false;
  if (error == null) return true;
  if (error instanceof TypeError) return true;
  const msg = String((error as Error)?.message ?? error).toLowerCase();
  return PROBE_TRANSPORT_ERROR_MESSAGE_SUBSTRINGS.some((fragment) => msg.includes(fragment));
};
