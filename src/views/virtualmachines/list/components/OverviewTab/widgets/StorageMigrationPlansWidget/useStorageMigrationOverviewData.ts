import {
  modelToGroupVersionKind,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type UseStorageMigrationOverviewData = (cluster?: string) => {
  loaded: boolean;
  loadError: unknown;
  storageMigPlans: MultiNamespaceVirtualMachineStorageMigrationPlan[];
};

const useStorageMigrationOverviewData: UseStorageMigrationOverviewData = (cluster) => {
  const [storageMigPlans, loaded, loadError] = useK8sWatchData<
    MultiNamespaceVirtualMachineStorageMigrationPlan[]
  >({
    cluster,
    groupVersionKind: modelToGroupVersionKind(
      MultiNamespaceVirtualMachineStorageMigrationPlanModel,
    ),
    isList: true,
    namespaced: false,
  });

  return {
    loaded,
    loadError,
    storageMigPlans,
  };
};

export default useStorageMigrationOverviewData;
