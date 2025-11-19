import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  modelToGroupVersionKind,
  VirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import { VirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { getVMMigPlans, sortMigPlansByCreationTimestamp } from './utils';

const useCurrentStorageMigration = (
  vm: V1VirtualMachine,
): [undefined | VirtualMachineStorageMigrationPlan, boolean] => {
  const cluster = getCluster(vm);
  const namespace = getNamespace(vm);

  const [migPlans, migPlansLoaded] = useK8sWatchData<VirtualMachineStorageMigrationPlan[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(VirtualMachineStorageMigrationPlanModel),
    isList: true,
    namespace,
  });

  const vmMigPlans = getVMMigPlans(vm, migPlans)?.sort(sortMigPlansByCreationTimestamp);

  const latestVMMigPlan = vmMigPlans?.[vmMigPlans?.length - 1];

  return [latestVMMigPlan, migPlansLoaded];
};

export default useCurrentStorageMigration;
