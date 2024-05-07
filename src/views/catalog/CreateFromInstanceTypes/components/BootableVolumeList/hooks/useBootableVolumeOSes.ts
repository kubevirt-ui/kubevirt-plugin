import { getBootVolumeOS } from '@catalog/CreateFromInstanceTypes/components/BootableVolumeList/utils/utils';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { isEmpty } from '@kubevirt-utils/utils/utils';

type UseBootableVolumeOSes = (bootableVolumes: BootableVolume[]) => {
  hasRHEL: boolean;
  hasWindows: boolean;
  isEmpty: boolean;
};

const useBootableVolumeOSes: UseBootableVolumeOSes = (bootableVolumes) => {
  const types: Set<OS_NAME_TYPES> = bootableVolumes.reduce((acc, bv) => {
    const operatingSystem = getBootVolumeOS(bv);
    acc.add(operatingSystem);
    return acc;
  }, new Set<OS_NAME_TYPES>());

  return {
    hasRHEL: types.has(OS_NAME_TYPES.rhel),
    hasWindows: types.has(OS_NAME_TYPES.windows),
    isEmpty: isEmpty(types),
  };
};

export default useBootableVolumeOSes;
