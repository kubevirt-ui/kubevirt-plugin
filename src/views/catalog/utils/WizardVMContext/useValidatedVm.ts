import * as React from 'react';
import produce from 'immer';
import { Draft } from 'immer';
import { useImmer } from 'use-immer';

import { VirtualMachineModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

export type UpdateValidatedVM = (
  updateVM: ((vmDraft: Draft<V1VirtualMachine>) => void) | V1VirtualMachine,
) => Promise<void>;

type UseValidatedVMValues = {
  error: any;
  loaded: boolean;
  updateVM: UpdateValidatedVM;
  vm: V1VirtualMachine;
};

export const useValidatedVM = (initialVM: V1VirtualMachine): UseValidatedVMValues => {
  const [vm, setVM] = useImmer<V1VirtualMachine>(initialVM);
  const [loaded, setLoaded] = React.useState<boolean>(true);
  const [error, setError] = React.useState<any>();

  const updateVM = (updatedVM: ((vmDraft: Draft<V1VirtualMachine>) => void) | V1VirtualMachine) => {
    setLoaded(false);
    setError(undefined);

    // validate the updated vm with the backend (dry run)
    return kubevirtK8sCreate<V1VirtualMachine>({
      cluster: getCluster(vm),
      data: typeof updatedVM === 'function' ? produce(vm, updatedVM) : updatedVM,
      model: VirtualMachineModel,
      queryParams: {
        dryRun: 'All',
        fieldManager: 'kubectl-create',
      },
    })
      .then(setVM)
      .catch((err) => {
        setError(err);
        return Promise.reject(err);
      })
      .finally(() => setLoaded(true));
  };

  return {
    error,
    loaded,
    updateVM,
    vm,
  };
};
