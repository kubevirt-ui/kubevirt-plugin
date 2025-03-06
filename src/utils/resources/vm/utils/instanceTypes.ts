import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export const isInstanceTypeVM = (vm: V1VirtualMachine): boolean =>
  !isEmpty(vm?.spec?.instancetype) || !isEmpty(vm?.spec?.preference);

const NAMESPACED_INSTANCE_TYPE_NAME_ANNOTATION = 'kubevirt.io/instancetype-name';
const CLUSTER_INSTANCE_TYPE_NAME_ANNOTATION = 'kubevirt.io/cluster-instancetype-name';
const NAMESPACED_PREFERENCE_NAME_ANNOTATION = 'kubevirt.io/preference-name';
const CLUSTER_PREFERENCE_NAME_ANNOTATION = 'kubevirt.io/cluster-preference-name';

export const getInstanceTypeNameFromAnnotation = (vmi: V1VirtualMachineInstance) =>
  getAnnotation(vmi, NAMESPACED_INSTANCE_TYPE_NAME_ANNOTATION) ??
  getAnnotation(vmi, CLUSTER_INSTANCE_TYPE_NAME_ANNOTATION);

export const getPreferenceNameFromAnnotation = (vmi: V1VirtualMachineInstance) =>
  getAnnotation(vmi, NAMESPACED_PREFERENCE_NAME_ANNOTATION) ??
  getAnnotation(vmi, CLUSTER_PREFERENCE_NAME_ANNOTATION);
