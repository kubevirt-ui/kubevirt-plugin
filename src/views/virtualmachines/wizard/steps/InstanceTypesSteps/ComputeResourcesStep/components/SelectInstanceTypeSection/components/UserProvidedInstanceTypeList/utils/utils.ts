import { type V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { INSTANCETYPE_DESCRIPTION_ANNOTATION } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { isRedHatInstanceType } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import { VirtualMachineInstancetypeModelRef } from '@kubevirt-utils/models';
import { getAnnotation, getDescription } from '@kubevirt-utils/resources/shared';
import { universalComparator } from '@kubevirt-utils/utils/sortingUtils';

import { type InstanceTypes } from './types';

export const getUserProvidedInstanceTypes = (instanceTypes: InstanceTypes): InstanceTypes =>
  instanceTypes.filter((instanceType) => !isRedHatInstanceType(instanceType));

export const getCreateComputeResourceURL = (namespace: string): string =>
  `/k8s/ns/${namespace}/${VirtualMachineInstancetypeModelRef}/~new`;

export const getInstanceTypeDescriptionValue = (
  instanceType: V1beta1VirtualMachineClusterInstancetype,
): string =>
  getAnnotation(instanceType, INSTANCETYPE_DESCRIPTION_ANNOTATION) ??
  getDescription(instanceType) ??
  '';

export const compareInstanceTypeDescription = (
  first: V1beta1VirtualMachineClusterInstancetype,
  second: V1beta1VirtualMachineClusterInstancetype,
): number =>
  universalComparator(
    getInstanceTypeDescriptionValue(first),
    getInstanceTypeDescriptionValue(second),
  );
