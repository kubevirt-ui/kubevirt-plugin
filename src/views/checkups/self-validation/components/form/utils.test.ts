import { isValidWinImageDownloadUrl } from './utils';

describe('isValidWinImageDownloadUrl', () => {
  it('should allow empty values', () => {
    expect(isValidWinImageDownloadUrl('')).toBe(true);
    expect(isValidWinImageDownloadUrl('   ')).toBe(true);
  });

  it('should allow http and https URLs', () => {
    expect(isValidWinImageDownloadUrl('https://example.com/windows.iso')).toBe(true);
    expect(isValidWinImageDownloadUrl('http://mirror.local/win.iso')).toBe(true);
  });

  it('should reject non-http(s) protocols', () => {
    expect(isValidWinImageDownloadUrl('file:///tmp/windows.iso')).toBe(false);
    expect(isValidWinImageDownloadUrl('javascript:alert(1)')).toBe(false);
    expect(isValidWinImageDownloadUrl('ftp://example.com/windows.iso')).toBe(false);
  });

  it('should reject malformed URLs', () => {
    expect(isValidWinImageDownloadUrl('not-a-url')).toBe(false);
    expect(isValidWinImageDownloadUrl('/relative/path.iso')).toBe(false);
  });
});
