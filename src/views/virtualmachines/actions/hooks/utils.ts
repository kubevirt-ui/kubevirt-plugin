import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { MigPlan } from '@kubevirt-utils/resources/migrations/constants';
import { getVMPVCNames } from '@kubevirt-utils/resources/vm/utils/source';

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
