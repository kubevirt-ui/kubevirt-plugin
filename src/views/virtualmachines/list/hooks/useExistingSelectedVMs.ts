import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { NO_MULTICLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { convertResourceArrayToMap } from '@kubevirt-utils/resources/shared';

import { selectedVMs } from '../selectedVMs';

const useExistingSelectedVMs = (vms: V1VirtualMachine[]) => {
  const vmsMapper = useMemo(() => convertResourceArrayToMap(vms, true, true), [vms]);

  const existingSelectedVirtualMachines = useMemo(
    () =>
      selectedVMs.value
        .map(
          (selectedVM) =>
            vmsMapper?.[selectedVM.cluster || NO_MULTICLUSTER_KEY]?.[selectedVM.namespace]?.[
              selectedVM.name
            ],
        )
        .filter(Boolean),
    [vmsMapper],
  );

  return existingSelectedVirtualMachines;
};

export default useExistingSelectedVMs;
