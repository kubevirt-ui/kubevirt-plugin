import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { PodsAdapterDataType } from '@openshift-console/dynamic-plugin-sdk';

import usePodsForVM from './usePodsForVM';

type UsePodsAdapterForVM = (vm: V1VirtualMachine) => PodsAdapterDataType;

const usePodsAdapterForVM: UsePodsAdapterForVM = (vm) => {
  const { loaded, loadError, podData } = usePodsForVM(vm);
  return useMemo(
    () => ({ loaded, loadError, pods: podData?.pods ?? [] }),
    [loadError, loaded, podData],
  );
};

export default usePodsAdapterForVM;
