import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getCluster } from '@multicluster/helpers/selectors';

export const getVMsPerCluster = (vms: V1VirtualMachine[]): Record<string, V1VirtualMachine[]> => {
  return vms?.reduce((acc, vm) => {
    const cluster = getCluster(vm);

    if (!acc[cluster]) {
      acc[cluster] = [];
    }
    acc[cluster].push(vm);
    return acc;
  }, {});
};
