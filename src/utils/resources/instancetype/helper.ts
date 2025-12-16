import { VirtualMachineClusterInstancetypeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineInstancetypeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1InstancetypeMatcher,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { getAnnotation } from '../shared';

import {
  CLUSTER_INSTANCE_TYPE_NAME_ANNOTATION,
  CLUSTER_PREFERENCE_NAME_ANNOTATION,
  NAMESPACED_INSTANCE_TYPE_NAME_ANNOTATION,
  NAMESPACED_PREFERENCE_NAME_ANNOTATION,
} from './constants';

export const getInstanceTypeModelFromMatcher = (
  instanceTypeMatcher: V1InstancetypeMatcher,
): K8sModel => {
  if (isEmpty(instanceTypeMatcher?.kind)) return VirtualMachineClusterInstancetypeModel;

  return instanceTypeMatcher.kind.includes('cluster')
    ? VirtualMachineClusterInstancetypeModel
    : VirtualMachineInstancetypeModel;
};

export const isExpandableSpecVM = (vm: V1VirtualMachine | V1VirtualMachineInstance): boolean =>
  isVM(vm)
    ? !isEmpty(vm?.spec?.instancetype) || !isEmpty(vm?.spec?.preference)
    : !!getInstanceTypeNameFromAnnotation(vm) || !!getPreferenceNameFromAnnotation(vm);

export const isInstanceTypeVM = (vm: V1VirtualMachine | V1VirtualMachineInstance): boolean =>
  isVM(vm) ? !isEmpty(vm?.spec?.instancetype) : !!getInstanceTypeNameFromAnnotation(vm);

export const getInstanceTypeNameFromAnnotation = (
  vm: V1VirtualMachine | V1VirtualMachineInstance,
) =>
  getAnnotation(vm, NAMESPACED_INSTANCE_TYPE_NAME_ANNOTATION) ??
  getAnnotation(vm, CLUSTER_INSTANCE_TYPE_NAME_ANNOTATION);

export const getPreferenceNameFromAnnotation = (vm: V1VirtualMachine | V1VirtualMachineInstance) =>
  getAnnotation(vm, NAMESPACED_PREFERENCE_NAME_ANNOTATION) ??
  getAnnotation(vm, CLUSTER_PREFERENCE_NAME_ANNOTATION);
