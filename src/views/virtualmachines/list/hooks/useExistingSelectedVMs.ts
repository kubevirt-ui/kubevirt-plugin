import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { convertResourceArrayToMapWithCluster } from '@kubevirt-utils/resources/shared';

import { selectedVMs } from '../selectedVMs';

const useExistingSelectedVMs = (vms: V1VirtualMachine[]) => {
  const vmsMapper = useMemo(() => convertResourceArrayToMapWithCluster(vms, true), [vms]);

  const existingSelectedVirtualMachines = useMemo(
    () =>
      selectedVMs.value
        .map(
          (selectedVM) =>
            vmsMapper?.[selectedVM.cluster || SINGLE_CLUSTER_KEY]?.[selectedVM.namespace]?.[
              selectedVM.name
            ],
        )
        .filter(Boolean),
    [vmsMapper],
  );

  return existingSelectedVirtualMachines;
};

export default useExistingSelectedVMs;
