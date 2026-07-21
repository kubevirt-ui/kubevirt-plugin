import { isTemplateFeatureGateEnabled } from '../utils';

describe('isTemplateFeatureGateEnabled', () => {
  it('should return true when Template is explicitly in featureGates', () => {
    expect(isTemplateFeatureGateEnabled(['Template'], undefined)).toBe(true);
    expect(isTemplateFeatureGateEnabled(['Template'], ['Template'])).toBe(true);
  });

  it('should return true when disabledFeatureGates is present and Template is absent', () => {
    expect(isTemplateFeatureGateEnabled([], [])).toBe(true);
    expect(isTemplateFeatureGateEnabled(undefined, ['PasstBinding'])).toBe(true);
  });

  it('should return false when Template is in disabledFeatureGates', () => {
    expect(isTemplateFeatureGateEnabled([], ['Template'])).toBe(false);
    expect(isTemplateFeatureGateEnabled(undefined, ['Template', 'PasstBinding'])).toBe(false);
  });

  it('should return false when neither list indicates Template is available', () => {
    expect(isTemplateFeatureGateEnabled(undefined, undefined)).toBe(false);
    expect(isTemplateFeatureGateEnabled([], undefined)).toBe(false);
  });
});
