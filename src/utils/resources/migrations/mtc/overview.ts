import { MigPlanModel } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  K8S_CONDITION_STATUS_TRUE,
  type MigPlan,
  type MigrationStatus,
  MTC_PLAN_VM_PLACEHOLDER,
  type MultiNamespaceVirtualMachineStorageMigrationPlan,
  STATUS_READY,
  STORAGE_MIGRATION_PHASE,
} from '../constants';

import { emptyNamespaceStatus } from './constants';
import {
  migPlanCompletedConditionTime,
  migPlanHasFailedCondition,
  migPlanShowsCompletedInOverview,
} from './migPlanEval';
import {
  getMigPlanPVCName,
  getMigPlanPVCNamespace,
  getMigPlanSpecNamespaces,
  getMigPlanSpecPersistentVolumes,
} from './selectors';

// Normalizes a MigPlan from the API for overview widgets (KubeVirt-shaped spec + status).
export const normalizeMTCPlanForOverview = (
  migPlan: MigPlan,
): MultiNamespaceVirtualMachineStorageMigrationPlan => {
  const nsNames = getMigPlanSpecNamespaces(migPlan);
  const persistentVolumes = getMigPlanSpecPersistentVolumes(migPlan);

  const spec: MultiNamespaceVirtualMachineStorageMigrationPlan['spec'] = {
    namespaces: nsNames.map((nsName) => {
      const nsPvs = persistentVolumes.filter((volume) => getMigPlanPVCNamespace(volume) === nsName);
      return {
        name: nsName,
        virtualMachines: !isEmpty(nsPvs)
          ? [
              {
                name: MTC_PLAN_VM_PLACEHOLDER,
                targetMigrationPVCs: nsPvs.map((volume) => ({
                  destinationPVC: {
                    storageClassName: volume.selection?.storageClass,
                  },
                  volumeName: getMigPlanPVCName(volume) ?? volume.name ?? '',
                })),
              },
            ]
          : [{ name: MTC_PLAN_VM_PLACEHOLDER, targetMigrationPVCs: [] }],
      };
    }),
  };

  let status: MultiNamespaceVirtualMachineStorageMigrationPlan['status'];

  if (migPlanHasFailedCondition(migPlan)) {
    status = {
      namespaces: spec.namespaces.map(() => ({
        ...emptyNamespaceStatus(),
        [STORAGE_MIGRATION_PHASE.FAILED]: [{ name: MTC_PLAN_VM_PLACEHOLDER, sourcePVCs: [] }],
      })),
    };
  } else if (migPlanShowsCompletedInOverview(migPlan)) {
    status = {
      namespaces: spec.namespaces.map((ns) => {
        const vmCount = ns.virtualMachines?.length ?? 0;
        const completed: MigrationStatus[] = (ns.virtualMachines ?? []).map((vm) => ({
          name: vm.name,
          sourcePVCs: (vm.targetMigrationPVCs ?? []).map((t) => ({ name: t.volumeName })),
        }));
        return {
          ...emptyNamespaceStatus(),
          completedOutOf: vmCount,
          conditions: [
            {
              lastTransitionTime: migPlanCompletedConditionTime(migPlan),
              status: K8S_CONDITION_STATUS_TRUE,
              type: STATUS_READY,
            },
          ],
          [STORAGE_MIGRATION_PHASE.COMPLETED]: completed,
        };
      }),
    };
  } else if (!isEmpty(nsNames)) {
    status = {
      namespaces: spec.namespaces.map(() => ({
        ...emptyNamespaceStatus(),
        [STORAGE_MIGRATION_PHASE.IN_PROGRESS]: [{ name: MTC_PLAN_VM_PLACEHOLDER, sourcePVCs: [] }],
      })),
    };
  }

  return {
    ...migPlan,
    apiVersion: `${MigPlanModel.apiGroup}/${MigPlanModel.apiVersion}`,
    kind: MigPlanModel.kind,
    spec,
    status,
  };
};
