import { TFunction } from 'i18next';
import { isDataSourceReady } from 'src/views/datasources/utils';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { DEFAULT_PREFERENCE_LABEL } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { getLabel, getName } from '@kubevirt-utils/resources/shared';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { ClaimPropertySets } from '@kubevirt-utils/types/storage';

import { TEST_SUITES } from '../../utils';

export const isReadyWindowsDataSource = (dataSource: V1beta1DataSource): boolean => {
  if (!isDataSourceReady(dataSource)) return false;

  const preferenceName = getLabel(dataSource, DEFAULT_PREFERENCE_LABEL)?.toLowerCase() ?? '';
  if (preferenceName.includes(OS_NAME_TYPES.windows)) {
    return true;
  }

  const dataSourceName = getName(dataSource)?.toLowerCase() ?? '';
  return dataSourceName.includes(OS_NAME_TYPES.windows);
};

export const resolveWinImageName = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  if (value.includes('/')) {
    const name = value.split('/').pop();
    return name || undefined;
  }
  return value;
};

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

export const isDownloadUrlDisabled = (
  winImageName: string,
  dataSourceOptions: { value: string }[],
): boolean => Boolean(winImageName) && dataSourceOptions.some((opt) => opt.value === winImageName);

export const shouldShowDownloadUrlTooltip = (
  winImageName: string,
  winImageDownloadUrl: string,
  dataSourceOptions: { value: string }[],
): boolean =>
  isDownloadUrlDisabled(winImageName, dataSourceOptions) && Boolean(winImageDownloadUrl);

export const getDownloadUrlDisabledMessage = (t: TFunction): string =>
  t('Download URL is not needed when an existing Windows DataSource is selected.');
