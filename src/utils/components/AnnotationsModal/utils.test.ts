import { type TFunction } from 'i18next';

import {
  type AnnotationEntry,
  getAnnotationKeyRequiredMessage,
  getAnnotationRowValidation,
  getAnnotationsSubmitDisabledTooltip,
  getIdAnnotations,
  toAnnotations,
} from './utils';

const t = ((key: string) => key) as TFunction;

const row = (overrides: Partial<AnnotationEntry> = {}): AnnotationEntry => ({
  key: 'owner',
  value: 'team',
  ...overrides,
});

describe('getIdAnnotations', () => {
  it('should convert an annotations map into numbered rows', () => {
    expect(getIdAnnotations({ description: 'vm', owner: 'team' })).toEqual({
      0: { key: 'description', value: 'vm' },
      1: { key: 'owner', value: 'team' },
    });
  });

  it('should return an empty object when annotations are missing', () => {
    expect(getIdAnnotations()).toEqual({});
  });
});

describe('toAnnotations', () => {
  it('should omit rows with an empty or whitespace-only key', () => {
    expect(
      toAnnotations({
        0: row({ key: '', value: 'ignored' }),
        1: row({ key: '   ', value: 'ignored' }),
        2: row(),
      }),
    ).toEqual({ owner: 'team' });
  });
});

describe('getAnnotationRowValidation', () => {
  it('should return false for complete unique keys', () => {
    expect(getAnnotationRowValidation({ 0: row(), 1: row({ key: 'description' }) })).toEqual({
      hasDuplicates: false,
      hasEmptyKeys: false,
    });
  });

  it('should detect empty keys', () => {
    expect(getAnnotationRowValidation({ 0: row({ key: '' }) })).toEqual({
      hasDuplicates: false,
      hasEmptyKeys: true,
    });
  });

  it('should detect duplicate keys', () => {
    expect(getAnnotationRowValidation({ 0: row(), 1: row() })).toEqual({
      hasDuplicates: true,
      hasEmptyKeys: false,
    });
  });
});

describe('getAnnotationKeyRequiredMessage', () => {
  it('should return the annotation key required message', () => {
    expect(getAnnotationKeyRequiredMessage(t)).toBe('Annotation key is required');
  });
});

describe('getAnnotationsSubmitDisabledTooltip', () => {
  it('should prefer the empty-key message when keys are missing', () => {
    expect(
      getAnnotationsSubmitDisabledTooltip(
        { hasDuplicates: true, hasEmptyKeys: true },
        'Annotation key is required',
        'Duplicate keys found',
      ),
    ).toBe('Annotation key is required');
  });

  it('should return the duplicate-keys message when only duplicates exist', () => {
    expect(
      getAnnotationsSubmitDisabledTooltip(
        { hasDuplicates: true, hasEmptyKeys: false },
        'Annotation key is required',
        'Duplicate keys found',
      ),
    ).toBe('Duplicate keys found');
  });

  it('should return undefined when rows are valid', () => {
    expect(
      getAnnotationsSubmitDisabledTooltip(
        { hasDuplicates: false, hasEmptyKeys: false },
        'Annotation key is required',
        'Duplicate keys found',
      ),
    ).toBeUndefined();
  });
});
