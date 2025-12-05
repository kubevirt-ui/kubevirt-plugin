import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { getCluster } from '@multicluster/helpers/selectors';
import { printableVMStatus } from '@virtualmachines/utils';
import { getVMIMFromMapper, VMIMMapper } from '@virtualmachines/utils/mappers';

export const sortMigPlansByCreationTimestamp = (
  a: VirtualMachineStorageMigrationPlan,
  b: VirtualMachineStorageMigrationPlan,
): number =>
  (a?.metadata?.creationTimestamp ?? '')?.localeCompare(b?.metadata?.creationTimestamp ?? '');

export const isVMMigPlan = (migPlan: VirtualMachineStorageMigrationPlan, vmName: string): boolean =>
  migPlan?.spec?.virtualMachines?.some((vm) => vm?.name === vmName);

export const getVMMigPlans = (
  vm: V1VirtualMachine,
  migPlans: VirtualMachineStorageMigrationPlan[],
): VirtualMachineStorageMigrationPlan[] => {
  return migPlans?.filter((migPlan) => isVMMigPlan(migPlan, getName(vm)));
};

export const someVMIsMigrating = (vms: V1VirtualMachine[], vmimMapper: VMIMMapper) =>
  vms?.some((vm) => {
    if (vm?.status?.printableStatus === printableVMStatus.Migrating) {
      return true;
    }

    const vmim = getVMIMFromMapper(vmimMapper, getName(vm), getNamespace(vm), getCluster(vm));
    return vmim && ![vmimStatuses.Failed, vmimStatuses.Succeeded].includes(vmim?.status?.phase);
  });
