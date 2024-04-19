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
  const types: string[] = bootableVolumes.reduce((acc, bv) => {
    const operatingSystem = getBootVolumeOS(bv);
    acc.push(operatingSystem);
    return acc;
  }, []);

  return {
    hasRHEL: types.includes(OS_NAME_TYPES.rhel),
    hasWindows: types.includes(OS_NAME_TYPES.windows),
    isEmpty: isEmpty(types),
  };
};

export default useBootableVolumeOSes;
