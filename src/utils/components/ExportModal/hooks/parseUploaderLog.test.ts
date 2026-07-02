import { initialProgress, parseLogEntry, reduceProgress } from './parseUploaderLog';
import { UploaderPhase } from './types';

describe('parseLogEntry', () => {
  it('should parse a valid download JSON line', () => {
    const line = '{"level":"info","msg":"Downloading disk image","percentage":25.5}';
    const result = parseLogEntry(line);
    expect(result).toEqual({
      level: 'info',
      msg: 'Downloading disk image',
      percentage: 25.5,
    });
  });

  it('should parse a valid upload JSON line', () => {
    const line =
      '{"level":"info","msg":"Uploading image","percentage":45.2,"bytes_uploaded":123456789,"total_bytes":274877906944,"speed_mbps":12.34,"time_remaining":"2m30s"}';
    const result = parseLogEntry(line);
    expect(result).toEqual({
      bytes_uploaded: 123456789,
      level: 'info',
      msg: 'Uploading image',
      percentage: 45.2,
      speed_mbps: 12.34,
      time_remaining: '2m30s',
      total_bytes: 274877906944,
    });
  });

  it('should return null for non-JSON lines', () => {
    expect(parseLogEntry('some plain text log')).toBeNull();
    expect(parseLogEntry('')).toBeNull();
    expect(parseLogEntry('   ')).toBeNull();
  });

  it('should return null for invalid JSON', () => {
    expect(parseLogEntry('{invalid json}')).toBeNull();
  });

  it('should handle lines with leading whitespace', () => {
    const line = '  {"level":"info","msg":"Downloading disk image","percentage":10}';
    const result = parseLogEntry(line);
    expect(result).not.toBeNull();
    expect(result?.percentage).toBe(10);
  });
});

describe('reduceProgress', () => {
  it('should transition to downloading phase', () => {
    const result = reduceProgress(initialProgress, {
      level: 'info',
      msg: 'Downloading disk image',
      percentage: 15,
    });
    expect(result.phase).toBe(UploaderPhase.Downloading);
    expect(result.percentage).toBe(15);
  });

  it('should update download percentage', () => {
    const current = { ...initialProgress, percentage: 15, phase: UploaderPhase.Downloading };
    const result = reduceProgress(current, {
      msg: 'Downloading disk image',
      percentage: 30,
    });
    expect(result.percentage).toBe(30);
    expect(result.phase).toBe(UploaderPhase.Downloading);
  });

  it('should transition to uploading phase', () => {
    const current = { ...initialProgress, percentage: 100, phase: UploaderPhase.Downloading };
    const result = reduceProgress(current, {
      bytes_uploaded: 50000,
      msg: 'Uploading image',
      percentage: 5,
      speed_mbps: 10.5,
      time_remaining: '5m0s',
      total_bytes: 1000000,
    });
    expect(result.phase).toBe(UploaderPhase.Uploading);
    expect(result.percentage).toBe(5);
    expect(result.bytesUploaded).toBe(50000);
    expect(result.totalBytes).toBe(1000000);
    expect(result.speedMbps).toBe(10.5);
    expect(result.timeRemaining).toBe('5m0s');
  });

  it('should not change state for unrecognized log messages', () => {
    const current = { ...initialProgress, phase: UploaderPhase.Downloading };
    const result = reduceProgress(current, {
      level: 'info',
      msg: 'Image size calculated',
    });
    expect(result).toBe(current);
  });

  it('should preserve existing upload fields when entry has partial data', () => {
    const current = {
      ...initialProgress,
      bytesUploaded: 100,
      phase: UploaderPhase.Uploading,
      speedMbps: 5,
      timeRemaining: '3m',
      totalBytes: 1000,
    };
    const result = reduceProgress(current, {
      msg: 'Uploading image',
      percentage: 50,
    });
    expect(result.percentage).toBe(50);
    expect(result.bytesUploaded).toBe(100);
    expect(result.totalBytes).toBe(1000);
  });

  it('should extract details from JSON error body', () => {
    const current = { ...initialProgress, percentage: 100, phase: UploaderPhase.Downloading };
    const result = reduceProgress(current, {
      error:
        'GET https://auth.docker.io/token?scope=repository: unexpected status code 401 Unauthorized: {"details":"incorrect username or password"}',
      level: 'error',
      msg: 'Upload error',
    });
    expect(result.phase).toBe(UploaderPhase.Error);
    expect(result.errorMessage).toBe('incorrect username or password');
  });

  it('should use full error when no details JSON is present', () => {
    const result = reduceProgress(initialProgress, {
      error: '401 Unauthorized: access denied',
      level: 'error',
      msg: 'Upload error',
    });
    expect(result.phase).toBe(UploaderPhase.Error);
    expect(result.errorMessage).toBe('401 Unauthorized: access denied');
  });

  it('should fall back to msg when error field is absent', () => {
    const result = reduceProgress(initialProgress, {
      level: 'error',
      msg: 'error pushing image: connection refused',
    });
    expect(result.phase).toBe(UploaderPhase.Error);
    expect(result.errorMessage).toBe('error pushing image: connection refused');
  });

  it('should not regress from error phase on subsequent log entries', () => {
    const errorState = {
      ...initialProgress,
      errorMessage: 'auth failed',
      phase: UploaderPhase.Error,
    };
    const result = reduceProgress(errorState, {
      msg: 'Downloading disk image',
      percentage: 50,
    });
    expect(result).toBe(errorState);
    expect(result.phase).toBe(UploaderPhase.Error);
  });
});
