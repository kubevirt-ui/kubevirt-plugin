import {
  findMaxYValue,
  findMigrationMaxYValue,
  findNetworkMaxYValue,
  getChartYRange,
} from './utils';

const point = (y: number) => ({ x: new Date(), y });

describe('findMaxYValue', () => {
  it('should return null for undefined input', () => {
    expect(findMaxYValue(undefined as any)).toBeNull();
  });

  it('should return null for empty array', () => {
    expect(findMaxYValue([])).toBeNull();
  });

  it('should return the max Y value', () => {
    expect(findMaxYValue([point(10), point(50), point(30)])).toBe(50);
  });

  it('should handle zero as max', () => {
    expect(findMaxYValue([point(0), point(0)])).toBe(0);
  });

  it('should handle negative values', () => {
    expect(findMaxYValue([point(-5), point(-1), point(-10)])).toBe(-1);
  });

  it('should handle single element', () => {
    expect(findMaxYValue([point(42)])).toBe(42);
  });

  it('should handle NaN values gracefully', () => {
    expect(findMaxYValue([point(NaN), point(NaN)])).toBeNull();
  });

  it('should skip NaN and find finite max', () => {
    expect(findMaxYValue([point(NaN), point(5), point(NaN)])).toBe(5);
  });
});

describe('findMigrationMaxYValue', () => {
  it('should return null when all series are undefined', () => {
    expect(findMigrationMaxYValue(undefined, undefined, undefined)).toBeNull();
  });

  it('should return null when all series are empty', () => {
    expect(findMigrationMaxYValue([], [], [])).toBeNull();
  });

  it('should find max across all three series', () => {
    const processed = [point(10), point(20)];
    const remaining = [point(50), point(30)];
    const dirtyRate = [point(5), point(15)];
    expect(findMigrationMaxYValue(processed, remaining, dirtyRate)).toBe(50);
  });

  it('should handle mixed empty and populated series', () => {
    expect(findMigrationMaxYValue([], [point(42)], undefined)).toBe(42);
  });

  it('should return 0 when all values are zero', () => {
    expect(findMigrationMaxYValue([point(0)], [point(0)], [point(0)])).toBe(0);
  });
});

describe('findNetworkMaxYValue', () => {
  const netPoint = (name: string, y: number) => ({ name, x: new Date(), y });

  it('should return null for undefined input', () => {
    expect(findNetworkMaxYValue(undefined as any)).toBeNull();
  });

  it('should return null for empty array', () => {
    expect(findNetworkMaxYValue([])).toBeNull();
  });

  it('should find max across nested arrays', () => {
    const data = [
      [netPoint('eth0', 100), netPoint('eth0', 200)],
      [netPoint('eth1', 150), netPoint('eth1', 50)],
    ];
    expect(findNetworkMaxYValue(data)).toBe(200);
  });

  it('should ceil non-integer values', () => {
    const data = [[netPoint('eth0', 100.7)]];
    expect(findNetworkMaxYValue(data)).toBe(101);
  });

  it('should ceil small fractional maxima', () => {
    const data = [[netPoint('eth0', 100.1)]];
    expect(findNetworkMaxYValue(data)).toBe(101);
  });

  it('should return integer values as-is', () => {
    const data = [[netPoint('eth0', 100)]];
    expect(findNetworkMaxYValue(data)).toBe(100);
  });

  it('should handle empty inner arrays', () => {
    const data = [[], [netPoint('eth0', 50)]];
    expect(findNetworkMaxYValue(data)).toBe(50);
  });

  it('should return null when all inner arrays are empty', () => {
    expect(findNetworkMaxYValue([[], []])).toBeNull();
  });
});

describe('getChartYRange', () => {
  it('should return undefined for null', () => {
    expect(getChartYRange(null)).toBeUndefined();
  });

  it('should return [0, 1] for zero', () => {
    expect(getChartYRange(0)).toEqual([0, 1]);
  });

  it('should return [0, value] for positive values', () => {
    expect(getChartYRange(100)).toEqual([0, 100]);
  });

  it('should return [0, value] for fractional values', () => {
    expect(getChartYRange(0.5)).toEqual([0, 0.5]);
  });
});
