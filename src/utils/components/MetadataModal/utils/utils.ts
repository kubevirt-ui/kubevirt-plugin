import { TFunction } from 'i18next';

import { CURATED_LABEL_KEYS, SYSTEM_ANNOTATION_PREFIXES, SYSTEM_LABEL_PREFIXES } from './constants';

export type Labels = Record<string, string>;

type GroupedOptions = {
  label: string;
  options: string[];
}[];

const LABEL_KEY_REGEX =
  /^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*\/)?[A-Za-z0-9]([-A-Za-z0-9_.]*[A-Za-z0-9])?$/;
const LABEL_VALUE_REGEX = /^([A-Za-z0-9]([-A-Za-z0-9_.]*[A-Za-z0-9])?)?$/;

const matchesPrefixes = (key: string, prefixes: string[]): boolean =>
  prefixes.some((prefix) => key.startsWith(prefix));

export const isSystemLabelKey = (key: string): boolean =>
  matchesPrefixes(key, SYSTEM_LABEL_PREFIXES);

export const isSystemAnnotationKey = (key: string): boolean =>
  matchesPrefixes(key, SYSTEM_ANNOTATION_PREFIXES);

const classifyByPrefixes = <TSystem extends string, TUser extends string>(
  data: Labels = {},
  prefixes: string[],
  userKey: TUser,
  systemKey: TSystem,
): Record<TSystem | TUser, Labels> => {
  const user: Labels = {};
  const system: Labels = {};

  Object.entries(data).forEach(([key, value]) => {
    if (matchesPrefixes(key, prefixes)) {
      system[key] = value;
    } else {
      user[key] = value;
    }
  });

  return { [systemKey]: system, [userKey]: user } as Record<TSystem | TUser, Labels>;
};

export const classifyLabels = (labels: Labels = {}): { systemLabels: Labels; userLabels: Labels } =>
  classifyByPrefixes(labels, SYSTEM_LABEL_PREFIXES, 'userLabels', 'systemLabels');

export const classifyAnnotations = (
  annotations: Labels = {},
): { systemAnnotations: Labels; userAnnotations: Labels } =>
  classifyByPrefixes(
    annotations,
    SYSTEM_ANNOTATION_PREFIXES,
    'userAnnotations',
    'systemAnnotations',
  );

export const classifyLabelsForModal = (data: Labels) => {
  const { systemLabels, userLabels } = classifyLabels(data);
  return { system: systemLabels, user: userLabels };
};

export const classifyAnnotationsForModal = (data: Labels) => {
  const { systemAnnotations, userAnnotations } = classifyAnnotations(data);
  return { system: systemAnnotations, user: userAnnotations };
};

export const isLabelKeyValid = (key: string): boolean => LABEL_KEY_REGEX.test(key);

export const isLabelValueValid = (value: string): boolean => LABEL_VALUE_REGEX.test(value);

export const getGroupedOptions = (
  existingKeys: string[],
  inputValue: string,
  t: TFunction,
): GroupedOptions => {
  const filterByInput = (keys: string[]) =>
    inputValue ? keys.filter((k) => k.toLowerCase().includes(inputValue.toLowerCase())) : keys;

  const userKeys = existingKeys.filter(
    (k) => k && !CURATED_LABEL_KEYS.includes(k) && !matchesPrefixes(k, SYSTEM_LABEL_PREFIXES),
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
