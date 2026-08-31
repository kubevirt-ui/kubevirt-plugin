import { TFunction } from 'i18next';

import { formatK8sError, getK8sErrorHref, K8sLikeError } from './formatK8sError';

const t = ((key: string) => key) as TFunction;

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterAll(() => {
  jest.restoreAllMocks();
});

const errorWithMessage = (message: string, href?: string): K8sLikeError => {
  const error = new Error(message) as K8sLikeError;
  if (href) {
    error.href = href;
  }
  return error;
};

describe('formatK8sError', () => {
  it('should return an empty string when error is undefined', () => {
    expect(formatK8sError(undefined, t)).toBe('');
  });

  it('should return the cron format message for illegal cron schedule errors', () => {
    expect(formatK8sError(errorWithMessage('not a legal cron schedule'), t)).toBe(
      'Invalid cron schedule format. Use standard cron syntax (e.g., {{ example }}).',
    );
  });

  it('should return the missing-fields message', () => {
    expect(formatK8sError(errorWithMessage('missing required fields: spec'), t)).toBe(
      'Missing required fields. Complete all required fields before saving.',
    );
  });

  it('should return the invalid-certificate message', () => {
    expect(formatK8sError(errorWithMessage('invalid certificate for registry'), t)).toBe(
      'Invalid certificate. Open the link below in a new tab to approve the certificate, then try again.',
    );
  });

  it('should return the generic admin message for 4xx/5xx prefixes', () => {
    expect(formatK8sError(errorWithMessage('403 Forbidden: cannot patch'), t)).toBe(
      'The operation could not be completed. Please try again or contact your administrator.',
    );
  });

  it('should return the generic admin message when status is embedded', () => {
    expect(formatK8sError(errorWithMessage('request failed status: 500'), t)).toBe(
      'The operation could not be completed. Please try again or contact your administrator.',
    );
  });

  it('should return the original message when it does not match a known pattern', () => {
    expect(formatK8sError(errorWithMessage('volume expansion is not allowed'), t)).toBe(
      'volume expansion is not allowed',
    );
  });
});

describe('getK8sErrorHref', () => {
  it('should return http(s) hrefs', () => {
    expect(getK8sErrorHref(errorWithMessage('invalid certificate', 'https://example.test'))).toBe(
      'https://example.test',
    );
    expect(getK8sErrorHref(errorWithMessage('invalid certificate', 'http://example.test'))).toBe(
      'http://example.test',
    );
  });

  it('should return undefined when error or href is missing', () => {
    expect(getK8sErrorHref(undefined)).toBeUndefined();
    expect(getK8sErrorHref(errorWithMessage('no href'))).toBeUndefined();
  });

  it('should reject javascript and relative hrefs', () => {
    expect(getK8sErrorHref(errorWithMessage('x', 'javascript:alert(1)'))).toBeUndefined();
    expect(getK8sErrorHref(errorWithMessage('x', '/relative/path'))).toBeUndefined();
  });
});
