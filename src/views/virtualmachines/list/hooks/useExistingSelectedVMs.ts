import { useMemo } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { convertResourceArrayToMapWithCluster } from '@kubevirt-utils/resources/shared';
import { useSignals } from '@preact/signals-react/runtime';

import { selectedVMs } from '../selectedVMs';

const useExistingSelectedVMs = (vms: V1VirtualMachine[]): V1VirtualMachine[] => {
  useSignals();

  const vmsMapper = useMemo(() => convertResourceArrayToMapWithCluster(vms, true), [vms]);

  return selectedVMs.value
    .map(
      (selectedVM) =>
        vmsMapper?.[selectedVM.cluster ?? SINGLE_CLUSTER_KEY]?.[selectedVM.namespace]?.[
          selectedVM.name
        ],
    )
    .filter(Boolean);
};

export default useExistingSelectedVMs;
