import {
  csvLoadedIndicatesMultiNsStorageMigrationApi,
  csvVersionMeetsMultiNsAssumeThreshold,
  STORAGE_MIGRATION_ASSUME_MULTI_NS_API_MIN_VERSION,
} from './constants';

describe('STORAGE_MIGRATION_ASSUME_MULTI_NS_API_MIN_VERSION', () => {
  it('is 4.21 per storage migration API assumptions', () => {
    expect(STORAGE_MIGRATION_ASSUME_MULTI_NS_API_MIN_VERSION).toEqual({ major: 4, minor: 21 });
  });
});

describe('csvVersionMeetsMultiNsAssumeThreshold', () => {
  it('is true when version is at or above 4.21', () => {
    expect(csvVersionMeetsMultiNsAssumeThreshold('4.21.0')).toBe(true);
    expect(csvVersionMeetsMultiNsAssumeThreshold('4.22.0')).toBe(true);
    expect(csvVersionMeetsMultiNsAssumeThreshold('5.1.0')).toBe(true);
  });

  it('is false when version is below 4.21 or unknown', () => {
    expect(csvVersionMeetsMultiNsAssumeThreshold('4.20.5')).toBe(false);
    expect(csvVersionMeetsMultiNsAssumeThreshold(undefined)).toBe(false);
  });

  it('rejects high minor on lower major (regression: major.minor not minor-only)', () => {
    expect(csvVersionMeetsMultiNsAssumeThreshold('3.99.0')).toBe(false);
  });
});

describe('csvLoadedIndicatesMultiNsStorageMigrationApi', () => {
  it('requires csv loaded and version meeting threshold', () => {
    expect(csvLoadedIndicatesMultiNsStorageMigrationApi(true, '4.21.0')).toBe(true);
    expect(csvLoadedIndicatesMultiNsStorageMigrationApi(false, '4.21.0')).toBe(false);
    expect(csvLoadedIndicatesMultiNsStorageMigrationApi(true, '4.20.5')).toBe(false);
    expect(csvLoadedIndicatesMultiNsStorageMigrationApi(true, undefined)).toBe(false);
  });
});
