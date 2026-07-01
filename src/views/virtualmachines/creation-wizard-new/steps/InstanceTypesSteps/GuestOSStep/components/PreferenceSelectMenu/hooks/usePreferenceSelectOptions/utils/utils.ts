import {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { getClusterOnlyArchitecture } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import { ARCHITECTURES } from '@kubevirt-utils/constants/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { LINUX, OS_NAME_TYPES, RHEL, WINDOWS } from '@kubevirt-utils/resources/template';
import { VM_OS_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { OperatingSystemType } from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

type PreferenceFilterByOsType = {
  name: string;
  os: string | undefined;
};

const isRHELPreference = ({ name, os }: PreferenceFilterByOsType): boolean =>
  os === LINUX && name.includes(RHEL);

const isWindowsPreference = ({ os }: PreferenceFilterByOsType): boolean => os === WINDOWS;

const isOtherLinuxPreference = ({ name, os }: PreferenceFilterByOsType): boolean =>
  os === LINUX && !name.includes(RHEL);

const operatingSystemPreferenceFilters: Record<
  OperatingSystemType,
  (context: PreferenceFilterByOsType) => boolean
> = {
  [OperatingSystemType.OTHER_LINUX]: isOtherLinuxPreference,
  [OperatingSystemType.RHEL]: isRHELPreference,
  [OperatingSystemType.WINDOWS]: isWindowsPreference,
};

export const getOperatingSystemTileTypes = (isWindowsSupported: boolean): OperatingSystemType[] => [
  OperatingSystemType.RHEL,
  ...(isWindowsSupported ? [OperatingSystemType.WINDOWS] : []),
  OperatingSystemType.OTHER_LINUX,
];

// Handles Windows naming: "2k22" → 2022, "2k25" → 2025
const parseWindowsVersionToNumbersOnly = (segment: string): number => {
  const match = segment?.match(/^2k(\d+)$/i);
  return match ? 2000 + Number(match[1]) : Number(segment) || 0;
};

export const sortByVersionDescending = (a: PreferenceOption, b: PreferenceOption): number => {
  const [, versionA, versionSuffixA] = a.name?.split('.') ?? [];
  const [, versionB, versionSuffixB] = b.name?.split('.') ?? [];

  const versionDiff =
    parseWindowsVersionToNumbersOnly(versionB) - parseWindowsVersionToNumbersOnly(versionA);
  if (versionDiff !== 0) return versionDiff;

  if (!versionSuffixA && !versionSuffixB) return 0;
  if (!versionSuffixA) return -1;
  if (!versionSuffixB) return 1;
  return versionSuffixA.localeCompare(versionSuffixB);
};

const getPreferenceForSingleWorkloadArchitecture = (
  preferences: PreferenceOption[],
  architectures?: string[],
): PreferenceOption | undefined => {
  const singleWorkloadArchitecture = getClusterOnlyArchitecture(architectures);
  if (!singleWorkloadArchitecture || singleWorkloadArchitecture === ARCHITECTURES.AMD64)
    return undefined;

  return preferences.find((preference) => {
    const [, , architecture] = preference.name.split('.');
    return architecture === singleWorkloadArchitecture;
  });
};

const getOtherLinuxDefaultPreference = (
  otherLinuxPreferences: PreferenceOption[],
  architectures?: string[],
) => {
  const fedoraPreferences = otherLinuxPreferences
    .filter((entry) => entry.name.toLowerCase().includes(OS_NAME_TYPES.fedora))
    .sort(sortByVersionDescending);

  const fedoraPreferenceForSingleWorkloadArchitecture = getPreferenceForSingleWorkloadArchitecture(
    fedoraPreferences,
    architectures,
  );

  const firstFedoraPreference = fedoraPreferences?.[0];

  return (
    fedoraPreferenceForSingleWorkloadArchitecture ??
    firstFedoraPreference ??
    otherLinuxPreferences[0]
  );
};

export const getDefaultPreference = (
  preferences: PreferenceOption[],
  osType: OperatingSystemType,
  architectures?: string[],
): PreferenceOption | undefined => {
  if (isEmpty(preferences)) return undefined;

  if (osType === OperatingSystemType.OTHER_LINUX) {
    return getOtherLinuxDefaultPreference(preferences, architectures);
  }

  return getPreferenceForSingleWorkloadArchitecture(preferences, architectures) ?? preferences[0];
};

const getFilteredPreferencesByOsType = (
  preferences: (V1beta1VirtualMachineClusterPreference | V1beta1VirtualMachinePreference)[],
  osType: OperatingSystemType,
) =>
  preferences.reduce<PreferenceOption[]>((filteredPreferences, preference) => {
    const os = preference?.spec?.annotations?.[VM_OS_ANNOTATION];
    const preferenceName = getName(preference);
    const name = preferenceName?.toLowerCase() ?? '';

    if (isEmpty(preferenceName) || !operatingSystemPreferenceFilters[osType]({ name, os })) {
      return filteredPreferences;
    }

    filteredPreferences.push({ kind: preference.kind, name: preferenceName });

    return filteredPreferences;
  }, []);

export const getSortedPreferencesByOSType = (
  preferences: (V1beta1VirtualMachineClusterPreference | V1beta1VirtualMachinePreference)[],
  osType: OperatingSystemType,
): PreferenceOption[] => {
  const preferencesKindAndNameByOsType = getFilteredPreferencesByOsType(preferences, osType);

  if (osType === OperatingSystemType.OTHER_LINUX) {
    return preferencesKindAndNameByOsType.sort((firstEntry, secondEntry) =>
      firstEntry.name.localeCompare(secondEntry.name),
    );
  }

  return preferencesKindAndNameByOsType.sort(sortByVersionDescending);
};
