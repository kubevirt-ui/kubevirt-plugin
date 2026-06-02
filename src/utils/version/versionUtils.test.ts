import { parseVersionMajorMinor, versionMeetsMajorMinorThreshold } from './versionUtils';

describe('parseVersionMajorMinor', () => {
  it('parses major and minor from version strings', () => {
    expect(parseVersionMajorMinor('4.21.0')).toEqual({ major: 4, minor: 21 });
    expect(parseVersionMajorMinor('v5.1.0')).toEqual({ major: 5, minor: 1 });
    expect(parseVersionMajorMinor('4.21.0-rc.1')).toEqual({ major: 4, minor: 21 });
  });

  it('returns null for missing or invalid input', () => {
    expect(parseVersionMajorMinor(undefined)).toBeNull();
    expect(parseVersionMajorMinor('')).toBeNull();
    expect(parseVersionMajorMinor('not-a-version')).toBeNull();
  });
});

describe('versionMeetsMajorMinorThreshold', () => {
  const minVersion = { major: 4, minor: 21 };

  it('compares major before minor', () => {
    expect(versionMeetsMajorMinorThreshold('4.21.0', minVersion)).toBe(true);
    expect(versionMeetsMajorMinorThreshold('4.20.5', minVersion)).toBe(false);
    expect(versionMeetsMajorMinorThreshold('5.1.0', minVersion)).toBe(true);
    expect(versionMeetsMajorMinorThreshold('3.99.0', minVersion)).toBe(false);
  });
});
