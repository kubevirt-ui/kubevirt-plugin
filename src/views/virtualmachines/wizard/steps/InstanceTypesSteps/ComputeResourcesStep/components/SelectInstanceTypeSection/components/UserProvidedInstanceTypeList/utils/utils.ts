/* eslint-disable */
import { isRedHatInstanceType } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';

import { VirtualMachineInstancetypeModelRef } from '@kubevirt-utils/models';
import { InstanceTypes } from './types';

export const getUserProvidedInstanceTypes = (instanceTypes: InstanceTypes): InstanceTypes =>
  instanceTypes.filter((it) => !isRedHatInstanceType(it));

export const getCreateComputeResourceURL = (namespace: string): string =>
  `/k8s/ns/${namespace}/${VirtualMachineInstancetypeModelRef}/~new`;
