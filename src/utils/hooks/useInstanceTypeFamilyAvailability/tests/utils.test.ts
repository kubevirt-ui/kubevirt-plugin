import {
  addDisabledInstanceTypeFamily,
  isInstanceTypeFamilyVisible,
  isInstanceTypeSeries,
  parseDisabledInstanceTypeFamilies,
  removeDisabledInstanceTypeFamily,
  serializeDisabledInstanceTypeFamilies,
} from '../utils';

describe('isInstanceTypeSeries', () => {
  it('accepts known series and rejects unknown values', () => {
    expect(isInstanceTypeSeries('u1')).toBe(true);
    expect(isInstanceTypeSeries('rt1')).toBe(true);
    expect(isInstanceTypeSeries('x9')).toBe(false);
    expect(isInstanceTypeSeries('')).toBe(false);
  });
});

describe('parseDisabledInstanceTypeFamilies', () => {
  it('returns an empty list for missing or empty input', () => {
    expect(parseDisabledInstanceTypeFamilies(undefined)).toEqual([]);
    expect(parseDisabledInstanceTypeFamilies('')).toEqual([]);
  });

  it('returns an empty list for invalid JSON or non-array JSON', () => {
    expect(parseDisabledInstanceTypeFamilies('not-json')).toEqual([]);
    expect(parseDisabledInstanceTypeFamilies('{"u1":true}')).toEqual([]);
  });

  it('keeps only known series strings', () => {
    expect(parseDisabledInstanceTypeFamilies('["u1","bogus",1,"cx1"]')).toEqual(['u1', 'cx1']);
  });
});

describe('serializeDisabledInstanceTypeFamilies', () => {
  it('de-duplicates and sorts the families', () => {
    expect(serializeDisabledInstanceTypeFamilies(['u1', 'cx1', 'u1'])).toBe('["cx1","u1"]');
  });

  it('serializes an empty list', () => {
    expect(serializeDisabledInstanceTypeFamilies([])).toBe('[]');
  });
});

describe('add/remove disabled family', () => {
  it('adds a family only once', () => {
    expect(addDisabledInstanceTypeFamily(['u1'], 'cx1')).toEqual(['u1', 'cx1']);
    const existing = ['u1'] as const;
    expect(addDisabledInstanceTypeFamily([...existing], 'u1')).toEqual(['u1']);
  });

  it('removes a family', () => {
    expect(removeDisabledInstanceTypeFamily(['u1', 'cx1'], 'u1')).toEqual(['cx1']);
    expect(removeDisabledInstanceTypeFamily(['u1'], 'cx1')).toEqual(['u1']);
  });
});

describe('isInstanceTypeFamilyVisible', () => {
  const disabled = new Set(['u1']);

  it('hides disabled families', () => {
    expect(isInstanceTypeFamilyVisible('u1', disabled)).toBe(false);
  });

  it('shows families that are not disabled', () => {
    expect(isInstanceTypeFamilyVisible('cx1', disabled)).toBe(true);
  });

  it('keeps a disabled family visible when it is the preserved family', () => {
    expect(isInstanceTypeFamilyVisible('u1', disabled, 'u1')).toBe(true);
    expect(isInstanceTypeFamilyVisible('u1', disabled, 'cx1')).toBe(false);
  });
});
