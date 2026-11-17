import { DNS1123LabelMaxLength } from '@kubevirt-utils/utils/validation';

const stripTrailingNameSeparators = (name: string): string => name.replace(/[.-]+$/, '');

/** Build `prefix-suffix` (or `prefix` when suffix is empty), truncating the prefix to fit maxLength. */
export const truncateWithSuffix = (
  prefix: string,
  suffix: string,
  maxLength: number = DNS1123LabelMaxLength,
): string => {
  const separator = suffix ? '-' : '';
  const fullName = `${prefix}${separator}${suffix}`;
  if (fullName.length <= maxLength) {
    return fullName;
  }

  const availableLength = maxLength - suffix.length - separator.length;
  let truncatedPrefix = prefix.slice(0, Math.max(1, availableLength));
  truncatedPrefix = stripTrailingNameSeparators(truncatedPrefix) || prefix.slice(0, 1);
  return `${truncatedPrefix}${separator}${suffix}`;
};
