import { isRedHatInstanceType } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import { VirtualMachineInstancetypeModelRef } from '@kubevirt-utils/models';

import { type InstanceTypes } from './types';

export const getUserProvidedInstanceTypes = (instanceTypes: InstanceTypes): InstanceTypes =>
  instanceTypes.filter((instanceType) => !isRedHatInstanceType(instanceType));

export const getCreateComputeResourceURL = (namespace: string): string =>
  `/k8s/ns/${namespace}/${VirtualMachineInstancetypeModelRef}/~new`;
