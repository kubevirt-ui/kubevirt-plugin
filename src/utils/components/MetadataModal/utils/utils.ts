import { TFunction } from 'i18next';

import {
  CURATED_LABEL_KEYS,
  K8S_DNS_SUBDOMAIN_MAX,
  K8S_LABEL_SEGMENT_MAX,
  LABEL_KEY_REGEX,
  LABEL_VALUE_REGEX,
  SYSTEM_ANNOTATION_PREFIXES,
  SYSTEM_LABEL_PREFIXES,
} from './constants';
import { GroupedOptions, Labels } from './types';

export type { GroupedOptions, Labels } from './types';

export const createLabelKeyId = (value: string): string =>
  `label-key-select-${String(value).replace(/[^a-zA-Z0-9_-]/g, '-')}`;

const matchesPrefixes = (key: string, prefixes: string[]): boolean =>
  prefixes.some((prefix) => key.startsWith(prefix));

export const isSystemLabelKey = (key: string): boolean =>
  matchesPrefixes(key, SYSTEM_LABEL_PREFIXES);

const classifyByPrefixes = (
  data: Labels = {},
  prefixes: string[],
): { system: Labels; user: Labels } => {
  const user: Labels = {};
  const system: Labels = {};

  Object.entries(data).forEach(([key, value]) => {
    if (matchesPrefixes(key, prefixes)) {
      system[key] = value;
    } else {
      user[key] = value;
    }
  });

  return { system, user };
};

export const classifyLabels = (labels: Labels = {}): { system: Labels; user: Labels } =>
  classifyByPrefixes(labels, SYSTEM_LABEL_PREFIXES);

export const classifyAnnotations = (annotations: Labels = {}): { system: Labels; user: Labels } =>
  classifyByPrefixes(annotations, SYSTEM_ANNOTATION_PREFIXES);

export const isLabelKeyValid = (key: string): boolean => LABEL_KEY_REGEX.test(key);

export const isLabelValueValid = (value: string): boolean => LABEL_VALUE_REGEX.test(value);

export const isValidKeyOnClose = (inputValue: string, selectedKey: string): boolean =>
  !!inputValue &&
  inputValue !== selectedKey &&
  !isSystemLabelKey(inputValue) &&
  isLabelKeyValid(inputValue);

export const isValidNewLabelKey = (
  inputValue: string,
  selectedKey: string,
  existingKeys: string[],
): boolean =>
  Boolean(
    inputValue &&
    inputValue !== selectedKey &&
    !existingKeys.includes(inputValue) &&
    !CURATED_LABEL_KEYS.includes(inputValue) &&
    !isSystemLabelKey(inputValue) &&
    isLabelKeyValid(inputValue),
  );

export const validateLabelEntry = (
  key: string,
  value: string,
  t: TFunction,
): string | undefined => {
  if (!key) return undefined;
  if (!isLabelKeyValid(key))
    return t(
      'Invalid label key format. Keys must consist of alphanumeric characters, dashes, underscores, or dots, with an optional DNS subdomain prefix.',
    );

  const [prefix, name] = key.includes('/') ? [key.split('/')[0], key.split('/')[1]] : ['', key];
  if (name.length > K8S_LABEL_SEGMENT_MAX)
    return t('Label key name must be {{max}} characters or fewer.', { max: K8S_LABEL_SEGMENT_MAX });
  if (prefix.length > K8S_DNS_SUBDOMAIN_MAX)
    return t('Label key prefix must be {{max}} characters or fewer.', {
      max: K8S_DNS_SUBDOMAIN_MAX,
    });

  if (!value) return undefined;
  if (!isLabelValueValid(value))
    return t(
      'Invalid label value. Values must consist of alphanumeric characters, dashes, underscores, or dots.',
    );
  if (value.length > K8S_LABEL_SEGMENT_MAX)
    return t('Label value must be {{max}} characters or fewer.', { max: K8S_LABEL_SEGMENT_MAX });

  return undefined;
};

export const getGroupedOptions = (
  existingKeys: string[],
  inputValue: string,
  t: TFunction,
): GroupedOptions => {
  const filterByInput = (keys: string[]) =>
    inputValue ? keys.filter((key) => key.toLowerCase().includes(inputValue.toLowerCase())) : keys;

  const userKeys = existingKeys.filter(
    (key) =>
      key && !CURATED_LABEL_KEYS.includes(key) && !matchesPrefixes(key, SYSTEM_LABEL_PREFIXES),
  );
  const suggested = filterByInput(CURATED_LABEL_KEYS);
  const user = filterByInput(userKeys);
  const groups: GroupedOptions = [];

  if (suggested.length) {
    groups.push({ label: t('Suggested keys'), options: suggested });
  }

  if (user.length) {
    groups.push({ label: t('User keys'), options: user });
  }

  return groups;
};

export const entriesToLabels = (entries: { key: string; value: string }[]): Labels =>
  Object.fromEntries(
    entries.filter(({ key }) => key.trim()).map(({ key, value }) => [key.trim(), value]),
  );
