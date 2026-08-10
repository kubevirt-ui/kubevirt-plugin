import { TFunction } from 'i18next';

import { ClaimPropertySets } from '@kubevirt-utils/types/storage';
import { isValidUrl } from '@kubevirt-utils/utils/validation';

import { TEST_SUITES } from '../../utils/constants';

/** Empty is valid (optional field). Non-empty values must be absolute http(s) URLs. */
export const isValidWinImageDownloadUrl = (url: string): boolean =>
  isValidUrl(url, { allowEmpty: true });

export const addTestSuite = (prev: string[], value: string): string[] => {
  const updated = new Set([...prev, value]);
  return TEST_SUITES.filter((suite) => updated.has(suite));
};

export const removeTestSuite = (prev: string[], value: string): string[] =>
  prev.filter((suite) => suite !== value);

export const addStorageCapability = (prev: string[], value: string): string[] =>
  Array.from(new Set([...prev, value]));

export const removeStorageCapability = (prev: string[], value: string): string[] =>
  prev.filter((cap) => cap !== value);

export const buildStorageProfileDerivedKey = (
  effectiveStorageClass: string,
  claimPropertySets: ClaimPropertySets | null | undefined,
): string => {
  if (!effectiveStorageClass) return '';
  if (!claimPropertySets?.length) return `${effectiveStorageClass}:empty`;

  return `${effectiveStorageClass}:${JSON.stringify(
    claimPropertySets.map((set) => ({
      accessModes: set.accessModes,
      volumeMode: set.volumeMode,
    })),
  )}`;
};

export const getTestSuitesToggleTitle = (selectedTestSuites: string[], t: TFunction): string => {
  if (selectedTestSuites.length === TEST_SUITES.length) return t('All');
  return t('Test suites');
};
