import { useState } from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

type CreateVMArguments = {
  name?: string;
  namespace: string;
  startVM: boolean;
  onFullfilled: (vm: V1VirtualMachine) => void;
};

export const useVmCreate = (): {
  createVM: (
    vm: V1VirtualMachine,
    { name, namespace, startVM, onFullfilled }: CreateVMArguments,
  ) => Promise<void>;
  loaded: boolean;
  error: any;
} => {
  const [loaded, setLoaded] = useState<boolean>(true);
  const [error, setError] = useState<any>();

  const createVM = (
    vm: V1VirtualMachine,
    { name, namespace, startVM, onFullfilled }: CreateVMArguments,
  ) => {
    setLoaded(false);
    setError(undefined);

    vm.metadata.namespace = namespace;
    if (name) {
      vm.metadata.name = name;
    }
    if (startVM) {
      vm.spec.running = true;
    }

    return k8sCreate<V1VirtualMachine>({
      model: VirtualMachineModel,
      data: vm,
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
