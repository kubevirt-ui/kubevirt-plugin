import { type TFunction } from 'i18next';

import type {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  DEFAULT_PREFERENCE_LABEL,
  PREFERENCE_DISPLAY_NAME_KEY,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import type { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import {
  getPreference,
  isBootableVolumePVCKind,
} from '@kubevirt-utils/resources/bootableresources/helpers';
import type { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import type { NamespacedResourceMap, ResourceMap } from '@kubevirt-utils/resources/shared';
import { getAnnotation, getLabel, getName } from '@kubevirt-utils/resources/shared';
import { LINUX, OS_NAME_TYPES, RHEL, WINDOWS } from '@kubevirt-utils/resources/template';
import { OS_IMAGES_NS } from '@kubevirt-utils/utils/utils';

import {
  CENTOS_STREAM_PREFERENCE_PREFIX,
  CENTOS_STREAM_RESOURCE_NAME_PREFIX,
  WIN_RESOURCE_NAME_PREFIX,
} from './constants';

export const isLinuxGenericPreference = (preference: string): boolean =>
  preference === 'linux' || preference.startsWith('linux.') || preference.startsWith('linux-');

// Maps a common OS-image resource name (DataSource name, e.g. "win2k22", "rhel9",
// "centos-stream9") to the equivalent VirtualMachine(Cluster)Preference name
// (e.g. "windows.2k22", "rhel.9", "centos.stream9"), per the common-instancetypes
// naming convention. Returns undefined for names that don't match a known pattern.
export const getPreferenceIdentifierFromResourceName = (name?: string): string | undefined => {
  const lowerName = name?.toLowerCase();
  if (!lowerName) return undefined;

  const winMatch = new RegExp(`^${WIN_RESOURCE_NAME_PREFIX}(\\d.*)$`).exec(lowerName);
  if (winMatch) return `${WINDOWS}.${winMatch[1]}`;

  if (lowerName.startsWith(CENTOS_STREAM_RESOURCE_NAME_PREFIX))
    return `${CENTOS_STREAM_PREFERENCE_PREFIX}${lowerName.slice(CENTOS_STREAM_RESOURCE_NAME_PREFIX.length)}`;

  const rhelMatch = new RegExp(`^${RHEL}(\\d.*)$`).exec(lowerName);
  if (rhelMatch) return `${RHEL}.${rhelMatch[1]}`;

  return lowerName.startsWith(OS_NAME_TYPES.Fedora) ? lowerName : undefined;
};

// A DataSource's own default-preference label is the primary signal, but several built-in
// DataSources (e.g. all Windows images, rhel7) carry no such label on real clusters, so we fall
// back to an identifier derived from the volume's own resource name. PVC boot sources without a
// label are user uploads/clones — their names are not OS identifiers.
const getBootVolumePreferenceIdentifier = (bootVolume: BootableVolume): string | undefined => {
  const preferenceLabel = getLabel(bootVolume, DEFAULT_PREFERENCE_LABEL);
  if (preferenceLabel) {
    return preferenceLabel;
  }

  if (isBootableVolumePVCKind(bootVolume)) {
    return undefined;
  }

  return getPreferenceIdentifierFromResourceName(getName(bootVolume));
};

export const filterBootableVolumesByPreference = (
  bootableVolumes: BootableVolume[],
  preference: string,
): BootableVolume[] => {
  if (!preference) return bootableVolumes;

  if (isLinuxGenericPreference(preference)) {
    return bootableVolumes.filter((vol) => {
      const osCategory = getBootVolumeOS(vol);
      return osCategory !== OS_NAME_TYPES.Rhel && osCategory !== OS_NAME_TYPES.Windows;
    });
  }

  return bootableVolumes.filter((vol) => {
    const volLabel = getBootVolumePreferenceIdentifier(vol);
    if (!volLabel) return true;
    return (
      preference === volLabel ||
      // preference is a specific preference name (e.g. "rhel.9") and volLabel is more generic (e.g. "rhel")
      preference.startsWith(`${volLabel}.`) ||
      preference.startsWith(`${volLabel}-`) ||
      // preference is only an OS family (e.g. "rhel", derived from a template without a real
      // preference reference) and volLabel is more specific (e.g. "rhel.9")
      volLabel.startsWith(`${preference}.`) ||
      volLabel.startsWith(`${preference}-`)
    );
  });
};

export const getBootVolumeOS = (bootVolume: BootableVolume): OS_NAME_TYPES => {
  const bootVolumePreference = getBootVolumePreferenceIdentifier(bootVolume);
  return (
    Object.values(OS_NAME_TYPES).find((osName) => bootVolumePreference?.includes(osName)) ??
    OS_NAME_TYPES.Other
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

export const getOsNameFromPreference = (preferenceName?: string): string | undefined => {
  if (!preferenceName) {
    return undefined;
  }

  const base = preferenceName.split('.')[0].split('-')[0];
  const isRhelPreference = base === OS_NAME_TYPES.Rhel;
  const isWindowsPreference = base === OS_NAME_TYPES.Windows;
  const isRhelOrWindowsPreference = isRhelPreference || isWindowsPreference;

  return isRhelOrWindowsPreference ? base : LINUX;
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

// For non-admin users with no explicit selection, always scope to the OS images
// namespace — they cannot do cluster-wide watches. Respect any explicit selection.
export const getEffectiveVolumeNamespace = (
  volumeListNamespace: string,
  isAdmin: boolean,
): string => {
  const isNamespaceUnset = !volumeListNamespace || volumeListNamespace === ALL_PROJECTS;

  return !isAdmin && isNamespaceUnset ? OS_IMAGES_NS : volumeListNamespace;
};

export const getCreateBootSourcesPermissionDeniedMessage = (t: TFunction): string =>
  t("You don't have permission to create boot sources");
