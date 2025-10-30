import { VirtualMachineModelRef } from '@kubevirt-utils/models';
import { PROJECT_LIST_FILTER_PARAM } from '@kubevirt-utils/utils/constants';

export const getSingleClusterVMListURL = (namespace?: string) => {
  const baseVMListURL = `/k8s/all-namespaces/${VirtualMachineModelRef}`;
  return `${baseVMListURL}${namespace ? `?${PROJECT_LIST_FILTER_PARAM}=${namespace}` : ''}`;
};

export const getSingleClusterVMURL = (namespace: string, name: string): string =>
  `/k8s/ns/${namespace}/${VirtualMachineModelRef}/${name}`;
