import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { MigPlan } from '@kubevirt-utils/resources/migrations/constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVMPVCNames } from '@kubevirt-utils/resources/vm/utils/source';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { getCluster } from '@multicluster/helpers/selectors';
import { printableVMStatus } from '@virtualmachines/utils';
import { getVMIMFromMapper, VMIMMapper } from '@virtualmachines/utils/mappers';

export const sortMigPlansByCreationTimestamp = (a: MigPlan, b: MigPlan): number =>
  (a?.metadata?.creationTimestamp ?? '')?.localeCompare(b?.metadata?.creationTimestamp ?? '');

export const isVMMigPlan = (migPlan: MigPlan, vmPVCNames: string[]): boolean =>
  migPlan?.spec?.persistentVolumes?.some(
    (pv) =>
      pv?.selection?.action === 'copy' && vmPVCNames?.includes(pv?.pvc?.name?.split(':')?.[0]),
  );

export const getVMMigPlans = (vm: V1VirtualMachine, migPlans: MigPlan[]): MigPlan[] => {
  const vmPVCNames = getVMPVCNames(vm);

  return migPlans?.filter((migPlan) => isVMMigPlan(migPlan, vmPVCNames));
};

export const someVMIsMigrating = (vms: V1VirtualMachine[], vmimMapper: VMIMMapper) =>
  vms?.some((vm) => {
    if (vm?.status?.printableStatus === printableVMStatus.Migrating) {
      return true;
    }

    const vmim = getVMIMFromMapper(vmimMapper, getName(vm), getNamespace(vm), getCluster(vm));
    return vmim && ![vmimStatuses.Failed, vmimStatuses.Succeeded].includes(vmim?.status?.phase);
  });
