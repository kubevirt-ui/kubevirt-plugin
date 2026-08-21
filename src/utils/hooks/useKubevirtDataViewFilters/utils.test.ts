import { hasActiveProxyFilter } from './utils';

const FILTER_OPTIONS = {
  labels: 'metadata.labels',
  name: 'metadata.name',
  os: ['spec.preference.name'],
  status: 'status.printableStatus',
};

describe('hasActiveProxyFilter', () => {
  it('should return false when filterOptions is missing', () => {
    expect(hasActiveProxyFilter(new URLSearchParams('name=vm-rhel'))).toBe(false);
  });

  it('should return false when the query has no mapped keys', () => {
    expect(hasActiveProxyFilter(new URLSearchParams('sortBy=name'), FILTER_OPTIONS)).toBe(false);
  });

  it('should return false when the only mapped filter is excluded', () => {
    expect(hasActiveProxyFilter(new URLSearchParams('name=!vm-rhel'), FILTER_OPTIONS)).toBe(false);
  });

  it('should return true when a mapped filter has an included value', () => {
    expect(hasActiveProxyFilter(new URLSearchParams('name=vm-rhel'), FILTER_OPTIONS)).toBe(true);
  });

  it('should return true when an include remains beside an exclude', () => {
    expect(
      hasActiveProxyFilter(new URLSearchParams('status=Stopped&name=!vm-rhel'), FILTER_OPTIONS),
    ).toBe(true);
  });

  it('should return true for repeated include keys', () => {
    expect(
      hasActiveProxyFilter(new URLSearchParams('status=Running&status=Stopped'), FILTER_OPTIONS),
    ).toBe(true);
  });

  it('should return true when a repeated key has both include and exclude', () => {
    expect(
      hasActiveProxyFilter(new URLSearchParams('status=Running&status=!Stopped'), FILTER_OPTIONS),
    ).toBe(true);
  });

  it('should return false when every repeated key value is excluded', () => {
    expect(
      hasActiveProxyFilter(new URLSearchParams('status=!Running&status=!Stopped'), FILTER_OPTIONS),
    ).toBe(false);
  });
});
