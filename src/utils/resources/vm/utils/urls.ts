import { VirtualMachineModelRef } from '@kubevirt-utils/models';

export const getSingleClusterVMListURL = (namespace?: string) => {
  const baseVMListURL = `/k8s/all-namespaces/${VirtualMachineModelRef}`;
  return `${baseVMListURL}${namespace ? `?rowFilter-project=${namespace}` : ''}`;
};
