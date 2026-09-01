import {
  type V1beta1VirtualMachineClusterPreference,
  type V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  DEFAULT_PREFERENCE_LABEL,
  PREFERENCE_DISPLAY_NAME_KEY,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { type PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { getPreference } from '@kubevirt-utils/resources/bootableresources/helpers';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import {
  getAnnotation,
  getLabel,
  getName,
  type NamespacedResourceMap,
  type ResourceMap,
} from '@kubevirt-utils/resources/shared';
import { LINUX, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { OS_IMAGES_NS } from '@kubevirt-utils/utils/utils';

export const isLinuxGenericPreference = (preference: string): boolean =>
  preference === 'linux' || preference.startsWith('linux.') || preference.startsWith('linux-');

// Maps a common OS-image resource name (DataSource name, e.g. "win2k22", "rhel9",
// "centos-stream9") to the equivalent VirtualMachine(Cluster)Preference name
// (e.g. "windows.2k22", "rhel.9", "centos.stream9"), per the common-instancetypes
// naming convention. Returns undefined for names that don't match a known pattern.
export const getPreferenceIdentifierFromResourceName = (name?: string): string | undefined => {
  const lowerName = name?.toLowerCase();
  if (!lowerName) return undefined;

  if (lowerName.startsWith('win') && lowerName.length > 3) return `windows.${lowerName.slice(3)}`;
  if (lowerName.startsWith('centos-stream'))
    return `centos.stream${lowerName.slice('centos-stream'.length)}`;

  const rhelMatch = /^rhel(\d.*)$/.exec(lowerName);
  if (rhelMatch) return `rhel.${rhelMatch[1]}`;

  return lowerName.startsWith('fedora') ? lowerName : undefined;
};

// A DataSource's own default-preference label is the primary signal, but several built-in
// DataSources (e.g. all Windows images, rhel7) carry no such label on real clusters, so we fall
// back to an identifier derived from the volume's own resource name.
const getBootVolumePreferenceIdentifier = (bootVolume: BootableVolume): string | undefined =>
  getLabel(bootVolume, DEFAULT_PREFERENCE_LABEL) ??
  getPreferenceIdentifierFromResourceName(getName(bootVolume));

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

export const getOsNameFromPreference = (preferenceName?: string): string | undefined => {
  if (!preferenceName) {
    return undefined;
  }

  const base = preferenceName.split('.')[0].split('-')[0];
  const isRhelPreference = base === OS_NAME_TYPES.rhel;
  const isWindowsPreference = base === OS_NAME_TYPES.windows;
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
