import { useCallback } from 'react';
import produce from 'immer';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  applyRunStrategyToSpec,
  updateRunStrategy,
} from '@kubevirt-utils/components/RunStrategyModal/utils';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { type RunStrategy } from '@kubevirt-utils/resources/vm/utils/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sUpdate } from '@multicluster/k8sRequests';

type UseSchedulingSectionCallbacksProps = {
  onUpdateVM?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
};

type UseSchedulingSectionCallbacksReturn = {
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  onSubmitRunStrategy: (runStrategy: RunStrategy) => Promise<V1VirtualMachine>;
};

const useSchedulingSectionCallbacks = ({
  onUpdateVM,
  vm,
}: UseSchedulingSectionCallbacksProps): UseSchedulingSectionCallbacksReturn => {
  const onSubmit = useCallback(
    (updatedVM: V1VirtualMachine) =>
      onUpdateVM
        ? onUpdateVM(updatedVM)
        : (kubevirtK8sUpdate({
            cluster: getCluster(vm),
            data: updatedVM,
            model: VirtualMachineModel,
            name: getName(updatedVM),
            ns: getNamespace(updatedVM),
          }) as Promise<V1VirtualMachine>),
    [onUpdateVM, vm],
  );

  const onSubmitRunStrategy = useCallback(
    (runStrategy: RunStrategy) =>
      onUpdateVM
        ? onUpdateVM(produce(vm, (draft) => applyRunStrategyToSpec(draft.spec, runStrategy)))
        : updateRunStrategy(vm, runStrategy),
    [onUpdateVM, vm],
  );

  return {
    onSubmit,
    onSubmitRunStrategy,
  };
};

export default useSchedulingSectionCallbacks;
