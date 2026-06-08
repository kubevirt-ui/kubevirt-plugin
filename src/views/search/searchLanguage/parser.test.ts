import { parseSearchToken } from './parser';

describe('parseSearchToken', () => {
  describe('key:value pairs', () => {
    it('should parse simple key:value', () => {
      const result = parseSearchToken('status:Running');
      expect(result).toEqual({
        exclude: false,
        key: 'status',
        raw: 'status:Running',
        values: ['Running'],
      });
    });

    it('should parse comma-separated values (OR logic)', () => {
      const result = parseSearchToken('status:Running,Paused');
      expect(result).toEqual({
        exclude: false,
        key: 'status',
        raw: 'status:Running,Paused',
        values: ['Running', 'Paused'],
      });
    });

    it('should parse description filter', () => {
      const result = parseSearchToken('description:database');
      expect(result).toEqual({
        exclude: false,
        key: 'description',
        raw: 'description:database',
        values: ['database'],
      });
    });
  });

  describe('plain text (name filter)', () => {
    it('should treat plain text as name filter', () => {
      const result = parseSearchToken('my-vm');
      expect(result).toEqual({
        exclude: false,
        key: '',
        raw: 'my-vm',
        values: ['my-vm'],
      });
    });

    it('should treat invalid key as name filter', () => {
      const result = parseSearchToken('foo:bar');
      expect(result).toEqual({
        exclude: false,
        key: '',
        raw: 'foo:bar',
        values: ['foo:bar'],
      });
    });
  });

  describe('numeric operators', () => {
    it('should parse cpu>4', () => {
      const result = parseSearchToken('cpu>4');
      expect(result).toEqual({
        exclude: false,
        key: 'cpu',
        operator: '>',
        raw: 'cpu>4',
        values: ['4'],
      });
    });

    it('should parse cpu:>4 (with colon)', () => {
      const result = parseSearchToken('cpu:>4');
      expect(result).toEqual({
        exclude: false,
        key: 'cpu',
        operator: '>',
        raw: 'cpu:>4',
        values: ['4'],
      });
    });

    it('should parse memory>=8GiB', () => {
      const result = parseSearchToken('memory>=8GiB');
      expect(result).toEqual({
        exclude: false,
        key: 'memory',
        operator: '>=',
        raw: 'memory>=8GiB',
        values: ['8GiB'],
      });
    });

    it('should parse memory:<=4GiB (with colon)', () => {
      const result = parseSearchToken('memory:<=4GiB');
      expect(result).toEqual({
        exclude: false,
        key: 'memory',
        operator: '<=',
        raw: 'memory:<=4GiB',
        values: ['4GiB'],
      });
    });
  });

  describe('exclusion prefix', () => {
    it('should parse -status:error', () => {
      const result = parseSearchToken('-status:error');
      expect(result).toEqual({
        exclude: true,
        key: 'status',
        raw: '-status:error',
        values: ['error'],
      });
    });

    it('should parse -has:gpu (alias)', () => {
      const result = parseSearchToken('-has:gpu');
      expect(result).toEqual({
        exclude: true,
        key: 'hwDevices',
        raw: '-has:gpu',
        values: ['gpu'],
      });
    });
  });

  describe('key aliases', () => {
    it('should resolve has to hwDevices', () => {
      const result = parseSearchToken('has:gpu');
      expect(result).toEqual({
        exclude: false,
        key: 'hwDevices',
        raw: 'has:gpu',
        values: ['gpu'],
      });
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace in input', () => {
      const result = parseSearchToken('  status:Running  ');
      expect(result).toEqual({
        exclude: false,
        key: 'status',
        raw: '  status:Running  ',
        values: ['Running'],
      });
    });

    it('should filter out empty values from comma split', () => {
      const result = parseSearchToken('status:Running,,Paused');
      expect(result).toEqual({
        exclude: false,
        key: 'status',
        raw: 'status:Running,,Paused',
        values: ['Running', 'Paused'],
      });
    });
  });
});
