import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { provisionerAccessModeMapping } from './provisionerAccessModeMapping';

export const initialAccessModes: V1beta1StorageSpecAccessModesEnum[] = [
  V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
  V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
  V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
];
export const initialVolumeModes: V1beta1StorageSpecVolumeModeEnum[] = [
  V1beta1StorageSpecVolumeModeEnum.Filesystem,
  V1beta1StorageSpecVolumeModeEnum.Block,
];

export const getAccessModeForProvisioner = (
  provisioner: string,
  volumeMode: V1beta1StorageSpecVolumeModeEnum,
): undefined | V1beta1StorageSpecAccessModesEnum[] => {
  const modeMap = provisionerAccessModeMapping[provisioner] ?? {};

  const volumeModes = Object.keys(modeMap) as V1beta1StorageSpecAccessModesEnum[];
  if (volumeModes?.length > 0) {
    return volumeMode ? modeMap[volumeMode] : volumeModes.map((mode) => modeMap[mode]).flat();
  }

  return initialAccessModes;
};

export const getVolumeModeForProvisioner = (
  provisioner: string,
  accessMode: V1beta1StorageSpecAccessModesEnum,
): V1beta1StorageSpecVolumeModeEnum[] => {
  const modeMap = provisionerAccessModeMapping[provisioner] ?? {};

  const volumeModes = Object.keys(modeMap) as V1beta1StorageSpecVolumeModeEnum[];
  if (volumeModes?.length > 0) {
    return accessMode
      ? volumeModes.filter((vMode) => modeMap[vMode].includes(accessMode))
      : volumeModes;
  }

  return initialVolumeModes;
};
