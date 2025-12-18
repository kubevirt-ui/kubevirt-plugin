import { PREFERENCE_DISPLAY_NAME_KEY } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  V1beta1VirtualMachineClusterInstancetype,
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { DYNAMIC_CREDENTIALS_SUPPORT } from '@kubevirt-utils/components/DynamicSSHKeyInjection/constants/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getPreference } from '@kubevirt-utils/resources/bootableresources/helpers';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import {
  getAnnotation,
  getLabel,
  NamespacedResourceMap,
  ResourceMap,
} from '@kubevirt-utils/resources/shared';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';

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

export const getCPUAndMemoryFromDefaultInstanceType = (
  instanceType: V1beta1VirtualMachineClusterInstancetype,
): string => {
  const cpu = instanceType?.spec?.cpu?.guest;

  const memory = readableSizeUnit(instanceType?.spec?.memory?.guest);

  return t('{{cpu}} CPU | {{memory}} Memory', { cpu, memory });
};

export const dataSourceHasDynamicSSHLabel = (
  pvcSource: IoK8sApiCoreV1PersistentVolumeClaim,
  selectedBootableVolume: BootableVolume,
) =>
  getLabel(pvcSource, DYNAMIC_CREDENTIALS_SUPPORT) ||
  getLabel(selectedBootableVolume, DYNAMIC_CREDENTIALS_SUPPORT);
