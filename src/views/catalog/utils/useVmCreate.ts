import { useState } from 'react';
import produce from 'immer';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

type CreateVMArguments = {
  namespace: string;
  startVM: boolean;
  onFullfilled: (vm: V1VirtualMachine) => void;
};

export const useVmCreate = (): {
  createVM: (
    vm: V1VirtualMachine,
    { namespace, startVM, onFullfilled }: CreateVMArguments,
  ) => Promise<void>;
  loaded: boolean;
  error: any;
} => {
  const [loaded, setLoaded] = useState<boolean>(true);
  const [error, setError] = useState<any>();

  const createVM = (
    vm: V1VirtualMachine,
    { namespace, startVM, onFullfilled }: CreateVMArguments,
  ) => {
    setLoaded(false);
    setError(undefined);

    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      vmDraft.metadata.namespace = namespace;
      vmDraft.spec.running = startVM;
    });

    return k8sCreate<V1VirtualMachine>({
      model: VirtualMachineModel,
      data: updatedVM,
    })
      .then(onFullfilled)
      .catch(setError)
      .finally(() => setLoaded(true));
  };

  return {
    createVM,
    loaded,
    error,
  };
};
