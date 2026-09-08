import { useState } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

type UseSelectedVMs = () => {
  isSelected: (vm: V1VirtualMachine) => boolean;
  onSelect: (vm: V1VirtualMachine) => void;
  selectedVMs: V1VirtualMachine[];
  setSelectedVMs: (vms: V1VirtualMachine[]) => void;
};

const useSelectedVMs: UseSelectedVMs = () => {
  const [selectedVMs, setSelectedVMs] = useState<V1VirtualMachine[]>([]);

  const isSameVM = (vmA: V1VirtualMachine, vmB: V1VirtualMachine): boolean => {
    return getName(vmA) === getName(vmB) && getNamespace(vmA) === getNamespace(vmB);
  };

  const selectVM = (vm: V1VirtualMachine): void => {
    setSelectedVMs([...selectedVMs, vm]);
  };

  const deselectVM = (vm: V1VirtualMachine): void => {
    setSelectedVMs(selectedVMs.filter((selected) => !isSameVM(selected, vm)));
  };

  const onSelect = (vm: V1VirtualMachine): void => {
    if (isSelected(vm)) {
      deselectVM(vm);
    } else {
      selectVM(vm);
    }
  };

  const isSelected = (vm: V1VirtualMachine): boolean =>
    selectedVMs.some((selected) => isSameVM(selected, vm));

  return { isSelected, onSelect, selectedVMs, setSelectedVMs };
};

export default useSelectedVMs;
