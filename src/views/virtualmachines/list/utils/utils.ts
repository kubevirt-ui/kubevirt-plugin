import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';
import { TFunction } from 'i18next';

export const filterVMsByClusterAndNamespace = (
  vms: V1VirtualMachine[],
  namespace: string,
  cluster?: string,
) =>
  (vms ?? []).filter((vm) => {
    if (!vm) return false;
    const vmNamespace = getNamespace(vm);
    const vmCluster = getCluster(vm);

    if (cluster && cluster !== vmCluster) return false;

    if (namespace && namespace !== vmNamespace) return false;

    return true;
  });

export const getClustersWithVMsCount = (vms: V1VirtualMachine[]): number =>
  new Set(vms.map((vm) => getCluster(vm)).filter(Boolean)).size;

export const getNamespacesWithVMsCount = (
  vms: V1VirtualMachine[],
  isAllClustersPage: boolean,
): number => {
  if (isAllClustersPage) {
    return new Set(vms.map((vm) => `${getCluster(vm)}/${getNamespace(vm)}`)).size;
  }

  return new Set(vms.map((vm) => getNamespace(vm))).size;
};

export const getDisabledCreateVMTooltip = (t: TFunction, isInAllNamespaces: boolean) => {
  if (isInAllNamespaces) {
    return t(
      'To create a VM, select a project where you have create permissions, or create a new project',
    );
  }
  return t(
    'You don’t have permission to create a VM in this project. Switch to another project or create a new one',
  );
};

export const getCanCreateVMFleetAccessReview = (
  namespace: string,
  cluster?: string,
): FleetAccessReviewResourceAttributes => ({
  cluster,
  group: VirtualMachineModel.apiGroup,
  namespace,
  resource: VirtualMachineModel.plural,
  verb: 'create',
});
