import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { getStorageMigrationBackend } from '@kubevirt-utils/resources/migrations/backends';
import {
  MigPlan,
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  STORAGE_MIGRATION_API,
} from '@kubevirt-utils/resources/migrations/constants';
import { doesMTCPlanTargetVM } from '@kubevirt-utils/resources/migrations/mtc';
import { isMigrationCompleted } from '@kubevirt-utils/resources/migrations/utils';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sListData from '@multicluster/hooks/useK8sListData';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import useClusterStorageMigrationAPI from './storageMigrationApi/useClusterStorageMigrationAPI';
import useCurrentStorageMigration from './useStorageMigrations';

const useActiveVMStorageMigrationPlan = (
  vm: V1VirtualMachine,
  clusterContext?: null | string,
): MultiNamespaceVirtualMachineStorageMigrationPlan | null => {
  const namespace = getNamespace(vm);
  const vmName = getName(vm);
  const cluster = clusterContext ?? getCluster(vm);

  const storageMigAPI = useClusterStorageMigrationAPI(cluster);
  const backend = getStorageMigrationBackend(storageMigAPI);
  const useMultiNsAPI = storageMigAPI === STORAGE_MIGRATION_API.MULTI_NS;

  const [storageMigPlans] = useK8sWatchData<MultiNamespaceVirtualMachineStorageMigrationPlan[]>(
    useMultiNsAPI && vm && backend
      ? {
          cluster,
          groupVersionKind: modelToGroupVersionKind(backend.planModel),
          isList: true,
          namespace,
          namespaced: true,
        }
      : null,
  );

  const [mtcPlans] = useK8sListData<MigPlan>(
    storageMigAPI === STORAGE_MIGRATION_API.MTC && vm && backend
      ? {
          cluster,
          model: backend.planModel,
          namespace: backend.fixedPlanNamespace,
        }
      : null,
  );

  const [singleNsPlan] = useCurrentStorageMigration(
    vm,
    storageMigAPI === STORAGE_MIGRATION_API.SINGLE_NS,
  );

  return useMemo(() => {
    if (!vmName) return null;

    if (storageMigAPI === STORAGE_MIGRATION_API.LOADING) return null;

    if (storageMigAPI === STORAGE_MIGRATION_API.NONE) return null;

    if (storageMigAPI === STORAGE_MIGRATION_API.MTC && backend) {
      const candidates = (mtcPlans ?? [])
        .filter((mp) => {
          if (mp.metadata?.deletionTimestamp) return false;
          if (!(mp.spec?.namespaces ?? []).includes(namespace)) return false;
          return doesMTCPlanTargetVM(mp, vm);
        })
        .sort(
          (a, b) =>
            new Date(b.metadata?.creationTimestamp ?? 0).getTime() -
            new Date(a.metadata?.creationTimestamp ?? 0).getTime(),
        );

      for (const raw of candidates) {
        const normalized = backend.normalizePlanForOverview(raw);
        if (normalized && !isMigrationCompleted(normalized)) {
          return cluster
            ? ({ ...normalized, cluster } as MultiNamespaceVirtualMachineStorageMigrationPlan)
            : normalized;
        }
      }
      return null;
    }

    const activePlan = [...(storageMigPlans ?? [])]
      .sort(
        (a, b) =>
          new Date(b.metadata?.creationTimestamp ?? 0).getTime() -
          new Date(a.metadata?.creationTimestamp ?? 0).getTime(),
      )
      .find((plan) => {
        if (plan?.metadata?.deletionTimestamp) return false;
        if (isMigrationCompleted(plan)) return false;

        return plan?.spec?.namespaces?.some(
          (ns) =>
            ns?.name === namespace &&
            ns?.virtualMachines?.some((vmSpec) => vmSpec?.name === vmName),
        );
      });

    if (activePlan) return activePlan;

    if (storageMigAPI === STORAGE_MIGRATION_API.MULTI_NS) return null;

    if (!singleNsPlan) return null;
    if (singleNsPlan.metadata?.deletionTimestamp) return null;

    const singleNsBackend = getStorageMigrationBackend(STORAGE_MIGRATION_API.SINGLE_NS);
    const normalized = singleNsBackend?.normalizePlanForOverview(singleNsPlan);
    if (!normalized || isMigrationCompleted(normalized)) return null;

    return cluster
      ? ({ ...normalized, cluster } as MultiNamespaceVirtualMachineStorageMigrationPlan)
      : normalized;
  }, [
    backend,
    cluster,
    mtcPlans,
    namespace,
    singleNsPlan,
    storageMigAPI,
    storageMigPlans,
    vm,
    vmName,
  ]);
};

export default useActiveVMStorageMigrationPlan;
