import { TFunction } from 'i18next';

import {
  getCronScheduleFormatError,
  getDNS1123LabelError,
  getDNS1123LabelErrorLenient,
  getFieldRequiredMessage,
  getNameValidationMessage,
  isDigitsOnly,
  isDNS1123Label,
  isDNS1123LabelLenient,
  isValidCronExpression,
  isValidUrl,
  validateCronExpression,
  validateDNS1123Label,
} from './validation';

const t = ((key: string) => key) as TFunction;

describe('isDNS1123Label', () => {
  it('should accept valid lowercase alphanumeric labels', () => {
    expect(isDNS1123Label('my-vm')).toBe(true);
    expect(isDNS1123Label('vm1')).toBe(true);
    expect(isDNS1123Label('a')).toBe(true);
  });

  it('should reject labels with uppercase or invalid characters', () => {
    expect(isDNS1123Label('My-VM')).toBe(false);
    expect(isDNS1123Label('my_vm')).toBe(false);
    expect(isDNS1123Label('my.vm')).toBe(false);
  });

  it('should reject labels starting or ending with a hyphen', () => {
    expect(isDNS1123Label('-my-vm')).toBe(false);
    expect(isDNS1123Label('my-vm-')).toBe(false);
  });

  it('should reject labels longer than 63 characters', () => {
    expect(isDNS1123Label('a'.repeat(64))).toBe(false);
    expect(isDNS1123Label('a'.repeat(63))).toBe(true);
  });

  it('should reject empty or undefined values', () => {
    expect(isDNS1123Label('')).toBe(false);
    expect(isDNS1123Label(undefined as unknown as string)).toBe(false);
  });
});

describe('getDNS1123LabelError', () => {
  it('should return undefined for a valid label', () => {
    expect(getDNS1123LabelError('my-vm')).toBeUndefined();
  });

  it('should return the max length error for overly long labels', () => {
    const error = getDNS1123LabelError('a'.repeat(64));
    expect(error?.(t)).toBe('Maximum name length is {{ maxNameLength }} characters');
  });

  it('should return the format error for invalid characters', () => {
    const error = getDNS1123LabelError('My_VM');
    expect(error?.(t)).toContain('lowercase RFC 1123 label');
  });
});

describe('getDNS1123LabelErrorLenient', () => {
  it('should tolerate a trailing hyphen while typing', () => {
    expect(getDNS1123LabelErrorLenient('my-vm-')).toBeUndefined();
  });

  it('should still reject a leading hyphen', () => {
    expect(getDNS1123LabelErrorLenient('-my-vm')).toBeDefined();
  });

  it('should still reject overly long values even with a trailing hyphen', () => {
    expect(getDNS1123LabelErrorLenient(`${'a'.repeat(63)}-`)).toBeDefined();
  });

  it('should return undefined for a valid label', () => {
    expect(getDNS1123LabelErrorLenient('my-vm')).toBeUndefined();
  });
});

describe('isDNS1123LabelLenient', () => {
  it('should accept a label with a trailing hyphen', () => {
    expect(isDNS1123LabelLenient('my-vm-')).toBe(true);
  });

  it('should reject a label with a leading hyphen', () => {
    expect(isDNS1123LabelLenient('-my-vm')).toBe(false);
  });
});

describe('validateDNS1123Label', () => {
  it('should return undefined for a valid label', () => {
    expect(validateDNS1123Label(t, 'my-vm')).toBeUndefined();
  });

  it('should return an error message for an invalid label', () => {
    expect(validateDNS1123Label(t, 'My_VM')).toContain('lowercase RFC 1123 label');
  });
});

describe('getFieldRequiredMessage', () => {
  it('should return the required field message', () => {
    expect(getFieldRequiredMessage(t)).toBe('This field is required');
  });
});

describe('getNameValidationMessage', () => {
  it('should return the required message for an empty value', () => {
    expect(getNameValidationMessage(t, '')).toBe('This field is required');
    expect(getNameValidationMessage(t, '   ')).toBe('This field is required');
  });

  it('should return the format error for an invalid non-empty value', () => {
    expect(getNameValidationMessage(t, 'My_VM')).toContain('lowercase RFC 1123 label');
  });

  it('should return undefined for a valid value', () => {
    expect(getNameValidationMessage(t, 'my-vm')).toBeUndefined();
  });
});

