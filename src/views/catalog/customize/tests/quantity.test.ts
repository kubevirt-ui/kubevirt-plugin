import { bytesFromQuantity } from '../components/DiskSource/quantity';

describe('Test quantity utilities', () => {
  describe('From International System units', () => {
    it('Ki in KiB', () => {
      expect(bytesFromQuantity('1Ki')).toStrictEqual([1, 'KiB']);
    });

    it('Gi in GiB', () => {
      expect(bytesFromQuantity('1Gi')).toStrictEqual([1, 'GiB']);
    });
  });

  describe('From Decimal units', () => {
    it('K in KiB', () => {
      expect(bytesFromQuantity('1K')).toStrictEqual([1000, 'B']);
    });

    it('G in GiB', () => {
      expect(bytesFromQuantity('1G')).toStrictEqual([953, 'MiB']);
    });
  });

  describe('From digit', () => {
    it('1024 to KiB', () => {
      expect(bytesFromQuantity(1024)).toStrictEqual([1, 'KiB']);
      expect(bytesFromQuantity('1024')).toStrictEqual([1, 'KiB']);
    });

    it('1025 to KiB', () => {
      expect(bytesFromQuantity(1025)).toStrictEqual([1, 'KiB']);
      expect(bytesFromQuantity('1025')).toStrictEqual([1, 'KiB']);
    });

    it('1073741824 to 1 GiB', () => {
      expect(bytesFromQuantity('1073741824')).toStrictEqual([1, 'GiB']);
      expect(bytesFromQuantity(1073741824)).toStrictEqual([1, 'GiB']);
    });
  });
});
