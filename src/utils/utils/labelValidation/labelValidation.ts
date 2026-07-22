import { TFunction } from 'i18next';

import {
  K8S_LABEL_NAME_REGEX,
  K8S_LABEL_PREFIX_REGEX,
  MAX_LABEL_LENGTH,
  MAX_LABEL_PREFIX_LENGTH,
  SYSTEM_LABEL_PREFIXES,
} from './constants';

export const isSystemKey = (key: string): boolean =>
  SYSTEM_LABEL_PREFIXES.some((prefix) => key.startsWith(prefix));

export const hasDuplicateKeys = (keys: string[]): boolean => new Set(keys).size !== keys.length;

export const validateLabelEntry = (
  key: string,
  value: string,
  t: TFunction,
  initialKeys?: Set<string>,
  allKeys?: string[],
): string | undefined => {
  if (!key.trim()) return undefined;

  if (allKeys && allKeys.filter((existing) => existing === key).length > 1)
    return t('Duplicate key');

  const isInitialKey = initialKeys?.has(key);

  if (isInitialKey && isSystemKey(key)) return undefined;

  if (!isInitialKey && isSystemKey(key)) return t('Cannot use system-managed key prefix');

  const keyError = validateK8sLabelKey(key, t);
  if (keyError) return keyError;

  const valueError = validateK8sLabelValue(value, t);
  if (valueError) return valueError;

  return undefined;
};

export const validateK8sLabelKey = (key: string, t: TFunction): string | undefined => {
  if (!key.trim()) return undefined;

  if (key.split('/').length > 2) return t('Key may contain at most one slash');

  const namePart = key.includes('/') ? key.split('/')[1] : key;
  const prefixPart = key.includes('/') ? key.split('/')[0] : '';

  if (prefixPart.length > MAX_LABEL_PREFIX_LENGTH)
    return t('Key prefix must be {{max}} characters or fewer', { max: MAX_LABEL_PREFIX_LENGTH });

  if (namePart.length > MAX_LABEL_LENGTH)
    return t('Key name must be {{max}} characters or fewer', { max: MAX_LABEL_LENGTH });

  if (prefixPart && !K8S_LABEL_PREFIX_REGEX.test(prefixPart)) return t('Invalid key prefix format');

  if (!K8S_LABEL_NAME_REGEX.test(namePart)) return t('Invalid key name format');

  return undefined;
};

export const validateK8sLabelValue = (value: string, t: TFunction): string | undefined => {
  if (!value) return undefined;

  if (value.length > MAX_LABEL_LENGTH)
    return t('Value must be {{max}} characters or fewer', { max: MAX_LABEL_LENGTH });

  if (!K8S_LABEL_NAME_REGEX.test(value)) return t('Invalid label value format');

  return undefined;
};
