import { tokenToFilterState } from './tokenToFilterState';
import { SearchToken } from './types';

describe('tokenToFilterState', () => {
  describe('name tokens', () => {
    it('should produce name filter for plain text', () => {
      const token: SearchToken = { exclude: false, key: '', raw: 'my-vm', values: ['my-vm'] };
      expect(tokenToFilterState(token)).toEqual({ name: ['my-vm'] });
    });
  });

  describe('string value filters', () => {
    it('should produce status filter', () => {
      const token: SearchToken = {
        exclude: false,
        key: 'status',
        raw: 'status:Running',
        values: ['Running'],
      };
      expect(tokenToFilterState(token)).toEqual({ status: ['Running'] });
    });

    it('should produce multi-value status filter (OR)', () => {
      const token: SearchToken = {
        exclude: false,
        key: 'status',
        raw: 'status:Running,Paused',
        values: ['Running', 'Paused'],
      };
      expect(tokenToFilterState(token)).toEqual({ status: ['Running', 'Paused'] });
    });

    it('should produce OS filter', () => {
      const token: SearchToken = {
        exclude: false,
        key: 'os',
        raw: 'os:rhel',
        values: ['rhel'],
      };
      expect(tokenToFilterState(token)).toEqual({ os: ['rhel'] });
    });
  });

  describe('numeric filters - CPU', () => {
    it('should format cpu>4 correctly', () => {
      const token: SearchToken = {
        exclude: false,
        key: 'cpu',
        operator: '>',
        raw: 'cpu>4',
        values: ['4'],
      };
      expect(tokenToFilterState(token)).toEqual({ cpu: ['GreaterThan 4'] });
    });

    it('should format cpu>=8 correctly', () => {
      const token: SearchToken = {
        exclude: false,
        key: 'cpu',
        operator: '>=',
        raw: 'cpu>=8',
        values: ['8'],
      };
      expect(tokenToFilterState(token)).toEqual({ cpu: ['GreaterOrEquals 8'] });
    });

    it('should format cpu<2 correctly', () => {
      const token: SearchToken = {
        exclude: false,
        key: 'cpu',
        operator: '<',
        raw: 'cpu<2',
        values: ['2'],
      };
      expect(tokenToFilterState(token)).toEqual({ cpu: ['LessThan 2'] });
    });

    it('should return null for non-numeric CPU value', () => {
      const token: SearchToken = {
        exclude: false,
        key: 'cpu',
        operator: '>',
        raw: 'cpu>abc',
        values: ['abc'],
      };
      expect(tokenToFilterState(token)).toBeNull();
    });
  });

  describe('numeric filters - Memory', () => {
    it('should format memory>=8GiB correctly', () => {
      const token: SearchToken = {
        exclude: false,
        key: 'memory',
        operator: '>=',
        raw: 'memory>=8GiB',
        values: ['8GiB'],
      };
      expect(tokenToFilterState(token)).toEqual({ memory: ['GreaterOrEquals 8 GiBs'] });
    });

    it('should format memory<4MiB correctly', () => {
      const token: SearchToken = {
        exclude: false,
        key: 'memory',
        operator: '<',
        raw: 'memory<4MiB',
        values: ['4MiB'],
      };
      expect(tokenToFilterState(token)).toEqual({ memory: ['LessThan 4 MiBs'] });
    });

    it('should be case-insensitive for memory units', () => {
      const token: SearchToken = {
        exclude: false,
        key: 'memory',
        operator: '>=',
        raw: 'memory>=8gib',
        values: ['8gib'],
      };
      expect(tokenToFilterState(token)).toEqual({ memory: ['GreaterOrEquals 8 GiBs'] });
    });

    it('should return null for invalid memory unit', () => {
      const token: SearchToken = {
        exclude: false,
        key: 'memory',
        operator: '>=',
        raw: 'memory>=8KB',
        values: ['8KB'],
      };
      expect(tokenToFilterState(token)).toBeNull();
    });
  });

  describe('exclusion', () => {
    it('should prefix values with ! for excluded status', () => {
      const token: SearchToken = {
        exclude: true,
        key: 'status',
        raw: '-status:error',
        values: ['error'],
      };
      expect(tokenToFilterState(token)).toEqual({ status: ['!error'] });
    });

    it('should prefix values with ! for excluded hwDevices', () => {
      const token: SearchToken = {
        exclude: true,
        key: 'hwDevices',
        raw: '-has:gpu',
        values: ['gpu'],
      };
      expect(tokenToFilterState(token)).toEqual({ hwDevices: ['!gpu'] });
    });

    it('should prefix numeric value with ! for excluded cpu', () => {
      const token: SearchToken = {
        exclude: true,
        key: 'cpu',
        operator: '>',
        raw: '-cpu>4',
        values: ['4'],
      };
      expect(tokenToFilterState(token)).toEqual({ cpu: ['!GreaterThan 4'] });
    });
  });

  describe('edge cases', () => {
    it('should return null for empty values', () => {
      const token: SearchToken = { exclude: false, key: 'status', raw: 'status:', values: [] };
      expect(tokenToFilterState(token)).toBeNull();
    });

    it('should return null for values that are all empty strings', () => {
      const token: SearchToken = { exclude: false, key: 'status', raw: 'status:', values: [''] };
      expect(tokenToFilterState(token)).toBeNull();
    });
  });
});
