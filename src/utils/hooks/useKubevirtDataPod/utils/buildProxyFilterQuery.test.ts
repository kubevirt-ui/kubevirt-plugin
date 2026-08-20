import { buildProxyFilterQuery } from './buildProxyFilterQuery';

const FILTER_OPTIONS = {
  labels: 'metadata.labels',
  name: 'metadata.name',
  os: ['spec.preference.name', 'spec.template.metadata.annotations.vm\\.kubevirt\\.io/os'],
  status: 'status.printableStatus',
};

describe('buildProxyFilterQuery', () => {
  it('should return empty string when filterOptions is missing', () => {
    expect(buildProxyFilterQuery(new URLSearchParams('status=Running'))).toBe('');
  });

  it('should map a single included filter to its yaml path', () => {
    expect(buildProxyFilterQuery(new URLSearchParams('name=vm-rhel'), FILTER_OPTIONS)).toBe(
      'metadata.name=vm-rhel',
    );
  });

  it('should join array yaml paths into one proxy key', () => {
    expect(buildProxyFilterQuery(new URLSearchParams('os=rhel'), FILTER_OPTIONS)).toBe(
      'spec.preference.name%7Cspec.template.metadata.annotations.vm%5C.kubevirt%5C.io%2Fos=rhel',
    );
  });

  it('should omit excluded values', () => {
    expect(buildProxyFilterQuery(new URLSearchParams('name=!vm-rhel'), FILTER_OPTIONS)).toBe('');
  });

  it('should join repeated keys into one comma-separated proxy value', () => {
    expect(
      buildProxyFilterQuery(new URLSearchParams('status=Running&status=Stopped'), FILTER_OPTIONS),
    ).toBe('status.printableStatus=Running%2CStopped');
  });

  it('should keep includes and drop excludes when both are repeated keys', () => {
    expect(
      buildProxyFilterQuery(
        new URLSearchParams('status=Running&status=!Stopped&name=!vm-rhel'),
        FILTER_OPTIONS,
      ),
    ).toBe('status.printableStatus=Running');
  });
});
