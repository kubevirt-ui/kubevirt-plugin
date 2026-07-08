import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';

import {
  apiValueToDisplay,
  displayToApiValue,
  getCurrentOvercommit,
  getRatioLevel,
  isValidRatio,
} from './utils';

describe('displayToApiValue', () => {
  it('converts 100% to 100 (no overcommit)', () => expect(displayToApiValue(100)).toBe(100));
  it('converts 50% to 200 (2x overcommit)', () => expect(displayToApiValue(50)).toBe(200));
  it('converts 97% to 103 (default round-trip)', () => expect(displayToApiValue(97)).toBe(103));
});

describe('apiValueToDisplay', () => {
  it('converts 100 to 100%', () => expect(apiValueToDisplay(100)).toBe(100));
  it('converts 103 back to 97% (default round-trip)', () =>
    expect(apiValueToDisplay(103)).toBe(97));
});

describe('isValidRatio', () => {
  it('returns true at minimum (25)', () => expect(isValidRatio(25)).toBe(true));
  it('returns true at maximum (100)', () => expect(isValidRatio(100)).toBe(true));
  it('returns false below minimum (24)', () => expect(isValidRatio(24)).toBe(false));
});

describe('getRatioLevel', () => {
  it('returns recommended for 100', () => expect(getRatioLevel(100)).toBe('recommended'));
  it('returns caution for 74', () => expect(getRatioLevel(74)).toBe('caution'));
  it('returns risk for 49', () => expect(getRatioLevel(49)).toBe('risk'));
});

describe('getCurrentOvercommit', () => {
  it('converts API value to display value', () => {
    const hco = {
      spec: { higherWorkloadDensity: { memoryOvercommitPercentage: 103 } },
    } as HyperConverged;
    expect(getCurrentOvercommit(hco)).toBe(97);
  });

  it('falls back to 100% when field is undefined', () => {
    expect(getCurrentOvercommit({ spec: {} } as HyperConverged)).toBe(100);
  });

  it('falls back to 100% when hyperConverge is undefined', () => {
    expect(getCurrentOvercommit(undefined as unknown as HyperConverged)).toBe(100);
  });
});
