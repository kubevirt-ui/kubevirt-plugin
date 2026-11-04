import type { TFunction } from 'i18next';

import {
  getDNS1123SubdomainError,
  getDNS1123SubdomainErrorLenient,
  getVMNameError,
  getVMNameErrorLenient,
  isDNS1123Subdomain,
  isDNS1123SubdomainLenient,
  isVMName,
  isVMNameLenient,
  VMNameMaxLength,
} from './dns1123SubdomainValidation';

const t = ((key: string) => key) as TFunction;

describe('isDNS1123Subdomain', () => {
  it('should accept valid lowercase alphanumeric subdomains', () => {
    expect(isDNS1123Subdomain('my-vm')).toBe(true);
    expect(isDNS1123Subdomain('test.vm')).toBe(true);
    expect(isDNS1123Subdomain('my.vm.example')).toBe(true);
    expect(isDNS1123Subdomain('a.b')).toBe(true);
    expect(isDNS1123Subdomain('a')).toBe(true);
  });

  it('should reject subdomains with uppercase or invalid characters', () => {
    expect(isDNS1123Subdomain('My-VM')).toBe(false);
    expect(isDNS1123Subdomain('my_vm')).toBe(false);
  });

  it('should reject misplaced dots', () => {
    expect(isDNS1123Subdomain('.my-vm')).toBe(false);
    expect(isDNS1123Subdomain('my-vm.')).toBe(false);
    expect(isDNS1123Subdomain('my..vm')).toBe(false);
    expect(isDNS1123Subdomain('my.-vm')).toBe(false);
    expect(isDNS1123Subdomain('my-.vm')).toBe(false);
  });

  it('should reject subdomains starting or ending with a hyphen', () => {
    expect(isDNS1123Subdomain('-my-vm')).toBe(false);
    expect(isDNS1123Subdomain('my-vm-')).toBe(false);
    expect(isDNS1123Subdomain('my.-vm')).toBe(false);
  });

  it('should reject subdomains longer than 253 characters', () => {
    expect(isDNS1123Subdomain('a'.repeat(253))).toBe(true);
    expect(isDNS1123Subdomain('a'.repeat(254))).toBe(false);
    const dotted = `${'a'.repeat(49)}.${'a'.repeat(49)}.${'a'.repeat(49)}.${'a'.repeat(49)}.${'a'.repeat(53)}`;
    expect(dotted.length).toBe(253);
    expect(isDNS1123Subdomain(dotted)).toBe(true);
  });

  it('should reject empty or undefined values', () => {
    expect(isDNS1123Subdomain('')).toBe(false);
    expect(isDNS1123Subdomain(undefined as unknown as string)).toBe(false);
  });
});

describe('getDNS1123SubdomainError', () => {
  it('should return undefined for a valid subdomain', () => {
    expect(getDNS1123SubdomainError('my.vm')).toBeUndefined();
  });

  it('should return the max length error for overly long subdomains', () => {
    const error = getDNS1123SubdomainError('a'.repeat(254));
    expect(error?.(t)).toBe('Maximum name length is {{ maxNameLength }} characters');
  });

  it('should return the format error for invalid characters', () => {
    const error = getDNS1123SubdomainError('My_VM');
    expect(error?.(t)).toContain('lowercase RFC 1123 subdomain');
  });
});

describe('getDNS1123SubdomainErrorLenient', () => {
  it('should tolerate a trailing hyphen while typing', () => {
    expect(getDNS1123SubdomainErrorLenient('my-vm-')).toBeUndefined();
    expect(getDNS1123SubdomainErrorLenient('my.vm-')).toBeUndefined();
  });

  it('should tolerate a trailing dot while typing', () => {
    expect(getDNS1123SubdomainErrorLenient('my.')).toBeUndefined();
    expect(getDNS1123SubdomainErrorLenient('my.vm.')).toBeUndefined();
  });

  it('should still reject interior format errors even with a trailing separator', () => {
    expect(getDNS1123SubdomainErrorLenient('my..vm.')).toBeDefined();
    expect(getDNS1123SubdomainErrorLenient('my..vm-')).toBeDefined();
  });

  it('should still reject a leading hyphen', () => {
    expect(getDNS1123SubdomainErrorLenient('-my-vm')).toBeDefined();
  });

  it('should still reject a leading dot', () => {
    expect(getDNS1123SubdomainErrorLenient('.my-vm')).toBeDefined();
    expect(getDNS1123SubdomainErrorLenient('.')).toBeDefined();
  });

  it('should still reject overly long values even with a trailing hyphen or dot', () => {
    expect(getDNS1123SubdomainErrorLenient(`${'a'.repeat(253)}-`)).toBeDefined();
    expect(getDNS1123SubdomainErrorLenient(`${'a'.repeat(253)}.`)).toBeDefined();
  });

  it('should return undefined for a valid subdomain', () => {
    expect(getDNS1123SubdomainErrorLenient('my.vm')).toBeUndefined();
  });
});

describe('isDNS1123SubdomainLenient', () => {
  it('should accept a subdomain with a trailing hyphen or dot', () => {
    expect(isDNS1123SubdomainLenient('my-vm-')).toBe(true);
    expect(isDNS1123SubdomainLenient('my.vm.')).toBe(true);
  });

  it('should reject a subdomain with a leading hyphen or dot', () => {
    expect(isDNS1123SubdomainLenient('-my-vm')).toBe(false);
    expect(isDNS1123SubdomainLenient('.my-vm')).toBe(false);
  });

  it('should reject interior format errors while typing', () => {
    expect(isDNS1123SubdomainLenient('my..vm.')).toBe(false);
  });
});

describe('getVMNameError', () => {
  it('should allow DNS-1123 subdomain syntax including periods', () => {
    expect(getVMNameError('my.vm')).toBeUndefined();
  });

  it('should reject names longer than the VM name limit', () => {
    const error = getVMNameError('a'.repeat(VMNameMaxLength + 1));
    expect(error?.(t)).toBe('Maximum name length is {{ maxNameLength }} characters');
  });

  it('should allow names at exactly the VM name limit', () => {
    expect(getVMNameError('a'.repeat(VMNameMaxLength))).toBeUndefined();
  });

  it('should reject invalid subdomain syntax', () => {
    expect(getVMNameError('My_VM')).toBeDefined();
  });
});

describe('getVMNameErrorLenient', () => {
  it('should tolerate a trailing dot or hyphen while typing', () => {
    expect(getVMNameErrorLenient('my.vm.')).toBeUndefined();
    expect(getVMNameErrorLenient('my-vm-')).toBeUndefined();
  });

  it('should reject names over the VM name limit even with a trailing separator', () => {
    expect(getVMNameErrorLenient(`${'a'.repeat(VMNameMaxLength)}-`)).toBeDefined();
  });
});

describe('isVMNameLenient', () => {
  it('should accept valid VM names with periods', () => {
    expect(isVMNameLenient('my.vm')).toBe(true);
  });

  it('should reject names longer than the VM name limit', () => {
    expect(isVMName('a'.repeat(VMNameMaxLength + 1))).toBe(false);
  });
});
