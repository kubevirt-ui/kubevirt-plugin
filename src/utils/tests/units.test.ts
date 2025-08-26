import { formatQuantityString, getHumanizedSize, toQuantity } from '@kubevirt-utils/utils/units';

jest.mock('@kubevirt-utils/utils/utils', () => ({
  isEmpty: (obj: any) =>
    [Array, Object].includes((obj || {}).constructor) && !Object.entries(obj || {}).length,
  isString: (value: any) => typeof value === 'string',
}));

beforeAll(() => {
  const originalNumberFormat = Intl.NumberFormat;
  Intl.NumberFormat = jest.fn((_locale, options) => {
    return new originalNumberFormat('en-US', options);
  }) as any;
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('Test quantity utilities', () => {
  describe('From International System units', () => {
    it('Ki in KiB', () => {
      expect(getHumanizedSize('1Ki')).toStrictEqual({ string: '1 KiB', unit: 'KiB', value: 1 });
    });

    it('Ki in MiB', () => {
      expect(getHumanizedSize('2048Ki')).toStrictEqual({ string: '2 MiB', unit: 'MiB', value: 2 });
    });

    it('Mi in GiB', () => {
      expect(getHumanizedSize('2048Mi')).toStrictEqual({ string: '2 GiB', unit: 'GiB', value: 2 });
    });

    it('Gi in GiB', () => {
      expect(getHumanizedSize('1Gi')).toStrictEqual({ string: '1 GiB', unit: 'GiB', value: 1 });
    });
  });

  describe('From Decimal units', () => {
    it('K in KiB', () => {
      expect(getHumanizedSize('1k')).toStrictEqual({
        string: '1,000 B',
        unit: 'B',
        value: 1000,
      });
    });

    it('G in GiB', () => {
      expect(getHumanizedSize('1G')).toStrictEqual({
        string: '953.7 MiB',
        unit: 'MiB',
        value: 953.7,
      });
    });
  });

  describe('From digit', () => {
    it('1024 to KiB', () => {
      expect(getHumanizedSize('1024')).toStrictEqual({ string: '1 KiB', unit: 'KiB', value: 1 });
    });

    it('1025 to KiB', () => {
      expect(getHumanizedSize('1025')).toStrictEqual({ string: '1 KiB', unit: 'KiB', value: 1 });
    });

    it('1073741824 to 1 GiB', () => {
      expect(getHumanizedSize('1073741824')).toStrictEqual({
        string: '1 GiB',
        unit: 'GiB',
        value: 1,
      });
    });
  });

  describe('toQuantity', () => {
    describe('Binary units', () => {
      it('converts 1Ki to binary unit', () => {
        expect(toQuantity('1Ki')).toStrictEqual({ unit: 'Ki', value: 1 });
      });

      it('converts 2Mi to binary unit', () => {
        expect(toQuantity('2Mi')).toStrictEqual({ unit: 'Mi', value: 2 });
      });

      it('converts 1.5Gi to binary unit', () => {
        expect(toQuantity('1.5Gi')).toStrictEqual({ unit: 'Gi', value: 1.5 });
      });

      it('converts 3Ti to binary unit', () => {
        expect(toQuantity('3Ti')).toStrictEqual({ unit: 'Ti', value: 3 });
      });
    });

    describe('Decimal units', () => {
      it('converts 1k to decimal unit', () => {
        expect(toQuantity('1k')).toStrictEqual({ unit: 'k', value: 1 });
      });

      it('converts 2M to decimal unit', () => {
        expect(toQuantity('2M')).toStrictEqual({ unit: 'M', value: 2 });
      });

      it('converts 1.5G to decimal unit', () => {
        expect(toQuantity('1.5G')).toStrictEqual({ unit: 'G', value: 1.5 });
      });

      it('converts 3T to decimal unit', () => {
        expect(toQuantity('3T')).toStrictEqual({ unit: 'T', value: 3 });
      });
    });

    describe('Bytes conversion', () => {
      it('converts 1024 bytes to KiB', () => {
        expect(toQuantity('1024')).toStrictEqual({ unit: 'Ki', value: 1 });
      });

      it('converts 1073741824 bytes to GiB', () => {
        expect(toQuantity('1073741824')).toStrictEqual({ unit: 'Gi', value: 1 });
      });

      it('converts 1000 bytes to B', () => {
        expect(toQuantity('1000')).toStrictEqual({ unit: 'B', value: 1000 });
      });

      it('converts 512 bytes to B', () => {
        expect(toQuantity('512')).toStrictEqual({ unit: 'B', value: 512 });
      });
    });

    describe('Exponential notation', () => {
      it('converts 12e6 (scientific notation)', () => {
        expect(toQuantity('12e6')).toStrictEqual({ unit: 'M', value: 12 });
      });

      it('converts 1.5E3 (scientific notation with uppercase E)', () => {
        expect(toQuantity('1.5E3')).toStrictEqual({ unit: 'k', value: 1.5 });
      });

      it('converts 2.5e-3 (scientific notation with negative exponent)', () => {
        expect(toQuantity('2.5e-3')).toStrictEqual({ unit: 'B', value: 0.0025 });
      });

      it('converts 1e+9 (scientific notation with positive exponent)', () => {
        expect(toQuantity('1e+9')).toStrictEqual({ unit: 'G', value: 1 });
      });
    });
  });

  describe('formatQuantityString', () => {
    describe('Binary conversion', () => {
      it('formats 1024 to 1Ki', () => {
        expect(formatQuantityString('1024')).toBe('1Ki');
      });

      it('formats 1048576 to 1Mi', () => {
        expect(formatQuantityString('1048576')).toBe('1Mi');
      });

      it('formats 1073741824 to 1Gi', () => {
        expect(formatQuantityString('1073741824')).toBe('1Gi');
      });

      it('formats 1099511627776 to 1Ti', () => {
        expect(formatQuantityString('1099511627776')).toBe('1Ti');
      });
    });

    describe('Decimal conversion', () => {
      it('formats 1000 to 1k', () => {
        expect(formatQuantityString('1000')).toBe('1k');
      });

      it('formats 1000000 to 1M', () => {
        expect(formatQuantityString('1000000')).toBe('1M');
      });

      it('formats 1000000000 to 1G', () => {
        expect(formatQuantityString('1000000000')).toBe('1G');
      });

      it('formats 1000000000000 to 1T', () => {
        expect(formatQuantityString('1000000000000')).toBe('1T');
      });
    });

    describe('Already formatted strings', () => {
      it('returns existing binary unit unchanged', () => {
        expect(formatQuantityString('1Ki')).toBe('1Ki');
      });

      it('returns existing decimal unit unchanged', () => {
        expect(formatQuantityString('1k')).toBe('1k');
      });

      it('returns milibytes unchanged', () => {
        expect(formatQuantityString('500m')).toBe('500m');
      });
    });

    describe('Edge cases', () => {
      it('returns null for empty string', () => {
        expect(formatQuantityString('')).toBe(null);
      });

      it('returns null for null input', () => {
        expect(formatQuantityString(null)).toBe(null);
      });

      it('returns null for undefined input', () => {
        expect(formatQuantityString(undefined)).toBe(null);
      });

      it('formats 0 bytes', () => {
        expect(formatQuantityString('0')).toBe('0');
      });

      it('formats non-convertible bytes', () => {
        expect(formatQuantityString('1025')).toBe('1025');
      });
    });

    describe('Prefers binary over decimal when indices are equal', () => {
      it('formats 1024000 to binary unit', () => {
        // This tests the logic where binary and decimal conversions have equal indices
        expect(formatQuantityString('1024000')).toBe('1000Ki');
      });
    });
  });
});
