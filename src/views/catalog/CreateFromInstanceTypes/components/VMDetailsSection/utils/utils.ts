import {
  DEFAULT_PREFERENCE_LABEL,
  PREFERENCE_DISPLAY_NAME_KEY,
} from '@catalog/CreateFromInstanceTypes/utils/constants';
import {
  V1beta1VirtualMachineClusterInstancetype,
  V1beta1VirtualMachineClusterPreference,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getAnnotation, getLabel } from '@kubevirt-utils/resources/shared';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';

export const getOSFromDefaultPreference = (
  bootableVolume: BootableVolume,
  preferencesMap: {
    [resourceKeyName: string]: V1beta1VirtualMachineClusterPreference;
  },
): string => {
  const defaultPreferenceName = getLabel(bootableVolume, DEFAULT_PREFERENCE_LABEL);

  const defaultPreference = preferencesMap?.[defaultPreferenceName];

  const defaultPreferenceDisplayName = getAnnotation(
    defaultPreference,
    PREFERENCE_DISPLAY_NAME_KEY,
    '',
  );
  return defaultPreferenceDisplayName;
};

export const getCPUAndMemoryFromDefaultInstanceType = (
  instanceType: V1beta1VirtualMachineClusterInstancetype,
): string => {
  const cpu = instanceType?.spec?.cpu?.guest;

  const memory = readableSizeUnit(instanceType?.spec?.memory?.guest);

  return t('{{cpu}} CPU | {{memory}} Memory', { cpu, memory });
};
