import { compareWithDirection } from '@kubevirt-utils/utils/utils';
import { SortByDirection } from '@patternfly/react-table';

import { type CapabilityFeature, CapabilityInstallState } from '../../utils/types';

import { COLUMN_KEYS } from './useCustomSelectionColumns';

export const matchesName = (feature: CapabilityFeature, query: string): boolean => {
  const lowerQuery = query.toLowerCase();
  return (
    feature.title.toLowerCase().includes(lowerQuery) ||
    feature.operators.some(({ packageName }) => packageName.toLowerCase().includes(lowerQuery))
  );
};

export const matchesStatus = (
  feature: CapabilityFeature,
  statusFilters: string[],
  getCapabilityInstallState: (f: CapabilityFeature) => CapabilityInstallState,
): boolean => statusFilters.includes(getCapabilityInstallState(feature));

export const sortFeatures = (
  features: CapabilityFeature[],
  sortBy: string,
  direction: string,
  getCapabilityInstallState: (feature: CapabilityFeature) => CapabilityInstallState,
): CapabilityFeature[] => {
  const sorted = [...features];
  const dir = direction as SortByDirection;

  if (sortBy === COLUMN_KEYS.name) {
    sorted.sort((a, b) => compareWithDirection(dir, a.title, b.title));
  }
  if (sortBy === COLUMN_KEYS.status) {
    sorted.sort((a, b) =>
      compareWithDirection(dir, getCapabilityInstallState(a), getCapabilityInstallState(b)),
    );
  }
  return sorted;
};
