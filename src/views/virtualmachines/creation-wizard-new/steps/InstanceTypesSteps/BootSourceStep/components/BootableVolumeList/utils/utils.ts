import {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  DEFAULT_PREFERENCE_LABEL,
  PREFERENCE_DISPLAY_NAME_KEY,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { getPreference } from '@kubevirt-utils/resources/bootableresources/helpers';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import {
  getAnnotation,
  getLabel,
  NamespacedResourceMap,
  ResourceMap,
} from '@kubevirt-utils/resources/shared';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';

export const isLinuxGenericPreference = (preference: string): boolean =>
  preference === 'linux' || preference.startsWith('linux.') || preference.startsWith('linux-');

export const filterBootableVolumesByPreference = (
  bootableVolumes: BootableVolume[],
  preference: string,
): BootableVolume[] => {
  if (!preference) return bootableVolumes;

  if (isLinuxGenericPreference(preference)) {
    return bootableVolumes.filter((vol) => {
      const osCategory = getBootVolumeOS(vol);
      return osCategory !== OS_NAME_TYPES.rhel && osCategory !== OS_NAME_TYPES.windows;
    });
  }

  return bootableVolumes.filter((vol) => {
    const volLabel = getLabel(vol, DEFAULT_PREFERENCE_LABEL);
    if (!volLabel) return true;
    return (
      preference === volLabel ||
      preference.startsWith(`${volLabel}.`) ||
      preference.startsWith(`${volLabel}-`)
    );
  });
};

export const getBootVolumeOS = (bootVolume: BootableVolume): OS_NAME_TYPES => {
  const bootVolumePreference = bootVolume?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL];
  return (
    Object.values(OS_NAME_TYPES).find((osName) => bootVolumePreference?.includes(osName)) ??
    OS_NAME_TYPES.other
  );
};

export const getPaginationFromVolumeIndex =
  (volumeIndex: number) =>
  (prevPagination: PaginationState): PaginationState => {
    if (volumeIndex < 0) {
      return prevPagination;
    }

    const perPage = prevPagination.perPage;
    const page = Math.floor(volumeIndex / perPage) + 1;
    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;

    return {
      endIndex,
      page,
      perPage,
      startIndex,
    };
  };

export const getOSFromDefaultPreference = (
  bootableVolume: BootableVolume,
  preferencesMap: ResourceMap<V1beta1VirtualMachineClusterPreference>,
  userPreferencesMap: NamespacedResourceMap<V1beta1VirtualMachinePreference>,
): string => {
  const defaultPreference = getPreference(bootableVolume, preferencesMap, userPreferencesMap);

  const defaultPreferenceDisplayName = getAnnotation(
    defaultPreference,
    PREFERENCE_DISPLAY_NAME_KEY,
    '',
  );
  return defaultPreferenceDisplayName;
};
