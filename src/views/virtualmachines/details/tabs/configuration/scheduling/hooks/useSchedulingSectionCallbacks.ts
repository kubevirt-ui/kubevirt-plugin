import { useCallback } from 'react';
import produce from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  applyRunStrategyToSpec,
  updateRunStrategy,
} from '@kubevirt-utils/components/RunStrategyModal/utils';
import { type RunStrategy } from '@kubevirt-utils/resources/vm/utils/constants';
import { updateVM } from '@kubevirt-utils/resources/vm/utils/update';

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
    (updatedVM: V1VirtualMachine) => (onUpdateVM ? onUpdateVM(updatedVM) : updateVM(updatedVM)),
    [onUpdateVM],
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
