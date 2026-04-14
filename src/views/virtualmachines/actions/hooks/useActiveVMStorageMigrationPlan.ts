import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  modelToGroupVersionKind,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { isMigrationCompleted } from '@kubevirt-utils/resources/migrations/utils';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

const useActiveVMStorageMigrationPlan = (
  vm: V1VirtualMachine,
): MultiNamespaceVirtualMachineStorageMigrationPlan | null => {
  const namespace = getNamespace(vm);
  const vmName = getName(vm);

  const [storageMigPlans] = useK8sWatchData<MultiNamespaceVirtualMachineStorageMigrationPlan[]>(
    vm && {
      cluster: getCluster(vm),
      groupVersionKind: modelToGroupVersionKind(
        MultiNamespaceVirtualMachineStorageMigrationPlanModel,
      ),
      isList: true,
      namespace,
      namespaced: true,
    },
  );

  return useMemo(() => {
    if (!storageMigPlans || !vmName) return null;

    return (
      storageMigPlans.find((plan) => {
        if (plan?.metadata?.deletionTimestamp) return false;
        if (isMigrationCompleted(plan)) return false;

        return plan?.spec?.namespaces?.some(
          (ns) =>
            ns?.name === namespace &&
            ns?.virtualMachines?.some((vmSpec) => vmSpec?.name === vmName),
        );
      }) ?? null
    );
  }, [storageMigPlans, vmName, namespace]);
};

export default useActiveVMStorageMigrationPlan;
