import { bytesFromQuantity } from '../quantity';

describe('Test quantity utilities', () => {
  describe('From International System units', () => {
    it('Ki in Ki', () => {
      expect(bytesFromQuantity('1Ki')).toStrictEqual([1, 'Ki']);
    });

    it('Ki in Mi', () => {
      expect(bytesFromQuantity('2134Ki')).toStrictEqual([2, 'Mi']);
    });

    it('Mi in Gi', () => {
      expect(bytesFromQuantity('2134Mi')).toStrictEqual([2, 'Gi']);
    });

    it('Gi in Gi', () => {
      expect(bytesFromQuantity('1Gi')).toStrictEqual([1, 'Gi']);
    });
  });

  describe('From Decimal units', () => {
    it('K in Ki', () => {
      expect(bytesFromQuantity('1K')).toStrictEqual([1000, '']);
    });

    it('G in Gi', () => {
      expect(bytesFromQuantity('1G')).toStrictEqual([954, 'Mi']);
    });
  });

  describe('From digit', () => {
    it('1024 to Ki', () => {
      expect(bytesFromQuantity(1024)).toStrictEqual([1, 'Ki']);
      expect(bytesFromQuantity('1024')).toStrictEqual([1, 'Ki']);
    });

    it('1025 to Ki', () => {
      expect(bytesFromQuantity(1025)).toStrictEqual([1, 'Ki']);
      expect(bytesFromQuantity('1025')).toStrictEqual([1, 'Ki']);
    });

    it('1073741824 to 1 Gi', () => {
      expect(bytesFromQuantity('1073741824')).toStrictEqual([1, 'Gi']);
      expect(bytesFromQuantity(1073741824)).toStrictEqual([1, 'Gi']);
    });
  });

  describe('With precision', () => {
    it('1073741824 to 1 Gi', () => {
      expect(bytesFromQuantity('123456781234', 2)).toStrictEqual([114.98, 'Gi']);
      expect(bytesFromQuantity(123456781234, 2)).toStrictEqual([114.98, 'Gi']);
    });

    it('Mi in Gi', () => {
      expect(bytesFromQuantity('2134Mi', 2)).toStrictEqual([2.08, 'Gi']);
    });
  });
});
