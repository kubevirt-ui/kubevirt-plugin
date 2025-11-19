import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { getName } from '@kubevirt-utils/resources/shared';

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
