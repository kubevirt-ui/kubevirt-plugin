import type { TFunction } from 'i18next';

type ErrorWithStatus = {
  code?: number | string;
  message?: string;
  response?: {
    status?: number | string;
  };
  status?: number | string;
  statusCode?: number | string;
};

type LoadedError = {
  error?: unknown;
  loaded?: boolean;
};

const FORBIDDEN_STATUS = 403;

export const getClusterMetricsUnavailableTitle = (t: TFunction): string => t('Metrics unavailable');

export const getClusterMetricsUnavailableMessage = (t: TFunction): string =>
  t(
    'You do not have permission to view cluster metrics/alerts. Contact your administrator for access.',
  );

export const getClusterMetricsNotAvailableLabel = (t: TFunction): string => t('Not available');

const hasForbiddenStatus = (value: unknown): boolean =>
  value === FORBIDDEN_STATUS || value === String(FORBIDDEN_STATUS);

export const isForbiddenError = (error: unknown): boolean => {
  if (!error) return false;

  if (typeof error === 'string') {
    return /forbidden/i.test(error);
  }

  const err = error as ErrorWithStatus;
  if (
    hasForbiddenStatus(err.code) ||
    hasForbiddenStatus(err.status) ||
    hasForbiddenStatus(err.statusCode) ||
    hasForbiddenStatus(err.response?.status)
  ) {
    return true;
  }

  const message = err.message ?? (error instanceof Error ? error.message : '');
  return /forbidden/i.test(message);
};

export const hasForbiddenLoadedError = (series: LoadedError[]): boolean =>
  series.some((item) => Boolean(item.loaded) && isForbiddenError(item.error));
