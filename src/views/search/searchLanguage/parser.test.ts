import { parseSearchToken } from './parser';

describe('parseSearchToken', () => {
  describe('key:value pairs', () => {
    it('should parse simple key:value', () => {
      const result = parseSearchToken('status:Running');
      expect(result).toEqual({
        exclude: false,
        filterType: 'status',
        raw: 'status:Running',
        searchKey: 'status',
        values: ['Running'],
      });
    });

    it('should parse comma-separated values (OR logic)', () => {
      const result = parseSearchToken('status:Running,Paused');
      expect(result).toEqual({
        exclude: false,
        filterType: 'status',
        raw: 'status:Running,Paused',
        searchKey: 'status',
        values: ['Running', 'Paused'],
      });
    });

    it('should parse description filter', () => {
      const result = parseSearchToken('description:database');
      expect(result).toEqual({
        exclude: false,
        filterType: 'description',
        raw: 'description:database',
        searchKey: 'description',
        values: ['database'],
      });
    });
  });

  describe('plain text (name filter)', () => {
    it('should treat plain text as name filter', () => {
      const result = parseSearchToken('my-vm');
      expect(result).toEqual({
        exclude: false,
        raw: 'my-vm',
        values: ['my-vm'],
      });
    });

    it('should treat invalid key as name filter', () => {
      const result = parseSearchToken('foo:bar');
      expect(result).toEqual({
        exclude: false,
        raw: 'foo:bar',
        values: ['foo:bar'],
      });
    });
  });

  describe('numeric operators', () => {
    it('should parse vcpu>4', () => {
      const result = parseSearchToken('vcpu>4');
      expect(result).toEqual({
        exclude: false,
        filterType: 'cpu',
        operator: '>',
        raw: 'vcpu>4',
        searchKey: 'vcpu',
        values: ['4'],
      });
    });

    it('should parse vcpu:>4 (with colon)', () => {
      const result = parseSearchToken('vcpu:>4');
      expect(result).toEqual({
        exclude: false,
        filterType: 'cpu',
        operator: '>',
        raw: 'vcpu:>4',
        searchKey: 'vcpu',
        values: ['4'],
      });
    });

    it('should parse memory>=8GiB', () => {
      const result = parseSearchToken('memory>=8GiB');
      expect(result).toEqual({
        exclude: false,
        filterType: 'memory',
        operator: '>=',
        raw: 'memory>=8GiB',
        searchKey: 'memory',
        values: ['8GiB'],
      });
    });

    it('should parse memory:<=4GiB (with colon)', () => {
      const result = parseSearchToken('memory:<=4GiB');
      expect(result).toEqual({
        exclude: false,
        filterType: 'memory',
        operator: '<=',
        raw: 'memory:<=4GiB',
        searchKey: 'memory',
        values: ['4GiB'],
      });
    });
  });

  describe('exclusion prefix', () => {
    it('should parse -status:error', () => {
      const result = parseSearchToken('-status:error');
      expect(result).toEqual({
        exclude: true,
        filterType: 'status',
        raw: '-status:error',
        searchKey: 'status',
        values: ['error'],
      });
    });

    it('should parse -has:gpu (alias)', () => {
      const result = parseSearchToken('-has:gpu');
      expect(result).toEqual({
        exclude: true,
        filterType: 'hwDevices',
        raw: '-has:gpu',
        searchKey: 'has',
        values: ['gpu'],
      });
    });
  });

  describe('key aliases', () => {
    it('should resolve has to hwDevices', () => {
      const result = parseSearchToken('has:gpu');
      expect(result).toEqual({
        exclude: false,
        filterType: 'hwDevices',
        raw: 'has:gpu',
        searchKey: 'has',
        values: ['gpu'],
      });
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace in input', () => {
      const result = parseSearchToken('  status:Running  ');
      expect(result).toEqual({
        exclude: false,
        filterType: 'status',
        raw: '  status:Running  ',
        searchKey: 'status',
        values: ['Running'],
      });
    });

    it('should filter out empty values from comma split', () => {
      const result = parseSearchToken('status:Running,,Paused');
      expect(result).toEqual({
        exclude: false,
        filterType: 'status',
        raw: 'status:Running,,Paused',
        searchKey: 'status',
        values: ['Running', 'Paused'],
      });
    });
  });
});
