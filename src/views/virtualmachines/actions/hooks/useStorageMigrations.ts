import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VirtualMachineStorageMigrationPlanModel } from '@kubevirt-utils/models';
import { VirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sListData from '@multicluster/hooks/useK8sListData';

import { getVMMigPlans, sortMigPlansByCreationTimestamp } from './utils';

const useCurrentStorageMigration = (
  vm: V1VirtualMachine,
  singleNsListEnabled = true,
): [undefined | VirtualMachineStorageMigrationPlan, boolean] => {
  const cluster = getCluster(vm);
  const namespace = getNamespace(vm);

  const [migPlans, migPlansLoaded] = useK8sListData<VirtualMachineStorageMigrationPlan>(
    vm && singleNsListEnabled
      ? {
          cluster,
          model: VirtualMachineStorageMigrationPlanModel,
          namespace,
        }
      : null,
  );

  const vmMigPlans = getVMMigPlans(vm, migPlans)?.sort(sortMigPlansByCreationTimestamp);

  const latestVMMigPlan = vmMigPlans?.[vmMigPlans?.length - 1];

  return [latestVMMigPlan, migPlansLoaded];
};

export default useCurrentStorageMigration;
