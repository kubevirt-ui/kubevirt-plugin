import { useMemo } from 'react';

import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import {
  modelToGroupVersionKind,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
  VirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import {
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  VirtualMachineStorageMigrationPlan,
} from '@kubevirt-utils/resources/migrations/constants';
import { normalizeSingleNsPlan } from '@kubevirt-utils/resources/migrations/singleNs/overview';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import isResourceNotFoundError from '@templates/list/hooks/isResourceNotFoundError';

type UseStorageMigrationResources = () => {
  loaded: boolean;
  loadError: unknown;
  storageMigPlans: MultiNamespaceVirtualMachineStorageMigrationPlan[];
};

const useStorageMigrationResources: UseStorageMigrationResources = () => {
  const namespace = useNamespaceParam();
  const [multiNsPlans, multiNsLoaded, multiNsError] = useK8sWatchData<
    MultiNamespaceVirtualMachineStorageMigrationPlan[]
  >({
    groupVersionKind: modelToGroupVersionKind(
      MultiNamespaceVirtualMachineStorageMigrationPlanModel,
    ),
    isList: true,
    namespace,
    namespaced: true,
  });

  const [singleNsPlans, singleNsLoaded, singleNsError] = useK8sWatchData<
    VirtualMachineStorageMigrationPlan[]
  >({
    groupVersionKind: modelToGroupVersionKind(VirtualMachineStorageMigrationPlanModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const multiNsIs404 = isResourceNotFoundError(multiNsError);
  const singleNsIs404 = isResourceNotFoundError(singleNsError);

  const multiNsSettled = multiNsLoaded || !!multiNsError;
  const singleNsSettled = singleNsLoaded || !!singleNsError;

  const storageMigPlans = useMemo(
    () => [
      ...(multiNsPlans ?? []),
      ...(singleNsPlans ?? []).map((plan) => normalizeSingleNsPlan(plan)).filter(Boolean),
    ],
    [multiNsPlans, singleNsPlans],
  );

  const effectiveMultiNsError = multiNsIs404 ? undefined : multiNsError;
  const effectiveSingleNsError = singleNsIs404 ? undefined : singleNsError;

  return {
    loaded: multiNsSettled && singleNsSettled,
    loadError: effectiveMultiNsError ?? effectiveSingleNsError,
    storageMigPlans,
  };
};

export default useStorageMigrationResources;
