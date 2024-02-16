import { InstanceTypes } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { isRedHatInstanceType } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';

export const getUserProvidedInstanceTypes = (instanceTypes: InstanceTypes): InstanceTypes =>
  instanceTypes.filter((it) => !isRedHatInstanceType(it));
