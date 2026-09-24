import { getClusterOnlyArchitecture } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import { ARCHITECTURES } from '@kubevirt-utils/constants/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { getArchitecture } from '@kubevirt-utils/utils/architecture';

import { type VirtualMachinePreference } from './types';

const PREFERENCE_ARCHITECTURE_VALUES = Object.values(ARCHITECTURES);

const shouldSkipArchitectureFiltering = (clusterOnlyArchitecture?: string): boolean =>
  !clusterOnlyArchitecture || clusterOnlyArchitecture === ARCHITECTURES.AMD64;

export const getPreferenceArchitectureFromName = (preferenceName?: string): string | undefined => {
  if (!preferenceName) return undefined;

  return preferenceName
    .split('.')
    .find((segment) => PREFERENCE_ARCHITECTURE_VALUES.includes(segment as ARCHITECTURES));
};

export const getPreferenceArchitecture = (
  preference: VirtualMachinePreference,
): string | undefined =>
  getArchitecture(preference) ?? getPreferenceArchitectureFromName(getName(preference));

export const isPreferenceMatchingClusterArchitecture = (
  preference: VirtualMachinePreference,
  clusterWorkloadArchitectures?: string[],
): boolean => {
  const clusterOnlyArchitecture = getClusterOnlyArchitecture(clusterWorkloadArchitectures);
  if (shouldSkipArchitectureFiltering(clusterOnlyArchitecture)) {
    return true;
  }

  const preferenceArchitecture = getPreferenceArchitecture(preference);
  return !preferenceArchitecture || preferenceArchitecture === clusterOnlyArchitecture;
};

export const filterPreferencesByClusterArchitecture = <T extends VirtualMachinePreference>(
  preferences: T[],
  clusterWorkloadArchitectures?: string[],
): T[] => {
  const clusterOnlyArchitecture = getClusterOnlyArchitecture(clusterWorkloadArchitectures);
  if (shouldSkipArchitectureFiltering(clusterOnlyArchitecture)) {
    return preferences;
  }

  return preferences.filter((preference) =>
    isPreferenceMatchingClusterArchitecture(preference, clusterWorkloadArchitectures),
  );
};
