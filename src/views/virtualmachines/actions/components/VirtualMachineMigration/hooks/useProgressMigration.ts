import {
  modelToGroupVersionKind,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { isMigrationCompleted } from '@kubevirt-utils/resources/migrations/utils';
import { getName, getNamespace, getStatusConditionsByType } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type UseProgressMigration = (
  storageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
) => {
  completedMigrationTimestamp: string;
  creationTimestamp: string;
  error: any;
  status: string;
  watchStorageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan;
};

const useProgressMigration: UseProgressMigration = (storageMigrationPlan) => {
  const [watchStorageMigrationPlan, _, storageMigrationPlanError] =
    useK8sWatchData<MultiNamespaceVirtualMachineStorageMigrationPlan>(
      storageMigrationPlan
        ? {
            cluster: getCluster(storageMigrationPlan),
            groupVersionKind: modelToGroupVersionKind(
              MultiNamespaceVirtualMachineStorageMigrationPlanModel,
            ),
            name: getName(storageMigrationPlan),
            namespace: getNamespace(storageMigrationPlan),
          }
        : null,
    );

  const migrationCompleted = isMigrationCompleted(watchStorageMigrationPlan);

  return {
    completedMigrationTimestamp: migrationCompleted
      ? getStatusConditionsByType(watchStorageMigrationPlan, 'Completed')?.lastTransitionTime
      : null,
    creationTimestamp: storageMigrationPlan?.metadata?.creationTimestamp,
    error: storageMigrationPlanError,
    status: migrationCompleted ? 'Completed' : 'InProgress',
    watchStorageMigrationPlan,
  };
};
export default useProgressMigration;
