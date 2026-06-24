import { KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

import { filtersToSearchText } from './filtersToSearchText';

const f = (obj: Record<string, string[]>) => obj as KubevirtFilterState;

describe('filtersToSearchText', () => {
  describe('basic key:value serialization', () => {
    it('should serialize a single filter with one value', () => {
      expect(filtersToSearchText(f({ status: ['Running'] }), ['status'])).toBe('status:Running');
    });

    it('should serialize a filter with multiple values as comma-separated', () => {
      expect(filtersToSearchText(f({ os: ['RHEL', 'Fedora'] }), ['os'])).toBe('os:RHEL,Fedora');
    });

    it('should serialize multiple filters separated by spaces', () => {
      expect(filtersToSearchText(f({ os: ['RHEL'], status: ['Running'] }), ['status', 'os'])).toBe(
        'status:Running os:RHEL',
      );
    });

    it('should return empty string for empty filters', () => {
      expect(filtersToSearchText(f({}), [])).toBe('');
    });

    it('should skip filters with empty values', () => {
      expect(filtersToSearchText(f({ os: [], status: ['Running'] }), ['os', 'status'])).toBe(
        'status:Running',
      );
    });
  });

  describe('name filter', () => {
    it('should serialize name filter with name: prefix', () => {
      expect(filtersToSearchText(f({ name: ['my-vm'] }), ['name'])).toBe('name:my-vm');
    });

    it('should serialize excluded name with -name: prefix', () => {
      expect(filtersToSearchText(f({ name: ['!my-vm'] }), ['name'])).toBe('-name:my-vm');
    });
  });

  describe('exclusion', () => {
    it('should serialize excluded values with - prefix', () => {
      expect(filtersToSearchText(f({ status: ['!Running'] }), ['status'])).toBe('-status:Running');
    });

    it('should split included and excluded values into separate tokens', () => {
      expect(filtersToSearchText(f({ status: ['Running', '!Stopped'] }), ['status'])).toBe(
        'status:Running -status:Stopped',
      );
    });
  });

  describe('reverse key mapping', () => {
    it('should use search key "arch" for filter type "architecture"', () => {
      expect(filtersToSearchText(f({ architecture: ['amd64'] }), ['architecture'])).toBe(
        'arch:amd64',
      );
    });

    it('should use search key "storage" for filter type "storageClass"', () => {
      expect(filtersToSearchText(f({ storageClass: ['gold'] }), ['storageClass'])).toBe(
        'storage:gold',
      );
    });

    it('should use search key "has" for filter type "hwDevices"', () => {
      expect(filtersToSearchText(f({ hwDevices: ['gpu'] }), ['hwDevices'])).toBe('has:gpu');
    });

    it('should use search key "network" for filter type "nad"', () => {
      expect(filtersToSearchText(f({ nad: ['default/my-net'] }), ['nad'])).toBe(
        'network:default/my-net',
      );
    });
  });

  describe('numeric filters', () => {
    it('should serialize CPU filter with operator', () => {
      expect(filtersToSearchText(f({ cpu: ['GreaterThan 4'] }), ['cpu'])).toBe('vcpu>4');
    });

    it('should serialize memory filter with operator and unit', () => {
      expect(filtersToSearchText(f({ memory: ['GreaterOrEquals 8 GiB'] }), ['memory'])).toBe(
        'memory>=8GiB',
      );
    });

    it('should serialize excluded numeric filter', () => {
      expect(filtersToSearchText(f({ cpu: ['!GreaterThan 4'] }), ['cpu'])).toBe('-vcpu>4');
    });
  });

  describe('token ordering', () => {
    it('should follow tokenOrder for output sequence', () => {
      expect(
        filtersToSearchText(f({ name: ['test'], os: ['RHEL'], status: ['Running'] }), [
          'os',
          'status',
          'name',
        ]),
      ).toBe('os:RHEL status:Running name:test');
    });

    it('should include filters not in tokenOrder at the end', () => {
      expect(filtersToSearchText(f({ os: ['RHEL'], status: ['Running'] }), ['status'])).toBe(
        'status:Running os:RHEL',
      );
    });
  });
});
