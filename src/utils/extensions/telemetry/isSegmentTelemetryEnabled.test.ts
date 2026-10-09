import { getTelemetryApiKey, isSegmentTelemetryEnabled } from './isSegmentTelemetryEnabled';

type TelemetryFlags = NonNullable<Window['SERVER_FLAGS']['telemetry']>;

const setTelemetry = (telemetry?: Partial<TelemetryFlags>) => {
  (window as Window).SERVER_FLAGS = {
    ...(window.SERVER_FLAGS || {}),
    authDisabled: false,
    branding: 'openshift',
    telemetry: telemetry as TelemetryFlags,
  };
};

describe('isSegmentTelemetryEnabled', () => {
  const originalServerFlags = window.SERVER_FLAGS;

  afterEach(() => {
    window.SERVER_FLAGS = originalServerFlags;
  });

  it('returns the first available Segment API key', () => {
    setTelemetry({ SEGMENT_PUBLIC_API_KEY: 'public-key' });
    expect(getTelemetryApiKey()).toBe('public-key');

    setTelemetry({
      SEGMENT_API_KEY: 'api-key',
      SEGMENT_PUBLIC_API_KEY: 'public-key',
    });
    expect(getTelemetryApiKey()).toBe('api-key');
  });

  it('enables telemetry when API key and ACCOUNT_MAIL are present', () => {
    setTelemetry({
      ACCOUNT_MAIL: 'user@example.com',
      SEGMENT_API_KEY: 'api-key',
      SEGMENT_API_HOST: 'console.redhat.com/connections/api/v1',
      SEGMENT_JS_HOST: 'console.redhat.com/connections/cdn',
    });

    expect(isSegmentTelemetryEnabled()).toBe(true);
  });

  it('disables telemetry when ACCOUNT_MAIL is missing (disconnected / OCM unavailable)', () => {
    setTelemetry({
      SEGMENT_API_KEY: 'api-key',
      SEGMENT_API_HOST: 'console.redhat.com/connections/api/v1',
      SEGMENT_JS_HOST: 'console.redhat.com/connections/cdn',
    });

    expect(isSegmentTelemetryEnabled()).toBe(false);
  });

  it('disables telemetry when ACCOUNT_MAIL is empty', () => {
    setTelemetry({
      ACCOUNT_MAIL: '',
      SEGMENT_API_KEY: 'api-key',
      SEGMENT_JS_HOST: 'console.redhat.com/connections/cdn',
    });

    expect(isSegmentTelemetryEnabled()).toBe(false);
  });

  it('disables telemetry when API key is missing', () => {
    setTelemetry({
      ACCOUNT_MAIL: 'user@example.com',
      SEGMENT_JS_HOST: 'console.redhat.com/connections/cdn',
    });

    expect(isSegmentTelemetryEnabled()).toBe(false);
  });

  it.each(['DISABLED', 'DEVSANDBOX_DISABLED', 'TELEMETER_CLIENT_DISABLED'] as const)(
    'disables telemetry when %s is true',
    (flag) => {
      setTelemetry({
        ACCOUNT_MAIL: 'user@example.com',
        SEGMENT_API_KEY: 'api-key',
        [flag]: 'true',
      });

      expect(isSegmentTelemetryEnabled()).toBe(false);
    },
  );

  it('enables DevSandbox telemetry without ACCOUNT_MAIL when DevSandbox key is present', () => {
    setTelemetry({
      DEVSANDBOX: 'true',
      DEVSANDBOX_SEGMENT_API_KEY: 'sandbox-key',
      SEGMENT_JS_HOST: 'cdn.segment.com',
    });

    expect(isSegmentTelemetryEnabled()).toBe(true);
  });
});
