import { useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

type UseSelectedVMs = () => {
  isSelected: (vm: V1VirtualMachine) => boolean;
  onSelect: (vm: V1VirtualMachine) => void;
  selectedVMs: V1VirtualMachine[];
  setSelectedVMs: (vms: V1VirtualMachine[]) => void;
};

const useSelectedVMs: UseSelectedVMs = () => {
  const [selectedVMs, setSelectedVMs] = useState<V1VirtualMachine[]>([]);

  const isSameVM = (v1: V1VirtualMachine, v2: V1VirtualMachine) => {
    return getName(v1) === getName(v2) && getNamespace(v1) === getNamespace(v2);
  };

  const selectVM = (vm: V1VirtualMachine) => {
    setSelectedVMs([...selectedVMs, vm]);
  };

  const deselectVM = (vm: V1VirtualMachine) => {
    setSelectedVMs(selectedVMs.filter((v) => !isSameVM(v, vm)));
  };

  const onSelect = (vm: V1VirtualMachine) => {
    if (isSelected(vm)) {
      deselectVM(vm);
    } else {
      selectVM(vm);
    }
  };

  const isSelected = (vm: V1VirtualMachine) => selectedVMs.some((v) => isSameVM(v, vm));

  return { isSelected, onSelect, selectedVMs, setSelectedVMs };
};

export default useSelectedVMs;
