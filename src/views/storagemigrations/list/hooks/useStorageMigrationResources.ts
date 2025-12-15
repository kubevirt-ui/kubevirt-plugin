import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import {
  modelToGroupVersionKind,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type UseStorageMigrationResources = () => {
  loaded: boolean;
  loadError: any;
  storageMigPlans: MultiNamespaceVirtualMachineStorageMigrationPlan[];
};

const useStorageMigrationResources: UseStorageMigrationResources = () => {
  const namespace = useNamespaceParam();
  const [storageMigPlans, plansLoaded, plansError] = useK8sWatchData<
    MultiNamespaceVirtualMachineStorageMigrationPlan[]
  >({
    groupVersionKind: modelToGroupVersionKind(
      MultiNamespaceVirtualMachineStorageMigrationPlanModel,
    ),
    isList: true,
    namespace,
    namespaced: true,
  });

  return {
    loaded: plansLoaded,
    loadError: plansError,
    storageMigPlans,
  };
};

export default useStorageMigrationResources;
