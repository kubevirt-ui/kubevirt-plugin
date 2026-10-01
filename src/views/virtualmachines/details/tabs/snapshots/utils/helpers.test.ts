import { type TFunction } from 'i18next';

import { validateSnapshotTimeout } from './helpers';

const t = ((key: string) => key) as TFunction;

describe('validateSnapshotTimeout', () => {
  it('should allow empty timeout', () => {
    expect(validateSnapshotTimeout(t, '')).toBeUndefined();
    expect(validateSnapshotTimeout(t, undefined)).toBeUndefined();
  });

  it('should allow positive integers', () => {
    expect(validateSnapshotTimeout(t, '1')).toBeUndefined();
    expect(validateSnapshotTimeout(t, '3600')).toBeUndefined();
  });

  it('should reject zero', () => {
    expect(validateSnapshotTimeout(t, '0')).toBe('Timeout must be greater than 0');
  });

  it('should reject non-numeric strings', () => {
    expect(validateSnapshotTimeout(t, 'abc')).toBe('Timeout must be a number');
  });

  it('should reject scientific notation (regression: CNV-96227)', () => {
    expect(validateSnapshotTimeout(t, '1e1')).toBe('Timeout must be a number');
    expect(validateSnapshotTimeout(t, '1E10')).toBe('Timeout must be a number');
  });

  it('should reject decimal values', () => {
    expect(validateSnapshotTimeout(t, '1.5')).toBe('Timeout must be a number');
  });

  it('should reject negative values', () => {
    expect(validateSnapshotTimeout(t, '-1')).toBe('Timeout must be a number');
  });
});
