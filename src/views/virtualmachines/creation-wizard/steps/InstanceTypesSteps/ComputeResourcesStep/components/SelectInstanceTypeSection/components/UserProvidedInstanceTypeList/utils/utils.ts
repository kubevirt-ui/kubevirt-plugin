import { isRedHatInstanceType } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';

import { InstanceTypes } from './types';

export const getUserProvidedInstanceTypes = (instanceTypes: InstanceTypes): InstanceTypes =>
  instanceTypes.filter((it) => !isRedHatInstanceType(it));
