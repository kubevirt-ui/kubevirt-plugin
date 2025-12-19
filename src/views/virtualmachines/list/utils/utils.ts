import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';

export const filterVMsByClusterAndNamespace = (
  vms: V1VirtualMachine[],
  namespace: string,
  cluster?: string,
) =>
  vms.filter((vm) => {
    const vmNamespace = getNamespace(vm);
    const vmCluster = getCluster(vm);

    if (cluster && cluster !== vmCluster) return false;

    if (namespace && namespace !== vmNamespace) return false;

    return true;
  });

export const getClustersWithVMsCount = (vms: V1VirtualMachine[]): number =>
  new Set(vms.map((vm) => getCluster(vm))).size;

export const getNamespacesWithVMsCount = (
  vms: V1VirtualMachine[],
  isAllClustersPage: boolean,
): number => {
  if (isAllClustersPage) {
    return new Set(vms.map((vm) => `${getCluster(vm)}/${getNamespace(vm)}`)).size;
  }

  return new Set(vms.map((vm) => getNamespace(vm))).size;
};
