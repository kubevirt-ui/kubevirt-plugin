import type { TFunction } from 'i18next';

import {
  getClusterMetricsNotAvailableLabel,
  getClusterMetricsUnavailableMessage,
  getClusterMetricsUnavailableTitle,
  hasForbiddenLoadedError,
  isForbiddenError,
} from './clusterMetricsAccess';

const t = ((key: string) => key) as TFunction;

describe('isForbiddenError', () => {
  it('returns true for a Forbidden message', () => {
    expect(isForbiddenError(new Error('Forbidden'))).toBe(true);
    expect(isForbiddenError({ message: '403 Forbidden: cannot list' })).toBe(true);
    expect(isForbiddenError('Forbidden')).toBe(true);
  });

  it('returns true for 403 status codes', () => {
    expect(isForbiddenError({ status: 403 })).toBe(true);
    expect(isForbiddenError({ statusCode: 403 })).toBe(true);
    expect(isForbiddenError({ code: 403 })).toBe(true);
    expect(isForbiddenError({ code: '403' })).toBe(true);
    expect(isForbiddenError({ response: { status: 403 } })).toBe(true);
  });

  it('returns false for non-forbidden errors', () => {
    expect(isForbiddenError(undefined)).toBe(false);
    expect(isForbiddenError(null)).toBe(false);
    expect(isForbiddenError(new Error('Internal Server Error'))).toBe(false);
    expect(isForbiddenError({ message: 'boom', status: 500 })).toBe(false);
  });
});

describe('hasForbiddenLoadedError', () => {
  it('returns true when a loaded series has a forbidden error', () => {
    expect(
      hasForbiddenLoadedError([
        { error: undefined, loaded: true },
        { error: new Error('Forbidden'), loaded: true },
      ]),
    ).toBe(true);
  });

  it('returns false when a forbidden error is still loading', () => {
    expect(hasForbiddenLoadedError([{ error: new Error('Forbidden'), loaded: false }])).toBe(false);
  });
});

describe('cluster metrics copy', () => {
  it('returns the unavailable title, message, and not-available label', () => {
    expect(getClusterMetricsUnavailableTitle(t)).toBe('Metrics unavailable');
    expect(getClusterMetricsUnavailableMessage(t)).toBe(
      'You do not have permission to view cluster metrics/alerts. Contact your administrator for access.',
    );
    expect(getClusterMetricsNotAvailableLabel(t)).toBe('Not available');
  });
});
