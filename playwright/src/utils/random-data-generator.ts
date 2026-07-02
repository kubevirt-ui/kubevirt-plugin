/**
 * Centralized utility for generating random test data.
 * Provides methods for creating random names, strings, numbers, UUIDs, IPs, and more.
 */

export function generateRandomPassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function generateRandomName(prefix = 'test'): string {
  return `pw-${prefix}-${generateRandomString(8, 'alphanumeric').toLowerCase()}`;
}

export function generateRandomVmName(prefix = 'vm'): string {
  return generateRandomName(prefix);
}

export function generateRandomTemplateName(prefix = 'template'): string {
  return generateRandomName(prefix);
}

export function generateRandomInstanceTypeName(prefix = 'instancetype'): string {
  return generateRandomName(prefix);
}

export function generateRandomMigrationPolicyName(prefix = 'policy'): string {
  return generateRandomName(prefix);
}

export function generateRandomDataVolumeName(prefix = 'vol'): string {
  return generateRandomName(prefix);
}

export function generateRandomFolderName(prefix = 'folder'): string {
  return generateRandomName(prefix);
}

export function generateRandomSnapshotName(prefix = 'snapshot'): string {
  return generateRandomName(prefix);
}

export function generateRandomNadName(prefix = 'nad'): string {
  return generateRandomName(prefix);
}

export function generateRandomCheckupName(prefix = 'checkup'): string {
  return generateRandomName(prefix);
}

export function generateRandomQuotaName(prefix = 'quota'): string {
  return generateRandomName(prefix);
}

export function generateRandomDiskName(prefix = 'disk'): string {
  return generateRandomName(prefix);
}

export function generateRandomConfigMapName(prefix = 'cm'): string {
  return generateRandomName(prefix);
}

export function generateRandomPvcName(prefix = 'pvc'): string {
  return generateRandomName(prefix);
}

export function generateRandomSecretName(prefix = 'secret'): string {
  return generateRandomName(prefix);
}

export function generateRandomString(
  length = 8,
  charset: 'alphabetic' | 'alphanumeric' | 'hex' | 'numeric' = 'alphanumeric',
): string {
  let chars: string;

  switch (charset) {
    case 'alphabetic':
      chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      break;
    case 'numeric':
      chars = '0123456789';
      break;
    case 'hex':
      chars = '0123456789ABCDEF';
      break;
    case 'alphanumeric':
    default:
      chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      break;
  }

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateRandomNumber(min = 0, max = 100): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function generateRandomBoolean(): boolean {
  return Math.random() < 0.5;
}

export function pickRandomElement<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot pick from empty array');
  }
  return array[Math.floor(Math.random() * array.length)];
}

export function generateRandomEmail(domain = 'example.com'): string {
  const username = generateRandomString(8, 'alphanumeric');
  return `${username}@${domain}`;
}

export function generateRandomUuid(): string {
  const hex = generateRandomString(32, 'hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20,
  )}-${hex.slice(20, 32)}`;
}

export function generateRandomMacAddress(): string {
  const hex = generateRandomString(12, 'hex');
  return hex.match(/.{2}/g)?.join(':') || '';
}

export function generateRandomIpAddress(version: 4 | 6 = 4): string {
  if (version === 4) {
    return `${generateRandomNumber(1, 255)}.${generateRandomNumber(0, 255)}.${generateRandomNumber(
      0,
      255,
    )}.${generateRandomNumber(1, 255)}`;
  } else {
    // Simplified IPv6 generation
    const segments = Array.from({ length: 8 }, () => generateRandomString(4, 'hex'));
    return segments.join(':');
  }
}

export function generateRandomPort(min = 1024, max = 65535): number {
  return generateRandomNumber(min, max + 1);
}

export function generateRandomTimestamp(
  startDate: Date = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
  endDate: Date = new Date(),
): number {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return generateRandomNumber(start, end);
}

export function generateRandomDate(
  startDate: Date = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
  endDate: Date = new Date(),
): Date {
  return new Date(generateRandomTimestamp(startDate, endDate));
}

export function generateRandomColor(): string {
  return `#${generateRandomString(6, 'hex')}`;
}

export function generateRandomHostname(length = 8): string {
  const hostname = generateRandomString(length, 'alphanumeric');
  return `${hostname}.local`;
}

export function generateRandomNamespaceName(prefix = 'test-ns'): string {
  return generateRandomName(prefix);
}

/**
 * Generates a test namespace name with the "pw-" prefix.
 * Format: pw-{prefix}-{randomAlphanumeric}
 *
 * @param prefix - The prefix to use (e.g., 'vm-delete', 'vm-snapshot')
 * @returns A unique namespace name starting with "pw-"
 *
 * @example
 * generateTestNamespace('vm-delete') // Returns: pw-vm-delete-a1b2c3d4
 */
export function generateTestNamespace(prefix: string): string {
  return `pw-${prefix}-${generateRandomString(8, 'alphanumeric').toLowerCase()}`;
}

export function generateRandomLabelValue(length = 6): string {
  return generateRandomString(length, 'alphanumeric');
}

export function generateRandomAnnotationValue(length = 10): string {
  return generateRandomString(length, 'alphanumeric');
}