describe('isDigitsOnly', () => {
  it('should accept strings containing only digits', () => {
    expect(isDigitsOnly('12345')).toBe(true);
  });

  it('should reject empty strings and non-digit characters', () => {
    expect(isDigitsOnly('')).toBe(false);
    expect(isDigitsOnly('123a')).toBe(false);
    expect(isDigitsOnly('-123')).toBe(false);
    expect(isDigitsOnly('1.5')).toBe(false);
  });
});

describe('isValidCronExpression', () => {
  it('should accept a standard 5-field cron expression', () => {
    expect(isValidCronExpression('0 */12 * * *')).toBe(true);
    expect(isValidCronExpression('30 4 1 1 0')).toBe(true);
    expect(isValidCronExpression('*/15 * * * *')).toBe(true);
  });

  it('should reject empty or whitespace-only values', () => {
    expect(isValidCronExpression('')).toBe(false);
    expect(isValidCronExpression('   ')).toBe(false);
  });

  it('should reject expressions without exactly 5 fields', () => {
    expect(isValidCronExpression('0 * * *')).toBe(false);
    expect(isValidCronExpression('0 * * * * *')).toBe(false);
  });

  it('should reject fields with out-of-range values', () => {
    expect(isValidCronExpression('60 * * * *')).toBe(false);
    expect(isValidCronExpression('0 24 * * *')).toBe(false);
    expect(isValidCronExpression('0 0 32 * *')).toBe(false);
    expect(isValidCronExpression('0 0 * 13 *')).toBe(false);
    expect(isValidCronExpression('0 0 * * 8')).toBe(false);
  });

  it('should reject a zero step value', () => {
    expect(isValidCronExpression('*/0 * * * *')).toBe(false);
  });
});

describe('getCronScheduleFormatError', () => {
  it('should return the invalid cron schedule message', () => {
    expect(getCronScheduleFormatError(t)).toBe(
      'Invalid cron schedule format. Use standard cron syntax (e.g., {{ example }}).',
    );
  });
});

describe('validateCronExpression', () => {
  it('should return undefined for an empty value', () => {
    expect(validateCronExpression(t, '')).toBeUndefined();
  });

  it('should return undefined for a valid cron expression', () => {
    expect(validateCronExpression(t, '0 */12 * * *')).toBeUndefined();
  });

  it('should return the format error for an invalid cron expression', () => {
    expect(validateCronExpression(t, '60 * * * *')).toBe(
      'Invalid cron schedule format. Use standard cron syntax (e.g., {{ example }}).',
    );
  });
});

describe('isValidUrl', () => {
  it('should reject empty or whitespace-only values by default', () => {
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('   ')).toBe(false);
  });

  it('should allow empty values when allowEmpty is set', () => {
    expect(isValidUrl('', { allowEmpty: true })).toBe(true);
    expect(isValidUrl('   ', { allowEmpty: true })).toBe(true);
  });

  it('should accept absolute http and https URLs', () => {
    expect(isValidUrl('https://example.com/windows.iso')).toBe(true);
    expect(isValidUrl('http://mirror.local/win.iso')).toBe(true);
  });

  it('should reject non-http(s) protocols', () => {
    expect(isValidUrl('file:///tmp/windows.iso')).toBe(false);
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
    expect(isValidUrl('ftp://example.com/windows.iso')).toBe(false);
  });

  it('should reject malformed URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
  });

  it('should reject relative paths by default', () => {
    expect(isValidUrl('/relative/path.iso')).toBe(false);
  });

  it('should accept relative paths when allowRelative is set', () => {
    expect(isValidUrl('/relative/path.iso', { allowRelative: true })).toBe(true);
    expect(isValidUrl('//not-a-single-slash-path', { allowRelative: true })).toBe(false);
  });

  it('should reject values longer than maxLength', () => {
    const tooLong = `https://example.com/${'a'.repeat(2048)}`;
    expect(isValidUrl(tooLong, { maxLength: 2048 })).toBe(false);
  });

  it('should accept values within maxLength', () => {
    expect(isValidUrl('https://example.com', { maxLength: 2048 })).toBe(true);
  });
});
