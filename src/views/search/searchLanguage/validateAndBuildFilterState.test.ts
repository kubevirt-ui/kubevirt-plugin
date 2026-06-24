import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

import { validateAndBuildFilterState } from './validateAndBuildFilterState';

const mockFilterDefinitions: KubevirtFilter[] = [
  {
    categoryLabel: 'Status',
    id: 'status',
    match: jest.fn(),
    options: [
      { label: 'Running', value: 'Running' },
      { label: 'Stopped', value: 'Stopped' },
      { label: 'Paused', value: 'Paused' },
    ],
  },
  {
    categoryLabel: 'Operating System',
    id: 'os',
    match: jest.fn(),
    options: [
      { label: 'RHEL', value: 'RHEL' },
      { label: 'Fedora', value: 'Fedora' },
      { label: 'Windows', value: 'Windows' },
    ],
  },
  {
    categoryLabel: 'Name',
    id: 'name',
    match: jest.fn(),
  },
  {
    categoryLabel: 'Description',
    id: 'description',
    match: jest.fn(),
  },
];

describe('validateAndBuildFilterState', () => {
  describe('valid tokens', () => {
    it('should parse a single valid key:value token', () => {
      const result = validateAndBuildFilterState('status:Running', mockFilterDefinitions);
      expect(result.filterState).toEqual({ status: ['Running'] });
      expect(result.invalidKeyErrors).toEqual([]);
      expect(result.invalidValueErrors).toEqual([]);
      expect(result.tokenOrder).toEqual(['status']);
    });

    it('should parse multiple valid tokens', () => {
      const result = validateAndBuildFilterState('status:Running os:RHEL', mockFilterDefinitions);
      expect(result.filterState).toEqual({
        os: ['RHEL'],
        status: ['Running'],
      });
      expect(result.tokenOrder).toEqual(['status', 'os']);
    });

    it('should parse plain text as name filter', () => {
      const result = validateAndBuildFilterState('my-vm', mockFilterDefinitions);
      expect(result.filterState).toEqual({ name: ['my-vm'] });
      expect(result.tokenOrder).toEqual(['name']);
    });

    it('should handle filters without options (free-text) without validation', () => {
      const result = validateAndBuildFilterState('description:database', mockFilterDefinitions);
      expect(result.filterState.description).toEqual(['database']);
      expect(result.invalidValueErrors).toEqual([]);
    });
  });

  describe('invalid values (closed enum)', () => {
    it('should filter out invalid values and report them', () => {
      const result = validateAndBuildFilterState('os:RHEL,random,Fedora', mockFilterDefinitions);
      expect(result.filterState.os).toEqual(['RHEL', 'Fedora']);
      expect(result.invalidValueErrors).toEqual([
        expect.objectContaining({
          filterType: 'os',
          invalidValues: ['random'],
          validValues: ['RHEL', 'Fedora'],
        }),
      ]);
    });

    it('should handle all invalid values in a filter', () => {
      const result = validateAndBuildFilterState('os:invalid1,invalid2', mockFilterDefinitions);
      expect(result.filterState.os).toBeUndefined();
      expect(result.invalidValueErrors).toHaveLength(1);
      expect(result.invalidValueErrors[0].invalidValues).toEqual(['invalid1', 'invalid2']);
    });
  });

  describe('invalid keys', () => {
    it('should report unrecognized key and exclude from filter state', () => {
      const result = validateAndBuildFilterState('status-random:Stopped', mockFilterDefinitions);
      expect(result.filterState).toEqual({});
      expect(result.invalidKeyErrors).toEqual([
        expect.objectContaining({
          key: 'status-random',
        }),
      ]);
    });
  });

  describe('mixed valid and invalid', () => {
    it('should commit valid parts and report all invalid parts', () => {
      const result = validateAndBuildFilterState(
        'os:RHEL,random,Fedora status-random:Stopped status:Running',
        mockFilterDefinitions,
      );
      expect(result.filterState).toEqual(
        expect.objectContaining({
          os: expect.arrayContaining(['RHEL', 'Fedora']),
          status: ['Running'],
        }),
      );
      expect(result.invalidKeyErrors).toHaveLength(1);
      expect(result.invalidValueErrors).toHaveLength(1);
      expect(result.tokenOrder).toEqual(['os', 'status']);
    });
  });

  describe('numeric filters - CPU', () => {
    it('should format vcpu>4 correctly', () => {
      const result = validateAndBuildFilterState('vcpu>4', mockFilterDefinitions);
      expect(result.filterState).toEqual({ cpu: ['GreaterThan 4'] });
      expect(result.tokenOrder).toEqual(['cpu']);
    });

    it('should format vcpu>=8 correctly', () => {
      const result = validateAndBuildFilterState('vcpu>=8', mockFilterDefinitions);
      expect(result.filterState).toEqual({ cpu: ['GreaterOrEquals 8'] });
    });

    it('should format vcpu<2 correctly', () => {
      const result = validateAndBuildFilterState('vcpu<2', mockFilterDefinitions);
      expect(result.filterState).toEqual({ cpu: ['LessThan 2'] });
    });

    it('should skip non-numeric CPU value', () => {
      const result = validateAndBuildFilterState('vcpu>abc', mockFilterDefinitions);
      expect(result.filterState).toEqual({});
    });
  });

  describe('numeric filters - Memory', () => {
    it('should format memory>=8GiB correctly', () => {
      const result = validateAndBuildFilterState('memory>=8GiB', mockFilterDefinitions);
      expect(result.filterState).toEqual({ memory: ['GreaterOrEquals 8 GiB'] });
    });

    it('should format memory<4MiB correctly', () => {
      const result = validateAndBuildFilterState('memory<4MiB', mockFilterDefinitions);
      expect(result.filterState).toEqual({ memory: ['LessThan 4 MiB'] });
    });

    it('should be case-insensitive for memory units', () => {
      const result = validateAndBuildFilterState('memory>=8gib', mockFilterDefinitions);
      expect(result.filterState).toEqual({ memory: ['GreaterOrEquals 8 GiB'] });
    });

    it('should skip invalid memory unit', () => {
      const result = validateAndBuildFilterState('memory>=8KB', mockFilterDefinitions);
      expect(result.filterState).toEqual({});
    });
  });

  describe('numeric exclusion', () => {
    it('should prefix numeric value with ! for excluded cpu', () => {
      const result = validateAndBuildFilterState('-vcpu>4', mockFilterDefinitions);
      expect(result.filterState).toEqual({ cpu: ['!GreaterThan 4'] });
    });
  });

  describe('empty input', () => {
    it('should return empty state for empty text', () => {
      const result = validateAndBuildFilterState('', mockFilterDefinitions);
      expect(result.filterState).toEqual({});
      expect(result.invalidKeyErrors).toEqual([]);
      expect(result.invalidValueErrors).toEqual([]);
      expect(result.tokenOrder).toEqual([]);
    });

    it('should return empty state for whitespace-only text', () => {
      const result = validateAndBuildFilterState('   ', mockFilterDefinitions);
      expect(result.filterState).toEqual({});
      expect(result.tokenOrder).toEqual([]);
    });
  });

  describe('exclusion prefix', () => {
    it('should handle excluded name', () => {
      const result = validateAndBuildFilterState('-my-vm', mockFilterDefinitions);
      expect(result.filterState).toEqual({ name: ['!my-vm'] });
    });

    it('should handle excluded key:value', () => {
      const result = validateAndBuildFilterState('-status:Running', mockFilterDefinitions);
      expect(result.filterState.status).toEqual(['!Running']);
    });
  });
});
