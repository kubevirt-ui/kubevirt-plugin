import { getHumanizedSize } from '@kubevirt-utils/utils/units';

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
});
