import { generateParameterValueFromExpression } from './generateParameterValue';

describe('generateParameterValueFromExpression', () => {
  it('returns empty string for empty input', () => {
    expect(generateParameterValueFromExpression('')).toBe('');
  });

  it('preserves literal prefixes', () => {
    const value = generateParameterValueFromExpression('fedora-[a-z0-9]{4}');
    expect(value).toMatch(/^fedora-[a-z0-9]{4}$/);
  });

  it('generates values for digit class', () => {
    const value = generateParameterValueFromExpression('[0-9]{6}');
    expect(value).toMatch(/^\d{6}$/);
  });

  it('supports escaped digit class', () => {
    const value = generateParameterValueFromExpression('\\d{4}');
    expect(value).toMatch(/^\d{4}$/);
  });
});
