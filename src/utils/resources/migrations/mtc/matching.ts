import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { MigPlanModel } from '@kubevirt-utils/models';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { MigPlan, MultiNamespaceVirtualMachineStorageMigrationPlan } from '../constants';

import {
  getMigPlanPVCName,
  getMigPlanPVCNamespace,
  getMigPlanSpecPersistentVolumes,
} from './selectors';

export const isMTCStorageMigrationPlan = (
  plan: MultiNamespaceVirtualMachineStorageMigrationPlan,
): boolean => plan?.kind === MigPlanModel.kind;

export const MTC_WIZARD_PROGRESS_PHASE_TYPE = 'MigMigrationProgress';

/**
 * True when the MigPlan lists at least one PVC that belongs to this VM (namespace + claim/DV name).
 * @param migPlan MTC MigPlan whose persistent volume entries are checked against the VM's volumes.
 * @param vm VM whose PVC/DataVolume claim names are matched in the VM namespace.
 */
export const doesMTCPlanTargetVM = (migPlan: MigPlan, vm: V1VirtualMachine): boolean => {
  const vmNs = getNamespace(vm);
  const pvs = getMigPlanSpecPersistentVolumes(migPlan);
  if (isEmpty(pvs)) return false;

  const volumes = getVolumes(vm) ?? [];
  const claimNames = new Set(
    volumes.flatMap((vol) => {
      const names: string[] = [];
      if (vol.persistentVolumeClaim?.claimName) names.push(vol.persistentVolumeClaim.claimName);
      if (vol.dataVolume?.name) names.push(vol.dataVolume.name);
      return names;
    }),
  );

  return pvs.some((pv) => {
    const pvcNs = getMigPlanPVCNamespace(pv) ?? vmNs;
    if (pvcNs !== vmNs) return false;
    const pvcName = getMigPlanPVCName(pv) ?? pv.name;
    return Boolean(pvcName && claimNames.has(pvcName));
  });
};
