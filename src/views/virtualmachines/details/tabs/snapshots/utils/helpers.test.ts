import { type TFunction } from 'i18next';

import { validateSnapshotDeadline } from './helpers';

const t = ((key: string) => key) as TFunction;

describe('validateSnapshotDeadline', () => {
  it('should allow empty deadline', () => {
    expect(validateSnapshotDeadline(t, '')).toBeUndefined();
    expect(validateSnapshotDeadline(t, undefined)).toBeUndefined();
  });

  it('should allow positive integers', () => {
    expect(validateSnapshotDeadline(t, '1')).toBeUndefined();
    expect(validateSnapshotDeadline(t, '3600')).toBeUndefined();
  });

  it('should reject zero', () => {
    expect(validateSnapshotDeadline(t, '0')).toBe('Deadline must be greater than 0');
  });

  it('should reject non-numeric strings', () => {
    expect(validateSnapshotDeadline(t, 'abc')).toBe('Deadline must be a number');
  });

  it('should reject scientific notation (regression: CNV-96227)', () => {
    expect(validateSnapshotDeadline(t, '1e1')).toBe('Deadline must be a number');
    expect(validateSnapshotDeadline(t, '1E10')).toBe('Deadline must be a number');
  });

  it('should reject decimal values', () => {
    expect(validateSnapshotDeadline(t, '1.5')).toBe('Deadline must be a number');
  });

  it('should reject negative values', () => {
    expect(validateSnapshotDeadline(t, '-1')).toBe('Deadline must be a number');
  });
});
