import {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getClusterOnlyArchitecture } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import { ARCHITECTURES } from '@kubevirt-utils/constants/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { LINUX, OS_NAME_TYPES, RHEL, WINDOWS } from '@kubevirt-utils/resources/template';
import { VM_OS_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { OperatingSystemType } from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

type PreferenceEntry = { kind: string; name: string };

// Handles Windows naming: "2k22" → 2022, "2k25" → 2025
const parseVersion = (segment: string): number => {
  const match = segment?.match(/^2k(\d+)$/i);
  return match ? 2000 + Number(match[1]) : Number(segment) || 0;
};

export const sortByVersionDescending = (a: PreferenceEntry, b: PreferenceEntry): number => {
  const [, versionA, variantA] = a.name?.split('.') ?? [];
  const [, versionB, variantB] = b.name?.split('.') ?? [];

  const versionDiff = parseVersion(versionB) - parseVersion(versionA);
  if (versionDiff !== 0) return versionDiff;

  if (!variantA && !variantB) return 0;
  if (!variantA) return -1;
  if (!variantB) return 1;
  return variantA.localeCompare(variantB);
};

const findArchPreference = (
  entries: PreferenceEntry[],
  architectures?: string[],
): PreferenceEntry | undefined => {
  const onlyArch = getClusterOnlyArchitecture(architectures);
  if (!onlyArch || onlyArch === ARCHITECTURES.AMD64) return undefined;

  return entries.find((entry) => entry.name.split('.')[2] === onlyArch);
};

export const getDefaultPreference = (
  preferences: PreferenceEntry[],
  osType: OperatingSystemType,
  architectures?: string[],
): PreferenceEntry | undefined => {
  if (isEmpty(preferences)) return undefined;

  if (osType === OperatingSystemType.OTHER_LINUX) {
    const fedoraPreferences = preferences
      .filter((entry) => entry.name.toLowerCase().includes(OS_NAME_TYPES.fedora))
      .sort(sortByVersionDescending);

    return (
      findArchPreference(fedoraPreferences, architectures) ?? fedoraPreferences[0] ?? preferences[0]
    );
  }

  return findArchPreference(preferences, architectures) ?? preferences[0];
};

export const getPreferenceNamesFilteredByOSType = (
  preferences: (V1beta1VirtualMachineClusterPreference | V1beta1VirtualMachinePreference)[],
  osType: OperatingSystemType,
): PreferenceEntry[] => {
  const filteredPreferences = preferences.filter((pref) => {
    const os = pref?.spec?.annotations?.[VM_OS_ANNOTATION];
    const name = getName(pref)?.toLowerCase() || '';

    switch (osType) {
      case OperatingSystemType.RHEL:
        return os === LINUX && name.includes(RHEL);
      case OperatingSystemType.WINDOWS:
        return os === WINDOWS;
      case OperatingSystemType.OTHER_LINUX:
        return os === LINUX && !name.includes(RHEL);
      default:
        return true;
    }
  });

  const entries: PreferenceEntry[] = filteredPreferences
    .map((pref) => ({ kind: pref.kind, name: getName(pref) }))
    .filter((entry) => Boolean(entry.name));

  if (osType === OperatingSystemType.OTHER_LINUX) {
    return entries.sort((a, b) => a.name.localeCompare(b.name));
  }

  return entries.sort(sortByVersionDescending);
};
