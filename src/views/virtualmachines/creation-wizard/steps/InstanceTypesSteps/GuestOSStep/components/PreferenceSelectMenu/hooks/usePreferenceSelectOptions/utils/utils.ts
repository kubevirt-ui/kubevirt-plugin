import {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { LINUX, RHEL, WINDOWS } from '@kubevirt-utils/resources/template';
import { VM_OS_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { OperatingSystemType } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

export const getPreferenceNamesFilteredByOSType = (
  preferences: (V1beta1VirtualMachineClusterPreference | V1beta1VirtualMachinePreference)[],
  osType: OperatingSystemType,
): string[] => {
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

  return filteredPreferences.map(getName).sort((a, b) => a.localeCompare(b));
};
