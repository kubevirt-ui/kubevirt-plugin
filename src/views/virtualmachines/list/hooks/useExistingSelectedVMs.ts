import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { convertResourceArrayToMap } from '@kubevirt-utils/resources/shared';

import { selectedVMs } from '../selectedVMs';

const useExistingSelectedVMs = (vms: V1VirtualMachine[]) => {
  const vmsMapper = useMemo(() => convertResourceArrayToMap(vms, true), [vms]);

  const existingSelectedVirtualMachines = useMemo(
    () =>
      selectedVMs.value
        .map((selectedVM) => vmsMapper?.[selectedVM.namespace]?.[selectedVM.name])
        .filter(Boolean),
    [selectedVMs.value, vmsMapper],
  );

  return existingSelectedVirtualMachines;
};

export default useExistingSelectedVMs;
