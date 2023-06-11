import * as React from 'react';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { useImmer } from 'use-immer';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

export type UpdateValidatedVM = (
  updateVM: ((vmDraft: WritableDraft<V1VirtualMachine>) => void) | V1VirtualMachine,
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

  const updateVM = (
    updatedVM: ((vmDraft: WritableDraft<V1VirtualMachine>) => void) | V1VirtualMachine,
  ) => {
    setLoaded(false);
    setError(undefined);

    // validate the updated vm with the backend (dry run)
    return k8sCreate<V1VirtualMachine>({
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
