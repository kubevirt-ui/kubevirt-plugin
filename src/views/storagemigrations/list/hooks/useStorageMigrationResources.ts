import { useMemo } from 'react';

import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import {
  MigPlanModel,
  modelToGroupVersionKind,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
  VirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import {
  MigPlan,
  MTC_MIGRATION_NAMESPACE,
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  VirtualMachineStorageMigrationPlan,
} from '@kubevirt-utils/resources/migrations/constants';
import { normalizeMTCPlanForOverview } from '@kubevirt-utils/resources/migrations/mtc';
import { getMigPlanSpecNamespaces } from '@kubevirt-utils/resources/migrations/mtc/selectors';
import { normalizeSingleNsPlan } from '@kubevirt-utils/resources/migrations/singleNs/overview';
import useK8sListData from '@multicluster/hooks/useK8sListData';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import isResourceNotFoundError from '../../../templates/list/hooks/isResourceNotFoundError';

type UseStorageMigrationResources = () => {
  loaded: boolean;
  loadError: unknown;
  storageMigPlans: MultiNamespaceVirtualMachineStorageMigrationPlan[];
};

const mtcPlanMatchesNamespace = (plan: MigPlan, namespace?: string): boolean => {
  if (!namespace) return true;
  return getMigPlanSpecNamespaces(plan).includes(namespace);
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
  const kubevirtApisAbsent = multiNsSettled && singleNsSettled && multiNsIs404 && singleNsIs404;

  const [mtcPlans, mtcLoaded, mtcError] = useK8sListData<MigPlan>(
    kubevirtApisAbsent
      ? {
          cluster: undefined,
          model: MigPlanModel,
          namespace: MTC_MIGRATION_NAMESPACE,
        }
      : null,
  );

  const mtcIs404 = isResourceNotFoundError(mtcError);
  const mtcSettled = kubevirtApisAbsent ? mtcLoaded || !!mtcError : true;

  const storageMigPlans = useMemo(
    () => [
      ...(multiNsPlans ?? []),
      ...(singleNsPlans ?? [])
        .map((plan) => normalizeSingleNsPlan(plan))
        .filter((plan): plan is MultiNamespaceVirtualMachineStorageMigrationPlan => plan != null),
      ...(kubevirtApisAbsent
        ? (mtcPlans ?? [])
            .filter((plan) => mtcPlanMatchesNamespace(plan, namespace))
            .map((plan) => normalizeMTCPlanForOverview(plan))
        : []),
    ],
    [multiNsPlans, singleNsPlans, mtcPlans, namespace, kubevirtApisAbsent],
  );

  const effectiveMultiNsError = multiNsIs404 ? undefined : multiNsError;
  const effectiveSingleNsError = singleNsIs404 ? undefined : singleNsError;
  const effectiveMtcError = mtcIs404 ? undefined : mtcError;

  return {
    loaded: multiNsSettled && singleNsSettled && mtcSettled,
    loadError: effectiveMultiNsError ?? effectiveSingleNsError ?? effectiveMtcError,
    storageMigPlans,
  };
};

export default useStorageMigrationResources;
