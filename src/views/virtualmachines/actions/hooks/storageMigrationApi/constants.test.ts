import {
  csvLoadedIndicatesMultiNsStorageMigrationApi,
  csvMinorMeetsMultiNsAssumeThreshold,
  parseKubeVirtCsvMinorVersion,
  STORAGE_MIGRATION_ASSUME_MULTI_NS_API_MIN_OPERATOR_MINOR,
} from './constants';

describe('parseKubeVirtCsvMinorVersion', () => {
  it('parses minor from CSV-style versions', () => {
    expect(parseKubeVirtCsvMinorVersion('4.21.0')).toBe(21);
    expect(parseKubeVirtCsvMinorVersion('v4.20.5')).toBe(20);
    expect(parseKubeVirtCsvMinorVersion('4.21.0-rc.1')).toBe(21);
  });

  it('returns null for missing or invalid input', () => {
    expect(parseKubeVirtCsvMinorVersion(undefined)).toBeNull();
    expect(parseKubeVirtCsvMinorVersion('')).toBeNull();
    expect(parseKubeVirtCsvMinorVersion('not-a-version')).toBeNull();
  });
});

describe('STORAGE_MIGRATION_ASSUME_MULTI_NS_API_MIN_OPERATOR_MINOR', () => {
  it('is 21 per storage migration API assumptions', () => {
    expect(STORAGE_MIGRATION_ASSUME_MULTI_NS_API_MIN_OPERATOR_MINOR).toBe(21);
  });
});

describe('csvMinorMeetsMultiNsAssumeThreshold', () => {
  it('is true when minor is at or above the assume-multi-ns threshold', () => {
    expect(csvMinorMeetsMultiNsAssumeThreshold(21)).toBe(true);
    expect(csvMinorMeetsMultiNsAssumeThreshold(22)).toBe(true);
  });

  it('is false when minor is below threshold or unknown', () => {
    expect(csvMinorMeetsMultiNsAssumeThreshold(20)).toBe(false);
    expect(csvMinorMeetsMultiNsAssumeThreshold(null)).toBe(false);
  });
});

describe('csvLoadedIndicatesMultiNsStorageMigrationApi', () => {
  it('requires csv loaded and minor meeting threshold', () => {
    expect(csvLoadedIndicatesMultiNsStorageMigrationApi(true, 21)).toBe(true);
    expect(csvLoadedIndicatesMultiNsStorageMigrationApi(false, 21)).toBe(false);
    expect(csvLoadedIndicatesMultiNsStorageMigrationApi(true, 20)).toBe(false);
    expect(csvLoadedIndicatesMultiNsStorageMigrationApi(true, null)).toBe(false);
  });
});
